import { MobileLayout } from "@/components/layout/mobile-layout"
import { SportsTabs } from "@/components/sports/sports-tabs"

export default function StatsPage() {
  return (
    <MobileLayout title="Statistics" showSearch={true} showNotifications={true}>
      <div className="space-y-6">
        <SportsTabs />
      </div>
    </MobileLayout>
  )
}
