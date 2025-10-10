"use client"

import { Bell, Search, Menu, ChevronLeft } from "lucide-react"
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
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          {showMenu && (
            <Button variant="ghost" size="icon" onClick={onMenuClick}>
              <Menu className="h-5 w-5" />
            </Button>
          )}
          {showBack && (
            <Button variant="ghost" size="icon" onClick={onBackClick}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
          )}
          <Logo size="sm" showText={!showBack} />
        </div>

        <div className="flex items-center gap-1">
          {showSearch && (
            <Button variant="ghost" size="icon" onClick={onSearchClick}>
              <Search className="h-5 w-5" />
              <span className="sr-only">Search</span>
            </Button>
          )}
          {showNotifications && (
            <Button variant="ghost" size="icon" onClick={onNotificationClick} className="relative">
              <Bell className="h-5 w-5" />
              <span className="sr-only">Notifications</span>
              {notificationCount > 0 && (
                <Badge variant="destructive" className="absolute -right-1 -top-1 h-5 min-w-5 px-1 text-xs">
                  {notificationCount > 9 ? "9+" : notificationCount}
                </Badge>
              )}
            </Button>
          )}
          <ThemeToggle />
          {user && !isLoading && (
            <Button variant="ghost" size="icon" onClick={handleProfileClick} disabled={navLoading}>
              <UserAvatar {...avatarProps} />
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
