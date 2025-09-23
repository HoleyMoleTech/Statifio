import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X, Check } from "lucide-react"

export function PremiumFeatures() {
  const features = [
    {
      name: "Advertisements",
      free: "Banner & video ads",
      premium: "Completely ad-free",
      freeIcon: X,
      premiumIcon: Check,
    },
    {
      name: "Analytics Depth",
      free: "Basic stats",
      premium: "Advanced analytics & insights",
      freeIcon: X,
      premiumIcon: Check,
    },
    {
      name: "Data Export",
      free: "Limited exports",
      premium: "Unlimited CSV/JSON exports",
      freeIcon: X,
      premiumIcon: Check,
    },
    {
      name: "Support",
      free: "Community support",
      premium: "Priority email support",
      freeIcon: X,
      premiumIcon: Check,
    },
    {
      name: "Content Access",
      free: "Public content only",
      premium: "Exclusive premium content",
      freeIcon: X,
      premiumIcon: Check,
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Free vs Premium</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {features.map((feature, index) => (
            <div key={index} className="grid grid-cols-3 gap-4 items-center py-3 border-b last:border-b-0">
              <div className="font-medium">{feature.name}</div>

              <div className="flex items-center gap-2">
                <feature.freeIcon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{feature.free}</span>
              </div>

              <div className="flex items-center gap-2">
                <feature.premiumIcon className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">{feature.premium}</span>
                <Badge variant="secondary" className="text-xs ml-auto">
                  Premium
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
