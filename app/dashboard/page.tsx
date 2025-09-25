"use client"

import { MobileLayout } from "@/components/layout/mobile-layout"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { LiveAnalyticsDashboard } from "@/components/dashboard/live-analytics-dashboard"
import { RealTimeStats } from "@/components/dashboard/real-time-stats"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart3, Activity, TrendingUp } from "lucide-react"

export default function DashboardPage() {
  return (
    <ProtectedRoute requireAuth={true}>
      <MobileLayout title="Analytics Dashboard" showSearch={false} showNotifications={true}>
        <div className="space-y-6">
          <Tabs defaultValue="analytics" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-muted">
              <TabsTrigger value="analytics" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="realtime" className="gap-2">
                <Activity className="h-4 w-4" />
                Real-Time
              </TabsTrigger>
              <TabsTrigger value="insights" className="gap-2">
                <TrendingUp className="h-4 w-4" />
                Insights
              </TabsTrigger>
            </TabsList>

            <TabsContent value="analytics" className="mt-6">
              <LiveAnalyticsDashboard />
            </TabsContent>

            <TabsContent value="realtime" className="mt-6">
              <RealTimeStats />
            </TabsContent>

            <TabsContent value="insights" className="mt-6">
              <div className="text-center py-12 space-y-4">
                <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground" />
                <h3 className="text-lg font-semibold text-foreground">AI Insights Coming Soon</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Advanced AI-powered insights and predictions will be available here to help you make better decisions.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </MobileLayout>
    </ProtectedRoute>
  )
}
