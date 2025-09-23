"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronRight, Clock, Loader2 } from "@/lib/icons"
import Link from "next/link"
import { useLiveMatches } from "@/lib/hooks/use-esports-data"

export function LiveMatches() {
  const { matches: liveMatches, loading, error } = useLiveMatches()

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">Live Matches</h2>
        <Link href="/events">
          <Button variant="ghost" size="sm" className="text-primary">
            View All
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Loading live matches...</span>
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <div className="text-muted-foreground">Unable to load live matches</div>
          <p className="text-sm text-muted-foreground mt-1">{error}</p>
        </div>
      ) : liveMatches.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-muted-foreground">No live matches at the moment</div>
          <p className="text-sm text-muted-foreground mt-1">Check back later for live eSports action!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {liveMatches.slice(0, 3).map((match) => (
            <Card key={match.id} className="bg-card border">
              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* Match Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant={match.status === "running" ? "default" : "secondary"} className="text-xs">
                        {match.status === "running" && (
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1"></div>
                        )}
                        {match.status === "running" ? "Live" : "Upcoming"}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{match.tournament?.name || "Tournament"}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {match.status === "running" ? "Live" : "Soon"}
                    </div>
                  </div>

                  {/* Teams and Score */}
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-foreground">
                          {match.teams?.team1?.name || "Team 1"}
                        </span>
                        <span className="text-lg font-bold text-foreground">{match.teams?.team1?.score ?? "-"}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground">
                          {match.teams?.team2?.name || "Team 2"}
                        </span>
                        <span className="text-lg font-bold text-foreground">{match.teams?.team2?.score ?? "-"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Game Info */}
                  <div className="text-xs text-muted-foreground">{match.videogame}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  )
}
