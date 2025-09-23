"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, Trophy, Target, ChevronRight } from "lucide-react"

const footballLeagues = [
  {
    id: "premier-league",
    name: "Premier League",
    shortName: "EPL",
    country: "England",
    color: "bg-purple-600",
    stats: {
      activeMatches: 3,
      totalTeams: 20,
      matchday: 25,
      avgGoals: 2.8,
    },
  },
  {
    id: "la-liga",
    name: "La Liga",
    shortName: "LaLiga",
    country: "Spain",
    color: "bg-yellow-500",
    stats: {
      activeMatches: 2,
      totalTeams: 20,
      matchday: 24,
      avgGoals: 2.6,
    },
  },
  {
    id: "champions-league",
    name: "Champions League",
    shortName: "UCL",
    country: "Europe",
    color: "bg-blue-600",
    stats: {
      activeMatches: 4,
      totalTeams: 16,
      matchday: "R16",
      avgGoals: 3.1,
    },
  },
]

const topTeams = [
  { name: "Manchester City", league: "EPL", points: 65, change: "+2", trend: "up" },
  { name: "Real Madrid", league: "LaLiga", points: 62, change: "+3", trend: "up" },
  { name: "Arsenal", league: "EPL", points: 61, change: "0", trend: "stable" },
  { name: "Barcelona", league: "LaLiga", points: 58, change: "+1", trend: "up" },
  { name: "Liverpool", league: "EPL", points: 57, change: "-1", trend: "down" },
]

const recentMatches = [
  {
    id: 1,
    league: "EPL",
    homeTeam: "Manchester City",
    awayTeam: "Arsenal",
    homeScore: 2,
    awayScore: 1,
    status: "Finished",
    time: "90'",
  },
  {
    id: 2,
    league: "UCL",
    homeTeam: "Real Madrid",
    awayTeam: "PSG",
    homeScore: 1,
    awayScore: 0,
    status: "Live",
    time: "67'",
  },
  {
    id: 3,
    league: "LaLiga",
    homeTeam: "Barcelona",
    awayTeam: "Atletico Madrid",
    homeScore: 3,
    awayScore: 1,
    status: "Finished",
    time: "90'",
  },
]

const topScorers = [
  { name: "Erling Haaland", team: "Manchester City", goals: 18, assists: 5 },
  { name: "Harry Kane", team: "Bayern Munich", goals: 17, assists: 8 },
  { name: "Kylian Mbappé", team: "PSG", goals: 16, assists: 6 },
  { name: "Robert Lewandowski", team: "Barcelona", goals: 15, assists: 4 },
  { name: "Victor Osimhen", team: "Napoli", goals: 14, assists: 3 },
]

export function FootballStats() {
  return (
    <div className="space-y-6">
      {/* League Selection Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-muted">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="epl">EPL</TabsTrigger>
          <TabsTrigger value="laliga">LaLiga</TabsTrigger>
          <TabsTrigger value="ucl">UCL</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-6">
          {/* Leagues Overview */}
          <div className="grid gap-4">
            {footballLeagues.map((league) => (
              <Card key={league.id} className="bg-card border">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full ${league.color}`}></div>
                      <div>
                        <h3 className="font-semibold text-foreground">{league.name}</h3>
                        <p className="text-sm text-muted-foreground">{league.country}</p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-foreground">{league.stats.activeMatches}</div>
                      <div className="text-xs text-muted-foreground">Live Matches</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-foreground">{league.stats.totalTeams}</div>
                      <div className="text-xs text-muted-foreground">Teams</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-foreground">{league.stats.avgGoals}</div>
                      <div className="text-xs text-muted-foreground">Avg Goals</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Top Teams */}
          <Card className="bg-card border">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-foreground">League Leaders</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {topTeams.map((team, index) => (
                  <div key={index} className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-primary">#{index + 1}</span>
                      </div>
                      <div>
                        <div className="font-medium text-foreground">{team.name}</div>
                        <div className="text-sm text-muted-foreground">{team.league}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-foreground">{team.points} pts</div>
                      <div
                        className={`text-sm flex items-center gap-1 ${
                          team.trend === "up"
                            ? "text-green-600"
                            : team.trend === "down"
                              ? "text-red-600"
                              : "text-muted-foreground"
                        }`}
                      >
                        {team.trend !== "stable" && (
                          <TrendingUp className={`h-3 w-3 ${team.trend === "down" ? "rotate-180" : ""}`} />
                        )}
                        {team.change}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Scorers */}
          <Card className="bg-card border">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-foreground">Top Scorers</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {topScorers.map((player, index) => (
                  <div key={index} className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-secondary/10 rounded-full flex items-center justify-center">
                        <Target className="h-4 w-4 text-secondary" />
                      </div>
                      <div>
                        <div className="font-medium text-foreground">{player.name}</div>
                        <div className="text-sm text-muted-foreground">{player.team}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-foreground">{player.goals} goals</div>
                      <div className="text-sm text-muted-foreground">{player.assists} assists</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Matches */}
          <Card className="bg-card border">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-foreground">Recent Matches</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {recentMatches.map((match) => (
                  <div key={match.id} className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant={match.status === "Live" ? "default" : "secondary"} className="text-xs">
                          {match.status === "Live" && (
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1"></div>
                          )}
                          {match.status}
                        </Badge>
                        <span className="text-sm text-muted-foreground">{match.league}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{match.time}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-foreground">{match.homeTeam}</span>
                          <span className="text-lg font-bold text-foreground">{match.homeScore}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-foreground">{match.awayTeam}</span>
                          <span className="text-lg font-bold text-foreground">{match.awayScore}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Individual League Tabs */}
        {footballLeagues.map((league) => (
          <TabsContent key={league.id} value={league.id.split("-")[0]} className="mt-6">
            <div className="text-center py-12">
              <div className={`w-16 h-16 ${league.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                <Trophy className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">{league.name}</h3>
              <p className="text-muted-foreground mb-6">Detailed league table and fixtures coming soon</p>
              <Button variant="outline" className="bg-transparent">
                View Table
              </Button>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
