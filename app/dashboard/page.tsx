"use client"

import { MobileLayout } from "@/components/layout/mobile-layout"
import { AnalyticsOverview } from "@/components/dashboard/analytics-overview"
import { PerformanceCharts } from "@/components/dashboard/performance-charts"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/login")
        return
      }

      setUser(user)
      setIsLoading(false)
    }

    getUser()
  }, [router, supabase])

  if (isLoading) {
    return (
      <MobileLayout title="Dashboard" showSearch={false} showNotifications={true}>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </MobileLayout>
    )
  }

  if (!user) {
    return (
      <MobileLayout title="Dashboard" showSearch={false} showNotifications={false}>
        <div className="text-center py-12 space-y-4">
          <h2 className="text-xl font-bold text-foreground mb-2">Sign in to view dashboard</h2>
          <p className="text-muted-foreground mb-6">Access your personalized analytics and insights</p>
        </div>
      </MobileLayout>
    )
  }

  return (
    <MobileLayout title="Dashboard" showSearch={false} showNotifications={true}>
      <div className="space-y-6">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-muted">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <AnalyticsOverview />
          </TabsContent>

          <TabsContent value="performance" className="mt-6">
            <PerformanceCharts />
          </TabsContent>
        </Tabs>
      </div>
    </MobileLayout>
  )
}
