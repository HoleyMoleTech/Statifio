"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, Trophy, ChevronRight, Loader2 } from "lucide-react"
import { useEsportsOverview, useTopTeams, useRecentMatches } from "@/lib/hooks/use-esports-data"
import { formatMatchDuration, formatMatchStatus } from "@/lib/services/data-transformer"
import { useState } from "react"
import Link from "next/link"

export function EsportsStats() {
  const { data: overview, loading: overviewLoading, error: overviewError } = useEsportsOverview()
  const [selectedGame, setSelectedGame] = useState<string>("overview")

  const { teams: lolTeams, loading: lolTeamsLoading } = useTopTeams("lol", 5)
  const { teams: csgoTeams, loading: csgoTeamsLoading } = useTopTeams("csgo", 5)
  const { teams: dota2Teams, loading: dota2TeamsLoading } = useTopTeams("dota2", 5)

  const { matches: lolMatches, loading: lolMatchesLoading } = useRecentMatches("lol", 3)
  const { matches: csgoMatches, loading: csgoMatchesLoading } = useRecentMatches("csgo", 3)
  const { matches: dota2Matches, loading: dota2MatchesLoading } = useRecentMatches("dota2", 3)

  if (overviewLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading eSports data...</span>
      </div>
    )
  }

  if (overviewError) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">Failed to load eSports data</div>
        <p className="text-muted-foreground">{overviewError}</p>
      </div>
    )
  }

  const esportsGames = overview?.games || []

  const allTopTeams = [
    ...(Array.isArray(lolTeams) ? lolTeams.slice(0, 2).map((team) => ({ ...team, game: "LoL" })) : []),
    ...(Array.isArray(csgoTeams) ? csgoTeams.slice(0, 2).map((team) => ({ ...team, game: "CS:GO" })) : []),
    ...(Array.isArray(dota2Teams) ? dota2Teams.slice(0, 1).map((team) => ({ ...team, game: "Dota 2" })) : []),
  ]

  const allRecentMatches = [
    ...(Array.isArray(lolMatches) ? lolMatches.slice(0, 1) : []),
    ...(Array.isArray(csgoMatches) ? csgoMatches.slice(0, 1) : []),
    ...(Array.isArray(dota2Matches) ? dota2Matches.slice(0, 1) : []),
  ]

  return (
    <div className="space-y-6">
      {/* Game Selection Tabs */}
      <Tabs value={selectedGame} onValueChange={setSelectedGame} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-muted">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="lol">LoL</TabsTrigger>
          <TabsTrigger value="csgo">CS:GO</TabsTrigger>
          <TabsTrigger value="dota2">Dota 2</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-6">
          {/* Games Overview */}
          <div className="grid gap-4">
            {esportsGames.map((game) => (
              <Card key={game.id} className="bg-card border">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full ${game.color}`}></div>
                      <div>
                        <h3 className="font-semibold text-foreground">{game.name}</h3>
                        <p className="text-sm text-muted-foreground">{game.stats.avgViewers} avg viewers</p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-foreground">{game.stats.activeMatches}</div>
                      <div className="text-xs text-muted-foreground">Live Matches</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-foreground">
                        {game.stats.totalPlayers.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">Players</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-foreground">{game.stats.tournaments}</div>
                      <div className="text-xs text-muted-foreground">Tournaments</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Top Teams */}
          <Card className="bg-card border">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold text-foreground">Top Teams</CardTitle>
              <Link href="/teams">
                <Button variant="outline" size="sm">
                  View All Teams
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              {lolTeamsLoading || csgoTeamsLoading || dota2TeamsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <span className="ml-2 text-muted-foreground">Loading teams...</span>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {allTopTeams.map((team, index) => (
                    <div key={`${team.team.id}-${index}`} className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-primary">#{team.rank}</span>
                        </div>
                        <div>
                          <div className="font-medium text-foreground">{team.team.name}</div>
                          <div className="text-sm text-muted-foreground">{team.game}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-foreground">{team.winRate}%</div>
                        <div className="text-sm flex items-center gap-1 text-green-600">
                          <TrendingUp className="h-3 w-3" />
                          {team.wins}W-{team.losses}L
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Matches */}
          <Card className="bg-card border">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-foreground">Recent Matches</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {lolMatchesLoading || csgoMatchesLoading || dota2MatchesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <span className="ml-2 text-muted-foreground">Loading matches...</span>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {allRecentMatches.map((match) => (
                    <div key={match.id} className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant={match.status === "running" ? "default" : "secondary"} className="text-xs">
                            {match.status === "running" && (
                              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1"></div>
                            )}
                            {formatMatchStatus(match.status)}
                          </Badge>
                          <span className="text-sm text-muted-foreground">{match.tournament.name}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{formatMatchDuration(match.date)}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-foreground">{match.teams.team1.name}</span>
                            <span className="text-lg font-bold text-foreground">{match.teams.team1.score ?? "-"}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-foreground">{match.teams.team2.name}</span>
                            <span className="text-lg font-bold text-foreground">{match.teams.team2.score ?? "-"}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Individual Game Tabs */}
        {esportsGames.map((game) => (
          <TabsContent key={game.id} value={game.id} className="mt-6">
            <GameDetailView gameId={game.id} gameName={game.name} gameColor={game.color} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}

function GameDetailView({ gameId, gameName, gameColor }: { gameId: string; gameName: string; gameColor: string }) {
  const { teams, loading: teamsLoading } = useTopTeams(gameId, 10)
  const { matches, loading: matchesLoading } = useRecentMatches(gameId, 5)

  return (
    <div className="space-y-6">
      {/* Game Header */}
      <div className="text-center py-8">
        <div className={`w-16 h-16 ${gameColor} rounded-full flex items-center justify-center mx-auto mb-4`}>
          <Trophy className="h-8 w-8 text-white" />
        </div>
        <h3 className="text-xl font-bold text-foreground mb-2">{gameName}</h3>
        <p className="text-muted-foreground">Live statistics and rankings</p>
      </div>

      {/* Top Teams for this game */}
      <Card className="bg-card border">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold text-foreground">Top Teams</CardTitle>
          <Link href={`/teams/${gameId}`}>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          {teamsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Loading teams...</span>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {Array.isArray(teams) &&
                teams.slice(0, 5).map((team) => (
                  <div key={team.team.id} className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-primary">#{team.rank}</span>
                      </div>
                      <div>
                        <div className="font-medium text-foreground">{team.team.name}</div>
                        <div className="text-sm text-muted-foreground">{team.team.location}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-foreground">{team.winRate}%</div>
                      <div className="text-sm text-muted-foreground">
                        {team.wins}W-{team.losses}L
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Matches for this game */}
      <Card className="bg-card border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">Recent Matches</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {matchesLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Loading matches...</span>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {matches.map((match) => (
                <div key={match.id} className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant={match.status === "running" ? "default" : "secondary"} className="text-xs">
                        {match.status === "running" && (
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1"></div>
                        )}
                        {formatMatchStatus(match.status)}
                      </Badge>
                      <span className="text-sm text-muted-foreground">{match.tournament.name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{formatMatchDuration(match.date)}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-foreground">{match.teams.team1.name}</span>
                        <span className="text-lg font-bold text-foreground">{match.teams.team1.score ?? "-"}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground">{match.teams.team2.name}</span>
                        <span className="text-lg font-bold text-foreground">{match.teams.team2.score ?? "-"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
