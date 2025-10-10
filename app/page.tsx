import { MobileLayout } from "@/components/layout/mobile-layout"
import { HeroSection } from "@/components/home/hero-section"
import { SportsOverview } from "@/components/home/sports-overview"
import { LiveMatches } from "@/components/home/live-matches"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function HomePage() {
  return (
    <MobileLayout title="Home" showBottomNav={true}>
      <HeroSection />
      <SportsOverview />
      <LiveMatches />

      <div className="px-4 py-8 text-center">
        <Link href="/dashboard">
          <Button size="lg" className="w-full max-w-md">
            View Analytics Dashboard
          </Button>
        </Link>
      </div>
    </MobileLayout>
  )
}
