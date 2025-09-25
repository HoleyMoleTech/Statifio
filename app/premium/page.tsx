import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { PremiumUpgradeCard } from "@/components/premium/premium-upgrade-card"
import { PremiumFeatures } from "@/components/premium/premium-features"
import { MobileLayout } from "@/components/layout/mobile-layout"
import { Crown, Zap, Shield, Star } from "lucide-react"

export default async function PremiumPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  // Get user's current premium status
  const { data: userData } = await supabase
    .from("users")
    .select("is_premium, premium_expires_at")
    .eq("id", user.id)
    .single()

  const isPremium = userData?.is_premium || false
  const premiumExpiresAt = userData?.premium_expires_at

  return (
    <MobileLayout title="Premium" showSearch={false} showNotifications={true} showMenu={true} showBottomNav={true}>
      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center mb-4">
          <Crown className="h-12 w-12 text-primary mr-3" />
          <h1 className="text-4xl font-bold text-foreground">Statifio Premium</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Unlock the full potential of esports analytics with ad-free browsing, exclusive features, and priority
          support.
        </p>
      </div>

      {/* Current Status */}
      {isPremium && (
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-6 mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Crown className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-semibold text-foreground">You're Premium!</h2>
          </div>
          <p className="text-muted-foreground">
            {premiumExpiresAt
              ? `Your premium subscription expires on ${new Date(premiumExpiresAt).toLocaleDateString()}`
              : "You have an active premium subscription"}
          </p>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-12 items-start">
        {/* Features */}
        <div className="space-y-8">
          <PremiumFeatures />

          {/* Benefits Grid */}
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="bg-card rounded-lg p-6 border">
              <Zap className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-semibold mb-2">Lightning Fast</h3>
              <p className="text-sm text-muted-foreground">No ads means faster page loads and smoother navigation</p>
            </div>

            <div className="bg-card rounded-lg p-6 border">
              <Shield className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-semibold mb-2">Priority Support</h3>
              <p className="text-sm text-muted-foreground">Get help faster with dedicated premium support</p>
            </div>

            <div className="bg-card rounded-lg p-6 border">
              <Star className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-semibold mb-2">Exclusive Features</h3>
              <p className="text-sm text-muted-foreground">Access advanced analytics and premium-only content</p>
            </div>

            <div className="bg-card rounded-lg p-6 border">
              <Crown className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-semibold mb-2">Premium Badge</h3>
              <p className="text-sm text-muted-foreground">Show off your premium status with exclusive badges</p>
            </div>
          </div>
        </div>

        {/* Upgrade Card */}
        <div className="lg:sticky lg:top-8">
          <PremiumUpgradeCard userId={user.id} isPremium={isPremium} premiumExpiresAt={premiumExpiresAt} />
        </div>
      </div>
    </MobileLayout>
  )
}
