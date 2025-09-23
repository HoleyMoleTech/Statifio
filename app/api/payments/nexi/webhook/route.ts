import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { nexiService } from "@/lib/services/nexi-service"
import type { NexiWebhookEvent } from "@/lib/config/nexi"

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as NexiWebhookEvent
    const supabase = await createClient()

    console.log("[v0] Nexi webhook received:", body.event, body.data.paymentId)

    // Initialize Nexi service to verify webhook
    const initialized = await nexiService.initialize()
    if (!initialized) {
      console.error("Failed to initialize Nexi service for webhook")
      return NextResponse.json({ error: "Service unavailable" }, { status: 503 })
    }

    // Handle different webhook events
    switch (body.event) {
      case "payment.checkout.completed":
      case "payment.reservation.created":
        await handlePaymentSuccess(body, supabase)
        break

      case "payment.reservation.failed":
      case "payment.charge.failed":
        await handlePaymentFailure(body, supabase)
        break

      case "payment.charge.created":
        await handlePaymentCharged(body, supabase)
        break

      case "payment.refund.completed":
        await handleRefundCompleted(body, supabase)
        break

      default:
        console.log(`[v0] Unhandled Nexi webhook event: ${body.event}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Nexi webhook error:", error)
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 })
  }
}

async function handlePaymentSuccess(event: NexiWebhookEvent, supabase: any) {
  try {
    const paymentId = event.data.paymentId

    // Get payment details from Nexi
    const paymentDetails = await nexiService.getPayment(paymentId)

    // Find the payment record in our database
    const { data: payment, error: findError } = await supabase
      .from("payments")
      .select("*, users(*)")
      .eq("stripe_payment_intent_id", paymentId) // Using this field for Nexi payment ID
      .single()

    if (findError || !payment) {
      console.error("Payment not found in database:", paymentId)
      return
    }

    // Update payment status
    const { error: updateError } = await supabase
      .from("payments")
      .update({
        status: "completed",
        updated_at: new Date().toISOString(),
      })
      .eq("stripe_payment_intent_id", paymentId)

    if (updateError) {
      console.error("Error updating payment status:", updateError)
      return
    }

    // Update user premium status
    const expiryDate = new Date()
    // Assume monthly subscription for now - could be enhanced to detect plan type
    expiryDate.setMonth(expiryDate.getMonth() + 1)

    const { error: userError } = await supabase
      .from("users")
      .update({
        is_premium: true,
        premium_expires_at: expiryDate.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", payment.user_id)

    if (userError) {
      console.error("Error updating user premium status:", userError)
    } else {
      console.log(`[v0] User ${payment.user_id} upgraded to premium via Nexi payment ${paymentId}`)
    }
  } catch (error) {
    console.error("Error handling payment success:", error)
  }
}

async function handlePaymentFailure(event: NexiWebhookEvent, supabase: any) {
  try {
    const paymentId = event.data.paymentId

    // Update payment status to failed
    const { error } = await supabase
      .from("payments")
      .update({
        status: "failed",
        updated_at: new Date().toISOString(),
      })
      .eq("stripe_payment_intent_id", paymentId)

    if (error) {
      console.error("Error updating failed payment:", error)
    } else {
      console.log(`[v0] Payment ${paymentId} marked as failed`)
    }
  } catch (error) {
    console.error("Error handling payment failure:", error)
  }
}

async function handlePaymentCharged(event: NexiWebhookEvent, supabase: any) {
  try {
    const paymentId = event.data.paymentId

    // Update payment status to charged (captured)
    const { error } = await supabase
      .from("payments")
      .update({
        status: "charged",
        updated_at: new Date().toISOString(),
      })
      .eq("stripe_payment_intent_id", paymentId)

    if (error) {
      console.error("Error updating charged payment:", error)
    } else {
      console.log(`[v0] Payment ${paymentId} charged successfully`)
    }
  } catch (error) {
    console.error("Error handling payment charge:", error)
  }
}

async function handleRefundCompleted(event: NexiWebhookEvent, supabase: any) {
  try {
    const paymentId = event.data.paymentId

    // Update payment status to refunded
    const { error } = await supabase
      .from("payments")
      .update({
        status: "refunded",
        updated_at: new Date().toISOString(),
      })
      .eq("stripe_payment_intent_id", paymentId)

    if (error) {
      console.error("Error updating refunded payment:", error)
    } else {
      console.log(`[v0] Payment ${paymentId} refunded successfully`)
    }
  } catch (error) {
    console.error("Error handling refund:", error)
  }
}
