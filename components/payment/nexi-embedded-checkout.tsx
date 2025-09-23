"use client"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CreditCard, Shield, XCircle } from "lucide-react"
import { NEXI_CONFIG } from "@/lib/config/nexi"
import { nexiService } from "@/lib/services/nexi-service"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface Plan {
  id: string
  name: string
  price: number
  period: string
  popular?: boolean
}

interface NexiEmbeddedCheckoutProps {
  userId: string
  plans: Plan[]
  selectedPlan: Plan
  onSuccess?: (paymentId: string) => void
  onError?: (error: string) => void
  onCancel?: () => void
}

// Declare Nexi global types
declare global {
  interface Window {
    Dibs?: {
      Checkout: (options: any) => {
        on: (event: string, callback: (data: any) => void) => void
        send: (event: string, data?: any) => void
        freezeCheckout: () => void
        thawCheckout: () => void
      }
    }
  }
}

export function NexiEmbeddedCheckout({
  userId,
  plans,
  selectedPlan,
  onSuccess,
  onError,
  onCancel,
}: NexiEmbeddedCheckoutProps) {
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [paymentId, setPaymentId] = useState<string | null>(null)
  const [checkoutInstance, setCheckoutInstance] = useState<any>(null)
  const checkoutRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const supabase = createClient()

  // Load Nexi Checkout SDK
  useEffect(() => {
    const loadNexiSDK = async () => {
      try {
        // Check if SDK is already loaded
        if (window.Dibs) {
          await initializeCheckout()
          return
        }

        // Load the Nexi Checkout SDK
        const script = document.createElement("script")
        script.src = NEXI_CONFIG.isProduction
          ? "https://checkout.dibspayment.eu/v1/checkout.js"
          : "https://test.checkout.dibspayment.eu/v1/checkout.js"
        script.async = true
        script.onload = () => initializeCheckout()
        script.onerror = () => {
          setError("Failed to load Nexi Checkout SDK")
          setLoading(false)
        }
        document.head.appendChild(script)

        return () => {
          document.head.removeChild(script)
        }
      } catch (err) {
        console.error("Error loading Nexi SDK:", err)
        setError("Failed to initialize payment system")
        setLoading(false)
      }
    }

    loadNexiSDK()
  }, [])

  const initializeCheckout = async () => {
    try {
      setLoading(true)
      setError(null)

      // Initialize Nexi service
      const initialized = await nexiService.initialize()
      if (!initialized) {
        throw new Error("Failed to initialize payment service")
      }

      // Create payment with Nexi
      const paymentRequest = {
        order: {
          items: [
            {
              reference: selectedPlan.id,
              name: `${selectedPlan.name} - ${selectedPlan.period}ly subscription`,
              quantity: 1,
              unit: "pcs",
              unitPrice: selectedPlan.price * 100, // Convert to cents
              grossTotalAmount: selectedPlan.price * 100,
              netTotalAmount: selectedPlan.price * 100,
            },
          ],
          amount: selectedPlan.price * 100, // Convert to cents
          currency: NEXI_CONFIG.currency,
          reference: `premium_${userId}_${Date.now()}`,
        },
        checkout: {
          termsUrl: `${window.location.origin}/terms`,
          merchantHandlesConsumerData: true,
        },
        notifications: {
          webhooks: [
            {
              eventName: "payment.checkout.completed",
              url: `${window.location.origin}/api/payments/nexi/webhook`,
            },
          ],
        },
      }

      const paymentResponse = await nexiService.createPayment(paymentRequest)
      setPaymentId(paymentResponse.paymentId)

      // Initialize embedded checkout
      if (window.Dibs && checkoutRef.current) {
        const checkoutKey = nexiService.getCheckoutKey()
        if (!checkoutKey) {
          throw new Error("Checkout key not available")
        }

        const checkout = window.Dibs.Checkout({
          checkoutKey: checkoutKey,
          paymentId: paymentResponse.paymentId,
          containerId: NEXI_CONFIG.checkout.containerId,
          language: "en-GB",
        })

        // Handle checkout events
        checkout.on("payment-completed", (data: any) => {
          console.log("[v0] Payment completed:", data)
          handlePaymentSuccess(data.paymentId)
        })

        checkout.on("payment-failed", (data: any) => {
          console.log("[v0] Payment failed:", data)
          handlePaymentError("Payment failed. Please try again.")
        })

        checkout.on("payment-cancelled", (data: any) => {
          console.log("[v0] Payment cancelled:", data)
          onCancel?.()
        })

        setCheckoutInstance(checkout)
      }

      setLoading(false)
    } catch (err: any) {
      console.error("Error initializing checkout:", err)
      setError(err.message || "Failed to initialize checkout")
      setLoading(false)
    }
  }

  const handlePaymentSuccess = async (paymentId: string) => {
    try {
      setProcessing(true)

      // Calculate premium expiry date
      const expiryDate = new Date()
      if (selectedPlan.period === "month") {
        expiryDate.setMonth(expiryDate.getMonth() + 1)
      } else {
        expiryDate.setFullYear(expiryDate.getFullYear() + 1)
      }

      // Create payment record in database
      const { error: paymentError } = await supabase.from("payments").insert({
        user_id: userId,
        amount: selectedPlan.price,
        currency: NEXI_CONFIG.currency,
        status: "completed",
        payment_method: "nexi",
        stripe_payment_intent_id: paymentId, // Reusing field for Nexi payment ID
      })

      if (paymentError) throw paymentError

      // Update user premium status
      const { error: userError } = await supabase
        .from("users")
        .update({
          is_premium: true,
          premium_expires_at: expiryDate.toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)

      if (userError) throw userError

      // Success callback
      onSuccess?.(paymentId)
      router.refresh()
    } catch (err: any) {
      console.error("Error processing payment success:", err)
      handlePaymentError("Payment completed but failed to update account. Please contact support.")
    } finally {
      setProcessing(false)
    }
  }

  const handlePaymentError = (errorMessage: string) => {
    setError(errorMessage)
    onError?.(errorMessage)
  }

  const retryPayment = () => {
    setError(null)
    initializeCheckout()
  }

  if (loading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-8">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <div className="text-center">
              <h3 className="font-semibold">Initializing Payment</h3>
              <p className="text-sm text-muted-foreground">Setting up secure checkout...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-6">
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <div className="flex gap-2 mt-4">
            <Button onClick={retryPayment} className="flex-1">
              Try Again
            </Button>
            <Button variant="outline" onClick={onCancel} className="flex-1 bg-transparent">
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Order Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{selectedPlan.name}</span>
                  {selectedPlan.popular && (
                    <Badge variant="secondary" className="text-xs">
                      Popular
                    </Badge>
                  )}
                </div>
                <span className="text-sm text-muted-foreground">{selectedPlan.period}ly subscription</span>
              </div>
            </div>
            <div className="text-right">
              <div className="font-semibold">
                {NEXI_CONFIG.currency} {selectedPlan.price}
              </div>
              <div className="text-sm text-muted-foreground">per {selectedPlan.period}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Embedded Checkout */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Secure Payment
          </CardTitle>
        </CardHeader>
        <CardContent>
          {processing && (
            <div className="flex items-center justify-center p-8">
              <div className="flex items-center gap-3">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span>Processing payment...</span>
              </div>
            </div>
          )}

          {/* Nexi Checkout Container */}
          <div
            id={NEXI_CONFIG.checkout.containerId}
            ref={checkoutRef}
            className={`min-h-[400px] ${processing ? "opacity-50 pointer-events-none" : ""}`}
          />

          {/* Security Notice */}
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg mt-4">
            <Shield className="h-4 w-4 text-primary" />
            <span className="text-sm text-muted-foreground">
              Your payment is secured by Nexi with 256-bit SSL encryption
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Payment Info */}
      <div className="text-center text-sm text-muted-foreground">
        <p>
          By completing this purchase, you agree to our{" "}
          <a href="/terms" className="text-primary hover:underline">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="/privacy" className="text-primary hover:underline">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  )
}
