import { MobileLayout } from "@/components/layout/mobile-layout"
import { UpcomingEvents } from "@/components/events/upcoming-events"

export default function EventsPage() {
  return (
    <MobileLayout title="Events" showSearch={true} showNotifications={true}>
      <div className="space-y-6">
        <UpcomingEvents />
      </div>
    </MobileLayout>
  )
}
