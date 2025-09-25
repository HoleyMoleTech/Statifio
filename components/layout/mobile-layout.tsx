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
    console.log("[v0] MobileLayout: Back button clicked from", pathname)
    router.back()
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <ErrorBoundary>
        <div className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
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
        </div>
      </ErrorBoundary>

      <main className={`flex-1 pt-20 px-6 py-6 max-w-6xl mx-auto w-full relative ${showBottomNav ? "pb-24" : "pb-6"}`}>
        {isLoading && (
          <div className="absolute inset-0 glass z-40 flex items-center justify-center">
            <div className="flex items-center gap-3 text-muted-foreground">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-base font-medium">Loading...</span>
            </div>
          </div>
        )}
        <ErrorBoundary>{children}</ErrorBoundary>
      </main>

      <ErrorBoundary>
        <Footer />
      </ErrorBoundary>

      {showBottomNav && (
        <ErrorBoundary>
          <div className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-border/50">
            <MobileNav />
          </div>
        </ErrorBoundary>
      )}
    </div>
  )
}
