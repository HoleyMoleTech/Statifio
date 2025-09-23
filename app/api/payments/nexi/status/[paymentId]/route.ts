import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { nexiService } from "@/lib/services/nexi-service"

export async function GET(request: NextRequest, { params }: { params: { paymentId: string } }) {
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

    const paymentId = params.paymentId

    // Initialize Nexi service
    const initialized = await nexiService.initialize()
    if (!initialized) {
      return NextResponse.json({ error: "Payment service unavailable" }, { status: 503 })
    }

    // Get payment details from Nexi
    const paymentDetails = await nexiService.getPayment(paymentId)

    // Get payment record from our database
    const { data: dbPayment, error: dbError } = await supabase
      .from("payments")
      .select("*")
      .eq("stripe_payment_intent_id", paymentId)
      .eq("user_id", user.id) // Ensure user can only see their own payments
      .single()

    if (dbError && dbError.code !== "PGRST116") {
      // PGRST116 = not found
      console.error("Database error:", dbError)
    }

    return NextResponse.json({
      success: true,
      payment: {
        id: paymentDetails.paymentId,
        status: paymentDetails.payment.summary ? "completed" : "pending",
        amount: paymentDetails.payment.orderDetails.amount / 100, // Convert from cents
        currency: paymentDetails.payment.orderDetails.currency,
        created: paymentDetails.payment.created,
        dbStatus: dbPayment?.status || "unknown",
      },
    })
  } catch (error: any) {
    console.error("Error fetching payment status:", error)
    return NextResponse.json({ error: error.message || "Failed to fetch payment status" }, { status: 500 })
  }
}
