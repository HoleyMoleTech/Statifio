"use client"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { NexiEmbeddedCheckout } from "../payment/nexi-embedded-checkout"
import { CheckCircle, X } from "lucide-react"

interface Plan {
  id: string
  name: string
  price: number
  period: string
  popular?: boolean
}

interface NexiPaymentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
  plans: Plan[]
}

export function NexiPaymentDialog({ open, onOpenChange, userId, plans }: NexiPaymentDialogProps) {
  const [selectedPlan, setSelectedPlan] = useState(plans.find((p) => p.popular) || plans[0])
  const [paymentStep, setPaymentStep] = useState<"plan-selection" | "checkout" | "success">("plan-selection")
  const [paymentId, setPaymentId] = useState<string | null>(null)

  const handlePlanSelect = (plan: Plan) => {
    setSelectedPlan(plan)
  }

  const handleProceedToCheckout = () => {
    setPaymentStep("checkout")
  }

  const handlePaymentSuccess = (paymentId: string) => {
    setPaymentId(paymentId)
    setPaymentStep("success")
  }

  const handlePaymentError = (error: string) => {
    console.error("Payment error:", error)
    // Error is handled within the checkout component
  }

  const handleClose = () => {
    setPaymentStep("plan-selection")
    setPaymentId(null)
    onOpenChange(false)
  }

  const handleBackToPlanSelection = () => {
    setPaymentStep("plan-selection")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>
              {paymentStep === "plan-selection" && "Choose Your Plan"}
              {paymentStep === "checkout" && "Complete Payment"}
              {paymentStep === "success" && "Payment Successful"}
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Plan Selection Step */}
        {paymentStep === "plan-selection" && (
          <div className="space-y-6">
            <div className="grid gap-4">
              {plans.map((plan) => (
                <Card
                  key={plan.id}
                  className={`cursor-pointer transition-colors ${
                    selectedPlan.id === plan.id ? "border-primary bg-primary/5" : "hover:border-primary/50"
                  }`}
                  onClick={() => handlePlanSelect(plan)}
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
                            €{plan.price}/{plan.period}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 bg-transparent" onClick={handleClose}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleProceedToCheckout}>
                Continue to Payment
              </Button>
            </div>
          </div>
        )}

        {/* Checkout Step */}
        {paymentStep === "checkout" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Button variant="ghost" size="sm" onClick={handleBackToPlanSelection}>
                ← Back to Plans
              </Button>
            </div>

            <NexiEmbeddedCheckout
              userId={userId}
              plans={plans}
              selectedPlan={selectedPlan}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
              onCancel={handleBackToPlanSelection}
            />
          </div>
        )}

        {/* Success Step */}
        {paymentStep === "success" && (
          <div className="text-center space-y-6 py-8">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">Payment Successful!</h3>
              <p className="text-muted-foreground">Welcome to Statifio Premium! Your subscription is now active.</p>
              {paymentId && <p className="text-xs text-muted-foreground mt-2">Payment ID: {paymentId}</p>}
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">What's next?</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Access to premium statistics and analytics</li>
                <li>• Advanced filtering and search capabilities</li>
                <li>• Priority customer support</li>
                <li>• Export data in multiple formats</li>
              </ul>
            </div>

            <Button onClick={handleClose} className="w-full">
              Start Using Premium Features
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
