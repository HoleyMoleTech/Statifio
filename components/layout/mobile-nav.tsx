"use client"

import type React from "react"

import { Home, BarChart3, Calendar, Settings, LogIn, Shield, Crown } from "@/lib/icons"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/use-auth"
import { UserAvatar } from "@/components/ui/user-avatar"
import { useProfile } from "@/contexts/profile-context"
import { useNavigation } from "@/contexts/navigation-context"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

interface UserProfile {
  avatar_url?: string
  username?: string
}

const getNavItems = (isAuthenticated: boolean, isAdmin: boolean, isPremium: boolean) => {
  const baseItems = [
    {
      name: "Home",
      href: "/",
      icon: Home,
    },
    {
      name: "Stats",
      href: "/stats",
      icon: BarChart3,
    },
    {
      name: "Events",
      href: "/events",
      icon: Calendar,
    },
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: BarChart3,
    },
  ]

  if (isAuthenticated) {
    if (isAdmin) {
      baseItems.push({
        name: "Admin",
        href: "/admin/users",
        icon: Shield,
      })
    }

    if (!isPremium) {
      baseItems.push({
        name: "Premium",
        href: "/premium",
        icon: Crown,
      })
    }

    baseItems.push({
      name: "Profile",
      href: "/profile",
      icon: Settings,
      showAvatar: true,
    })
  } else {
    baseItems.push({
      name: "Login",
      href: "/auth/login",
      icon: LogIn,
    })
  }

  return baseItems
}

export function MobileNav() {
  const pathname = usePathname()
  const { user, isLoading } = useAuth()
  const { profile } = useProfile()
  const { navigateTo, isLoading: navLoading } = useNavigation()
  const [userStatus, setUserStatus] = useState({ isAdmin: false, isPremium: false })

  const isAuthenticated = !isLoading && !!user

  useEffect(() => {
    const fetchUserStatus = async () => {
      if (!user) return

      const supabase = createClient()
      const { data } = await supabase.from("users").select("is_admin, is_premium").eq("id", user.id).single()

      if (data) {
        setUserStatus({
          isAdmin: data.is_admin || false,
          isPremium: data.is_premium || false,
        })
      }
    }

    fetchUserStatus()
  }, [user])

  const navItems = getNavItems(isAuthenticated, userStatus.isAdmin, userStatus.isPremium)

  const handleNavClick = (href: string, e: React.MouseEvent) => {
    e.preventDefault()
    console.log("[v0] MobileNav: Navigating to", href)
    navigateTo(href)
  }

  return (
    <nav className="bg-card border-t border">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href === "/admin/users" && pathname.startsWith("/admin"))
          const Icon = item.icon

          return (
            <button
              key={item.name}
              onClick={(e) => handleNavClick(item.href, e)}
              disabled={navLoading}
              className={cn(
                "flex flex-col items-center justify-center py-2 px-2 rounded-lg transition-colors",
                "min-w-[50px] text-xs font-medium disabled:opacity-50",
                navLoading ? "opacity-50 cursor-not-allowed" : "",
                isActive ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-muted",
              )}
            >
              {item.showAvatar && user ? (
                <UserAvatar
                  avatarUrl={profile?.avatar_url}
                  userInitial={profile?.username?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || "U"}
                  size="sm"
                  className="mb-1"
                />
              ) : (
                <Icon className={cn("h-4 w-4 mb-1", navLoading && "animate-pulse")} />
              )}
              <span>{item.name}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
