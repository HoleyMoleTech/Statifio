import { MobileLayout } from "@/components/layout/mobile-layout"
import { HeroSection } from "@/components/home/hero-section"
import { SportsOverview } from "@/components/home/sports-overview"
import { LiveMatches } from "@/components/home/live-matches"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function HomePage() {
  return (
    <MobileLayout title="Statifio" showSearch={true} showNotifications={true} notificationCount={3}>
      <div className="space-y-12">
        <HeroSection />

        <SportsOverview />

        <LiveMatches />

        <div className="text-center pt-8">
          <Link href="/dashboard">
            <Button
              variant="outline"
              size="lg"
              className="glass hover:bg-muted/50 border-border/50 font-semibold text-base px-8 py-4 shadow-elegant hover:shadow-elegant-lg transition-all duration-300 bg-transparent"
            >
              View Analytics Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </MobileLayout>
  )
}
