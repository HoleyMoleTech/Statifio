import { MobileLayout } from "@/components/layout/mobile-layout"
import { HeroSection } from "@/components/home/hero-section"
import { SportsOverview } from "@/components/home/sports-overview"
import { LiveMatches } from "@/components/home/live-matches"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function HomePage() {
  return (
    <MobileLayout title="Statifio" showSearch={true} showNotifications={true} notificationCount={3}>
      <div className="space-y-8">
        <HeroSection />

        <SportsOverview />

        <LiveMatches />

        <div className="text-center pt-4">
          <Link href="/dashboard">
            <Button variant="outline" className="bg-transparent">
              View Analytics Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </MobileLayout>
  )
}
