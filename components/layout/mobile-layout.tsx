"use client"

import type { ReactNode } from "react"
import { MobileNav } from "./mobile-nav"
import { MobileHeader } from "./mobile-header"
import { Footer } from "./footer"
import { ErrorBoundary } from "@/components/ui/error-boundary"
import { useNavigation } from "@/contexts/navigation-context"
import { useRouter, usePathname } from "next/navigation"

interface MobileLayoutProps {
  children: ReactNode
  title: string
  showSearch?: boolean
  showNotifications?: boolean
  showMenu?: boolean
  showBack?: boolean
  showBottomNav?: boolean
  onSearchClick?: () => void
  onNotificationClick?: () => void
  onMenuClick?: () => void
  notificationCount?: number
}

export function MobileLayout({
  children,
  title,
  showSearch,
  showNotifications,
  showMenu,
  showBack,
  showBottomNav = true,
  onSearchClick,
  onNotificationClick,
  onMenuClick,
  notificationCount,
}: MobileLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { isLoading } = useNavigation()

  const shouldShowBack =
    showBack ??
    (() => {
      const detailPages = ["/teams/", "/profile", "/dashboard"]
      const isDetailPage = detailPages.some((page) => pathname.startsWith(page) && pathname !== page)
      const isNestedPage = pathname.split("/").length > 2
      return isDetailPage || isNestedPage
    })()

  const handleBackClick = () => {
    router.back()
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <MobileHeader
        title={title}
        showSearch={showSearch}
        showNotifications={showNotifications}
        showMenu={showMenu}
        showBack={shouldShowBack}
        onSearchClick={onSearchClick}
        onNotificationClick={onNotificationClick}
        onMenuClick={onMenuClick}
        onBackClick={handleBackClick}
        notificationCount={notificationCount}
      />

      <div className="flex-1 pb-20">
        {isLoading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <span className="text-sm text-muted-foreground">Loading...</span>
            </div>
          </div>
        )}
        <ErrorBoundary>{children}</ErrorBoundary>
      </div>

      <Footer />

      {showBottomNav && (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
          <MobileNav />
        </div>
      )}
    </div>
  )
}
