import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { nexiService } from "@/lib/services/nexi-service"
import { NEXI_CONFIG } from "@/lib/config/nexi"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { planId, amount, currency = NEXI_CONFIG.currency } = body

    // Validate required fields
    if (!planId || !amount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Initialize Nexi service
    console.log("[v0] Attempting to initialize Nexi payment service...")
    const initialized = await nexiService.initialize()
    if (!initialized) {
      console.error("[v0] Nexi service initialization failed")
      return NextResponse.json(
        {
          error: "Failed to initialize payment service",
          details: "Nexi API keys may not be configured. Please check the database setup.",
        },
        { status: 503 },
      )
    }

    console.log("[v0] Nexi service initialized, creating payment...")

    // Create payment request
    const paymentRequest = {
      order: {
        items: [
          {
            reference: planId,
            name: `Premium Subscription - ${planId}`,
            quantity: 1,
            unit: "pcs",
            unitPrice: Math.round(amount * 100), // Convert to cents
            grossTotalAmount: Math.round(amount * 100),
            netTotalAmount: Math.round(amount * 100),
          },
        ],
        amount: Math.round(amount * 100), // Convert to cents
        currency: currency,
        reference: `premium_${user.id}_${Date.now()}`,
      },
      checkout: {
        url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/premium/success`,
        termsUrl: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/terms`,
        merchantHandlesConsumerData: true,
        consumer: {
          email: user.email,
        },
      },
      notifications: {
        webhooks: [
          {
            eventName: "payment.checkout.completed",
            url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/payments/nexi/webhook`,
          },
          {
            eventName: "payment.reservation.created",
            url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/payments/nexi/webhook`,
          },
        ],
      },
    }

    // Create payment with Nexi
    const paymentResponse = await nexiService.createPayment(paymentRequest)

    // Store payment record in database
    const { error: dbError } = await supabase.from("payments").insert({
      user_id: user.id,
      amount: amount,
      currency: currency,
      status: "pending",
      payment_method: "nexi",
      stripe_payment_intent_id: paymentResponse.paymentId, // Reusing field for Nexi payment ID
    })

    if (dbError) {
      console.error("Database error:", dbError)
      // Continue anyway - payment was created with Nexi
    }

    return NextResponse.json({
      success: true,
      paymentId: paymentResponse.paymentId,
      checkoutKey: nexiService.getCheckoutKey(),
    })
  } catch (error: any) {
    console.error("Error creating Nexi payment:", error)
    return NextResponse.json({ error: error.message || "Failed to create payment" }, { status: 500 })
  }
}
