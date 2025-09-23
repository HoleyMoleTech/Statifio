import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { nexiService } from "@/lib/services/nexi-service"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get current user and check admin status
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("is_admin")
      .eq("id", user.id)
      .single()

    if (userError || !userData?.is_admin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const body = await request.json()
    const { paymentId, amount, reason } = body

    // Validate required fields
    if (!paymentId) {
      return NextResponse.json({ error: "Payment ID is required" }, { status: 400 })
    }

    // Initialize Nexi service
    const initialized = await nexiService.initialize()
    if (!initialized) {
      return NextResponse.json({ error: "Payment service unavailable" }, { status: 503 })
    }

    // Create refund with Nexi
    const refundResponse = await nexiService.refundPayment(paymentId, amount, reason)

    // Update payment status in database
    const { error: dbError } = await supabase
      .from("payments")
      .update({
        status: "refund_pending",
        updated_at: new Date().toISOString(),
      })
      .eq("stripe_payment_intent_id", paymentId)

    if (dbError) {
      console.error("Database error:", dbError)
      // Continue anyway - refund was initiated with Nexi
    }

    return NextResponse.json({
      success: true,
      refund: refundResponse,
    })
  } catch (error: any) {
    console.error("Error creating refund:", error)
    return NextResponse.json({ error: error.message || "Failed to create refund" }, { status: 500 })
  }
}
