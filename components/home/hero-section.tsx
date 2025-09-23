"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Users, Trophy, Zap } from "@/lib/icons"
import { usePlatformStats } from "@/hooks/use-platform-stats"

export function HeroSection() {
  const { totalMatches, totalPlayers, totalTeams, isLoading, error } = usePlatformStats()

  // Format numbers for display
  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `${Math.floor(num / 1000)}K`
    }
    return num.toLocaleString()
  }

  return (
    <section className="space-y-6">
      {/* Main Hero */}
      <div className="text-center space-y-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground text-balance">
            Welcome to <span className="text-primary">Statifio</span>
          </h1>
          <p className="text-muted-foreground text-pretty max-w-md mx-auto">
            Your ultimate destination for real-time eSports and football statistics, analytics, and insights
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          <Badge variant="secondary" className="text-xs">
            Live Updates
          </Badge>
          <Badge variant="outline" className="text-xs">
            Multi-Sport
          </Badge>
          <Badge variant="outline" className="text-xs">
            Real-time Stats
          </Badge>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="bg-card border">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-full mx-auto mb-2">
              <Trophy className="h-5 w-5 text-primary" />
            </div>
            <div className="text-2xl font-bold text-foreground">
              {isLoading ? "..." : error ? "0" : totalMatches.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">Live Matches</div>
          </CardContent>
        </Card>

        <Card className="bg-card border">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center w-10 h-10 bg-secondary/10 rounded-full mx-auto mb-2">
              <Users className="h-5 w-5 text-secondary" />
            </div>
            <div className="text-2xl font-bold text-foreground">
              {isLoading ? "..." : error ? "0" : formatNumber(totalPlayers)}
            </div>
            <div className="text-xs text-muted-foreground">Players Tracked</div>
          </CardContent>
        </Card>

        <Card className="bg-card border">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center w-10 h-10 bg-accent/10 rounded-full mx-auto mb-2">
              <TrendingUp className="h-5 w-5 text-accent" />
            </div>
            <div className="text-2xl font-bold text-foreground">
              {isLoading ? "..." : error ? "0" : totalTeams.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">Teams Analyzed</div>
          </CardContent>
        </Card>

        <Card className="bg-card border">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-full mx-auto mb-2">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <div className="text-2xl font-bold text-foreground">24/7</div>
            <div className="text-xs text-muted-foreground">Live Coverage</div>
          </CardContent>
        </Card>
      </div>

      {/* CTA Button */}
      <div className="text-center">
        <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">Explore Statistics</Button>
      </div>
    </section>
  )
}
