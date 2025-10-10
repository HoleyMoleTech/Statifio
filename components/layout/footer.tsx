import { Logo } from "@/components/ui/logo"
import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand Section */}
          <div className="space-y-3">
            <Logo size="md" />
            <p className="text-sm text-muted-foreground">
              Your ultimate destination for real-time eSports and football statistics, analytics, and insights.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/stats" className="text-muted-foreground hover:text-foreground transition-colors">
                  Statistics
                </Link>
              </li>
              <li>
                <Link href="/events" className="text-muted-foreground hover:text-foreground transition-colors">
                  Events
                </Link>
              </li>
              <li>
                <Link href="/teams" className="text-muted-foreground hover:text-foreground transition-colors">
                  Teams
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Sports */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Sports</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/matches?game=csgo"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  CS:GO
                </Link>
              </li>
              <li>
                <Link
                  href="/matches?game=lol"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  League of Legends
                </Link>
              </li>
              <li>
                <Link
                  href="/matches?game=dota2"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Dota 2
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Support</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/auth/login" className="text-muted-foreground hover:text-foreground transition-colors">
                  Login
                </Link>
              </li>
              <li>
                <Link href="/auth/sign-up" className="text-muted-foreground hover:text-foreground transition-colors">
                  Sign Up
                </Link>
              </li>
              <li>
                <Link href="/profile" className="text-muted-foreground hover:text-foreground transition-colors">
                  Profile
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-6 text-center text-sm text-muted-foreground">
          <p>© 2025 Statifio. All rights reserved. Every match, every stat.</p>
        </div>
      </div>
    </footer>
  )
}
