"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Crown, Check, CreditCard } from "lucide-react"
import { PaymentDialog } from "./payment-dialog"

interface PremiumUpgradeCardProps {
  userId: string
  isPremium: boolean
  premiumExpiresAt?: string
}

export function PremiumUpgradeCard({ userId, isPremium, premiumExpiresAt }: PremiumUpgradeCardProps) {
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)

  const plans = [
    {
      id: "monthly",
      name: "Monthly",
      price: 9.99,
      period: "month",
      description: "Perfect for trying premium features",
      popular: false,
    },
    {
      id: "yearly",
      name: "Yearly",
      price: 99.99,
      period: "year",
      description: "Best value - 2 months free!",
      popular: true,
      savings: "Save $20",
    },
  ]

  if (isPremium) {
    return (
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-2">
            <Crown className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">You're Premium!</CardTitle>
          <p className="text-muted-foreground">Enjoying ad-free browsing and exclusive features</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {premiumExpiresAt && (
            <div className="text-center p-4 bg-background rounded-lg">
              <p className="text-sm text-muted-foreground">Expires on</p>
              <p className="font-semibold">{new Date(premiumExpiresAt).toLocaleDateString()}</p>
            </div>
          )}

          <Button className="w-full bg-transparent" variant="outline" onClick={() => setPaymentDialogOpen(true)}>
            Extend Subscription
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {plans.map((plan) => (
        <Card key={plan.id} className={plan.popular ? "border-primary shadow-lg" : ""}>
          <CardHeader className="text-center relative">
            {plan.popular && (
              <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary">Most Popular</Badge>
            )}
            <CardTitle className="text-2xl">{plan.name}</CardTitle>
            <div className="space-y-2">
              <div className="text-4xl font-bold">
                ${plan.price}
                <span className="text-lg font-normal text-muted-foreground">/{plan.period}</span>
              </div>
              {plan.savings && (
                <Badge variant="secondary" className="text-xs">
                  {plan.savings}
                </Badge>
              )}
              <p className="text-sm text-muted-foreground">{plan.description}</p>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <ul className="space-y-3">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span className="text-sm">Ad-free browsing</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span className="text-sm">Advanced analytics</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span className="text-sm">Priority support</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span className="text-sm">Exclusive content</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span className="text-sm">Premium badge</span>
              </li>
            </ul>

            <Button className="w-full" size="lg" onClick={() => setPaymentDialogOpen(true)}>
              <CreditCard className="h-4 w-4 mr-2" />
              Upgrade to Premium
            </Button>
          </CardContent>
        </Card>
      ))}

      <PaymentDialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen} userId={userId} plans={plans} />
    </div>
  )
}
