"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-border/40">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background" />

      <div className="container relative py-24 md:py-32">
        <div className="mx-auto max-w-4xl text-center">
          <Badge variant="secondary" className="mb-6">
            Live Now
          </Badge>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 text-balance">
            Real-time esports statistics and analytics
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground mb-8 text-balance max-w-2xl mx-auto">
            Track live matches, analyze team performance, and follow tournaments across League of Legends, CS2, and Dota
            2.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/matches">
                View Live Matches
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/tournaments">Explore Tournaments</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
