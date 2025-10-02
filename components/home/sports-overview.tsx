"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronRight, Gamepad2, Trophy, Loader2 } from "lucide-react"
import Link from "next/link"
import { useEsportsOverview } from "@/lib/hooks/use-esports-data"

const footballData = {
  id: "football",
  name: "Football",
  icon: Trophy,
  description: "Premier League, La Liga, Champions League",
  stats: {
    liveMatches: 8,
    todayMatches: 24,
  },
  games: [
    { name: "Premier League", matches: 10, color: "bg-purple-500" },
    { name: "La Liga", matches: 8, color: "bg-yellow-500" },
    { name: "Champions League", matches: 6, color: "bg-blue-600" },
  ],
}

export function SportsOverview() {
  const { data: esportsOverview, loading, error } = useEsportsOverview()

  if (loading) {
    return (
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">Sports Overview</h2>
          <Link href="/stats">
            <Button variant="ghost" size="sm" className="text-primary">
              View All
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Loading sports data...</span>
        </div>
      </section>
    )
  }

  const esportsData = esportsOverview?.games
    ? {
        id: "esports",
        name: "eSports",
        icon: Gamepad2,
        description: "League of Legends, CS:GO, Dota 2", // updated CS2 to CS:GO
        stats: {
          liveMatches: esportsOverview.totalLiveMatches || 0,
          todayMatches: esportsOverview.games.reduce(
            (total: number, game: any) => total + (game.stats.activeMatches || 0),
            0,
          ),
        },
        games: esportsOverview.games.map((game: any) => ({
          name: game.shortName || game.name,
          matches: game.stats.activeMatches || 0,
          color: game.color || "bg-blue-500",
        })),
      }
    : null

  const sportsData = [...(esportsData ? [esportsData] : []), footballData]

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">Sports Overview</h2>
        <Link href="/stats">
          <Button variant="ghost" size="sm" className="text-primary">
            View All
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </Link>
      </div>

      {error ? (
        <div className="text-center py-8">
          <div className="text-muted-foreground">Unable to load sports data</div>
          <p className="text-sm text-muted-foreground mt-1">{error}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sportsData.map((sport) => {
            const Icon = sport.icon
            return (
              <Card key={sport.id} className="bg-card border">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-full">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base font-semibold text-foreground">{sport.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{sport.description}</p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardHeader>

                <CardContent className="pt-0 space-y-4">
                  {/* Live Stats */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-foreground">{sport.stats.liveMatches} Live</span>
                    </div>
                    <div className="text-sm text-muted-foreground">{sport.stats.todayMatches} matches today</div>
                  </div>

                  {/* Games/Leagues */}
                  <div className="space-y-2">
                    {sport.games.map((game, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${game.color}`}></div>
                          <span className="text-sm text-foreground">{game.name}</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {game.matches}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </section>
  )
}
