"use client"

import { Bell, Search, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { Logo } from "@/components/ui/logo"
import { UserAvatar } from "@/components/ui/user-avatar"
import { useAuth } from "@/hooks/use-auth"
import { useProfile } from "@/contexts/profile-context"
import { useNavigation } from "@/contexts/navigation-context"
import { useMemo } from "react"

interface MobileHeaderProps {
  title: string
  showSearch?: boolean
  showNotifications?: boolean
  showMenu?: boolean
  showBack?: boolean
  onSearchClick?: () => void
  onNotificationClick?: () => void
  onMenuClick?: () => void
  onBackClick?: () => void
  notificationCount?: number
}

interface UserProfile {
  avatar_url?: string
  username?: string
}

export function MobileHeader({
  title,
  showSearch = true,
  showNotifications = true,
  showMenu = false,
  showBack = false,
  onSearchClick,
  onNotificationClick,
  onMenuClick,
  onBackClick,
  notificationCount = 0,
}: MobileHeaderProps) {
  const { user, isLoading } = useAuth()
  const { profile } = useProfile()
  const { navigateTo, isLoading: navLoading } = useNavigation()

  const handleProfileClick = () => {
    console.log("[v0] MobileHeader: Navigating to profile")
    navigateTo("/profile")
  }

  const avatarProps = useMemo(
    () => ({
      avatarUrl: profile?.avatar_url,
      userInitial: profile?.username?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || "U",
      size: "sm" as const,
      className: "cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all",
    }),
    [profile?.avatar_url, profile?.username, user?.email],
  )

  return (
    <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border">
      <div className="max-w-5xl mx-auto flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          {showMenu && (
            <Button variant="ghost" size="sm" onClick={onMenuClick} className="p-2" disabled={navLoading}>
              <Menu className="h-5 w-5" />
            </Button>
          )}
          {showBack && (
            <Button variant="ghost" size="sm" onClick={onBackClick} className="p-2" disabled={navLoading}>
              <svg
                className={`h-5 w-5 ${navLoading ? "animate-pulse" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Button>
          )}
          <Logo size="md" showText={false} />
        </div>

        <div className="flex items-center gap-2">
          {showSearch && (
            <Button variant="ghost" size="sm" onClick={onSearchClick} className="p-2" disabled={navLoading}>
              <Search className="h-5 w-5" />
            </Button>
          )}

          {showNotifications && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onNotificationClick}
              className="p-2 relative"
              disabled={navLoading}
            >
              <Bell className="h-5 w-5" />
              {notificationCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                >
                  {notificationCount > 9 ? "9+" : notificationCount}
                </Badge>
              )}
            </Button>
          )}

          <ThemeToggle />

          {user && !isLoading && (
            <button
              onClick={handleProfileClick}
              disabled={navLoading}
              className="focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-full disabled:opacity-50"
            >
              <UserAvatar {...avatarProps} />
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
