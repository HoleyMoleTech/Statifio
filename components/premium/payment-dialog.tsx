"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CreditCard, Lock, Shield } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { NexiPaymentDialog } from "./nexi-payment-dialog"

interface Plan {
  id: string
  name: string
  price: number
  period: string
  popular?: boolean
}

interface PaymentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
  plans: Plan[]
}

export function PaymentDialog({ open, onOpenChange, userId, plans }: PaymentDialogProps) {
  const [selectedPlan, setSelectedPlan] = useState(plans.find((p) => p.popular) || plans[0])
  const [paymentMethod, setPaymentMethod] = useState<"stripe" | "nexi">("nexi") // Default to Nexi
  const [loading, setLoading] = useState(false)
  const [paymentData, setPaymentData] = useState({
    cardholderName: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
  })

  const router = useRouter()
  const supabase = createClient()

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // In a real implementation, you would integrate with Stripe or another payment processor
      // For demo purposes, we'll simulate a successful payment

      // Calculate premium expiry date
      const expiryDate = new Date()
      if (selectedPlan.period === "month") {
        expiryDate.setMonth(expiryDate.getMonth() + 1)
      } else {
        expiryDate.setFullYear(expiryDate.getFullYear() + 1)
      }

      // Create payment record
      const { error: paymentError } = await supabase.from("payments").insert({
        user_id: userId,
        amount: selectedPlan.price,
        currency: "USD",
        status: "completed",
        payment_method: paymentMethod,
        stripe_payment_intent_id: paymentMethod === "stripe" ? `pi_demo_${Date.now()}` : null,
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

      // Success - refresh page and close dialog
      router.refresh()
      onOpenChange(false)

      // Show success message
      alert("Payment successful! Welcome to Statifio Premium!")
    } catch (error) {
      console.error("Payment error:", error)
      alert("Payment failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
    const matches = v.match(/\d{4,16}/g)
    const match = (matches && matches[0]) || ""
    const parts = []
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    if (parts.length) {
      return parts.join(" ")
    } else {
      return v
    }
  }

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
    if (v.length >= 2) {
      return v.substring(0, 2) + "/" + v.substring(2, 4)
    }
    return v
  }

  return (
    <>
      {paymentMethod === "nexi" ? (
        <NexiPaymentDialog open={open} onOpenChange={onOpenChange} userId={userId} plans={plans} />
      ) : (
        <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Upgrade to Premium
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {/* Payment Method Selection */}
              <div className="space-y-3">
                <Label>Payment Method</Label>
                <div className="grid grid-cols-2 gap-3">
                  <Card
                    className={`cursor-pointer transition-colors ${
                      paymentMethod === "nexi" ? "border-primary bg-primary/5" : "hover:border-primary/50"
                    }`}
                    onClick={() => setPaymentMethod("nexi")}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-3 h-3 rounded-full border-2 ${
                            paymentMethod === "nexi" ? "border-primary bg-primary" : "border-muted-foreground"
                          }`}
                        />
                        <span className="text-sm font-medium">Nexi</span>
                      </div>
                    </CardContent>
                  </Card>
                  <Card
                    className={`cursor-pointer transition-colors ${
                      paymentMethod === "stripe" ? "border-primary bg-primary/5" : "hover:border-primary/50"
                    }`}
                    onClick={() => setPaymentMethod("stripe")}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-3 h-3 rounded-full border-2 ${
                            paymentMethod === "stripe" ? "border-primary bg-primary" : "border-muted-foreground"
                          }`}
                        />
                        <span className="text-sm font-medium">Stripe</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Plan Selection */}
              <div className="space-y-3">
                <Label>Select Plan</Label>
                <div className="grid gap-3">
                  {plans.map((plan) => (
                    <Card
                      key={plan.id}
                      className={`cursor-pointer transition-colors ${
                        selectedPlan.id === plan.id ? "border-primary bg-primary/5" : "hover:border-primary/50"
                      }`}
                      onClick={() => setSelectedPlan(plan)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-4 h-4 rounded-full border-2 ${
                                selectedPlan.id === plan.id ? "border-primary bg-primary" : "border-muted-foreground"
                              }`}
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{plan.name}</span>
                                {plan.popular && (
                                  <Badge variant="secondary" className="text-xs">
                                    Popular
                                  </Badge>
                                )}
                              </div>
                              <span className="text-sm text-muted-foreground">
                                ${plan.price}/{plan.period}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Legacy Stripe Form - kept for fallback */}
              {paymentMethod === "stripe" && (
                <form onSubmit={handlePayment} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cardholderName">Cardholder Name</Label>
                    <Input
                      id="cardholderName"
                      placeholder="John Doe"
                      value={paymentData.cardholderName}
                      onChange={(e) => setPaymentData((prev) => ({ ...prev, cardholderName: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input
                      id="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      value={paymentData.cardNumber}
                      onChange={(e) =>
                        setPaymentData((prev) => ({
                          ...prev,
                          cardNumber: formatCardNumber(e.target.value),
                        }))
                      }
                      maxLength={19}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expiryDate">Expiry Date</Label>
                      <Input
                        id="expiryDate"
                        placeholder="MM/YY"
                        value={paymentData.expiryDate}
                        onChange={(e) =>
                          setPaymentData((prev) => ({
                            ...prev,
                            expiryDate: formatExpiryDate(e.target.value),
                          }))
                        }
                        maxLength={5}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cvv">CVV</Label>
                      <Input
                        id="cvv"
                        placeholder="123"
                        value={paymentData.cvv}
                        onChange={(e) =>
                          setPaymentData((prev) => ({
                            ...prev,
                            cvv: e.target.value.replace(/\D/g, ""),
                          }))
                        }
                        maxLength={4}
                        required
                      />
                    </div>
                  </div>

                  {/* Security Notice */}
                  <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                    <Shield className="h-4 w-4 text-primary" />
                    <span className="text-sm text-muted-foreground">
                      Your payment information is secure and encrypted
                    </span>
                  </div>

                  {/* Total */}
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between text-lg font-semibold">
                      <span>Total</span>
                      <span>${selectedPlan.price}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1 bg-transparent"
                      onClick={() => onOpenChange(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" className="flex-1" disabled={loading}>
                      <Lock className="h-4 w-4 mr-2" />
                      {loading ? "Processing..." : `Pay $${selectedPlan.price}`}
                    </Button>
                  </div>
                </form>
              )}

              {paymentMethod === "nexi" && (
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 bg-transparent"
                    onClick={() => onOpenChange(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={() => {
                      onOpenChange(false)
                      // Open Nexi dialog
                      setTimeout(() => setPaymentMethod("nexi"), 100)
                    }}
                  >
                    <Lock className="h-4 w-4 mr-2" />
                    Continue with Nexi
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
