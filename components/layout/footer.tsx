import { Logo } from "@/components/ui/logo"
import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-muted/30 border-t border mt-auto">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <Logo size="md" showText={true} />
            <p className="text-sm text-muted-foreground max-w-xs">
              Your ultimate destination for real-time eSports and football statistics, analytics, and insights.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/stats" className="text-muted-foreground hover:text-foreground">
                  Statistics
                </Link>
              </li>
              <li>
                <Link href="/events" className="text-muted-foreground hover:text-foreground">
                  Events
                </Link>
              </li>
              <li>
                <Link href="/teams" className="text-muted-foreground hover:text-foreground">
                  Teams
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-muted-foreground hover:text-foreground">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Sports */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Sports</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/stats?game=csgo" className="text-muted-foreground hover:text-foreground">
                  CS:GO
                </Link>
              </li>
              <li>
                <Link href="/stats?game=lol" className="text-muted-foreground hover:text-foreground">
                  League of Legends
                </Link>
              </li>
              <li>
                <Link href="/stats?game=dota2" className="text-muted-foreground hover:text-foreground">
                  Dota 2
                </Link>
              </li>
              <li>
                <Link href="/football" className="text-muted-foreground hover:text-foreground">
                  Football
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Support</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/auth/login" className="text-muted-foreground hover:text-foreground">
                  Login
                </Link>
              </li>
              <li>
                <Link href="/auth/signup" className="text-muted-foreground hover:text-foreground">
                  Sign Up
                </Link>
              </li>
              <li>
                <Link href="/profile" className="text-muted-foreground hover:text-foreground">
                  Profile
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-6 text-center">
          <p className="text-sm text-muted-foreground">
            © 2024 Statifio. All rights reserved. Every match, every stat.
          </p>
        </div>
      </div>
    </footer>
  )
}
