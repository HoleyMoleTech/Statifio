"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Users, CreditCard, Settings, BarChart3, Shield, Trophy } from "lucide-react"

const adminNavItems = [
  {
    name: "Users",
    href: "/admin/users",
    icon: Users,
    description: "Manage user accounts and permissions",
  },
  {
    name: "Teams",
    href: "/admin/teams",
    icon: Trophy,
    description: "Manage teams and rosters",
  },
  {
    name: "Payments",
    href: "/admin/payments",
    icon: CreditCard,
    description: "View payment history and subscriptions",
  },
  {
    name: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
    description: "Platform usage and performance metrics",
  },
  {
    name: "Settings",
    href: "/admin/settings",
    icon: Settings,
    description: "API keys and platform configuration",
  },
  {
    name: "Security",
    href: "/admin/security",
    icon: Shield,
    description: "Security monitoring and access logs",
  },
]

export function AdminNav() {
  const pathname = usePathname()

  return (
    <nav className="bg-card border rounded-lg p-4 mb-6">
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        {adminNavItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center p-4 rounded-lg transition-colors text-center",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="h-6 w-6 mb-2" />
              <span className="font-medium text-sm">{item.name}</span>
              <span className="text-xs opacity-75 mt-1">{item.description}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
