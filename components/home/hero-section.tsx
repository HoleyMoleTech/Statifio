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
    <section className="space-y-8">
      <div className="text-center space-y-6">
        <div className="space-y-4">
          <h1 className="text-5xl font-bold text-foreground text-balance leading-tight">
            Welcome to <span className="gradient-text">Statifio</span>
          </h1>
          <p className="text-lg text-muted-foreground text-pretty max-w-2xl mx-auto leading-relaxed">
            Your ultimate destination for real-time eSports and football statistics, analytics, and insights
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <Badge variant="secondary" className="text-sm px-4 py-2 bg-chart-1/10 text-chart-1 border-chart-1/20">
            Live Updates
          </Badge>
          <Badge variant="outline" className="text-sm px-4 py-2 border-muted-foreground/20">
            Multi-Sport
          </Badge>
          <Badge variant="outline" className="text-sm px-4 py-2 border-muted-foreground/20">
            Real-time Stats
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="glass shadow-elegant hover:shadow-elegant-lg transition-all duration-300">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-chart-1/10 rounded-xl mx-auto mb-4">
              <Trophy className="h-6 w-6 text-chart-1" />
            </div>
            <div className="text-3xl font-bold text-foreground mb-1">
              {isLoading ? "..." : error ? "0" : totalMatches.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground font-medium">Live Matches</div>
          </CardContent>
        </Card>

        <Card className="glass shadow-elegant hover:shadow-elegant-lg transition-all duration-300">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-chart-2/10 rounded-xl mx-auto mb-4">
              <Users className="h-6 w-6 text-chart-2" />
            </div>
            <div className="text-3xl font-bold text-foreground mb-1">
              {isLoading ? "..." : error ? "0" : formatNumber(totalPlayers)}
            </div>
            <div className="text-sm text-muted-foreground font-medium">Players Tracked</div>
          </CardContent>
        </Card>

        <Card className="glass shadow-elegant hover:shadow-elegant-lg transition-all duration-300">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-chart-3/10 rounded-xl mx-auto mb-4">
              <TrendingUp className="h-6 w-6 text-chart-3" />
            </div>
            <div className="text-3xl font-bold text-foreground mb-1">
              {isLoading ? "..." : error ? "0" : totalTeams.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground font-medium">Teams Analyzed</div>
          </CardContent>
        </Card>

        <Card className="glass shadow-elegant hover:shadow-elegant-lg transition-all duration-300">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-chart-1/10 rounded-xl mx-auto mb-4">
              <Zap className="h-6 w-6 text-chart-1" />
            </div>
            <div className="text-3xl font-bold text-foreground mb-1">24/7</div>
            <div className="text-sm text-muted-foreground font-medium">Live Coverage</div>
          </CardContent>
        </Card>
      </div>

      <div className="text-center pt-4">
        <Button
          size="lg"
          className="w-full max-w-md bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-lg py-6 shadow-elegant hover:shadow-elegant-lg transition-all duration-300"
        >
          Explore Statistics
        </Button>
      </div>
    </section>
  )
}
