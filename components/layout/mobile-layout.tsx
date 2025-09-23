"use client"

import type { ReactNode } from "react"
import { MobileNav } from "./mobile-nav"
import { MobileHeader } from "./mobile-header"
import { Footer } from "./footer"
import { useNavigation } from "@/contexts/navigation-context"
import { useRouter } from "next/navigation"

interface MobileLayoutProps {
  children: ReactNode
  title: string
  showSearch?: boolean
  showNotifications?: boolean
  showMenu?: boolean
  showBack?: boolean
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
  onSearchClick,
  onNotificationClick,
  onMenuClick,
  notificationCount,
}: MobileLayoutProps) {
  const router = useRouter()
  const { isLoading } = useNavigation()

  const handleBackClick = () => {
    router.back()
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b">
        <MobileHeader
          title={title}
          showSearch={showSearch}
          showNotifications={showNotifications}
          showMenu={showMenu}
          showBack={showBack}
          onSearchClick={onSearchClick}
          onNotificationClick={onNotificationClick}
          onMenuClick={onMenuClick}
          onBackClick={handleBackClick}
          notificationCount={notificationCount}
        />
      </div>

      <main className="flex-1 pt-16 pb-20 px-4 py-4 max-w-5xl mx-auto relative">
        {isLoading && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-40 flex items-center justify-center">
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-sm">Loading...</span>
            </div>
          </div>
        )}
        {children}
      </main>

      <Footer />

      <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t">
        <MobileNav />
      </div>
    </div>
  )
}
