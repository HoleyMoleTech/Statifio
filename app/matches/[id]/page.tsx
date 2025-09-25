"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { MobileLayout } from "@/components/layout/mobile-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock, Trophy, TrendingUp, Users, Target, Loader2 } from "lucide-react"

interface MatchDetail {
  id: string
  external_id: string
  sport_type: string
  game_type: string | null
  home_team: {
    name: string
    logo_url: string | null
  }
  away_team: {
    name: string
    logo_url: string | null
  }
  tournament_name: string | null
  match_date: string
  status: string
  home_score: number
  away_score: number
  match_details: any
  analytics: {
    duration: string
    total_kills: number
    total_deaths: number
    mvp_player: string | null
    key_moments: Array<{
      time: string
      event: string
      description: string
    }>
  }
}

export default function MatchDetailPage() {
  const params = useParams()
  const matchId = params.id as string
  const [match, setMatch] = useState<MatchDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMatchDetail = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/matches/${matchId}`)
      if (!response.ok) throw new Error("Failed to fetch match details")
      const data = await response.json()
      setMatch(data.match)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch match")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (matchId) {
      fetchMatchDetail()
    }
  }, [matchId])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "live":
      case "running":
        return "bg-green-100 text-green-800 border-green-200"
      case "finished":
        return "bg-gray-100 text-gray-800 border-gray-200"
      case "scheduled":
        return "bg-blue-100 text-blue-800 border-blue-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }
  }

  if (loading) {
    return (
      <MobileLayout title="Match Details" showBack>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading match details...</span>
        </div>
      </MobileLayout>
    )
  }

  if (error || !match) {
    return (
      <MobileLayout title="Match Details" showBack>
        <div className="text-center py-12">
          <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">{error || "Match not found"}</p>
        </div>
      </MobileLayout>
    )
  }

  const { date, time } = formatDate(match.match_date)

  return (
    <MobileLayout title="Match Details" showBack>
      <div className="space-y-6">
        {/* Match Header */}
        <Card>
          <CardContent className="p-6">
            <div className="text-center mb-6">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Badge className={getStatusColor(match.status)}>
                  {match.status === "running" ? "LIVE" : match.status.toUpperCase()}
                </Badge>
                {match.game_type && <Badge variant="outline">{match.game_type.toUpperCase()}</Badge>}
              </div>

              <div className="flex items-center gap-1 justify-center text-sm text-muted-foreground mb-4">
                <Calendar className="h-4 w-4" />
                {date} • <Clock className="h-4 w-4" /> {time}
              </div>

              {match.tournament_name && <p className="text-muted-foreground mb-6">{match.tournament_name}</p>}
            </div>

            {/* Teams and Score */}
            <div className="flex items-center justify-between">
              <div className="text-center flex-1">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Trophy className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-bold text-lg">{match.home_team.name}</h3>
              </div>

              <div className="text-center px-8">
                <div className="text-4xl font-bold mb-2">
                  {match.home_score} - {match.away_score}
                </div>
                {match.status === "finished" && <div className="text-sm text-muted-foreground">Final Score</div>}
              </div>

              <div className="text-center flex-1">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Trophy className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-bold text-lg">{match.away_team.name}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Match Analytics */}
        <Tabs defaultValue="overview">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="stats">Statistics</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Duration
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{match.analytics.duration}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Total Kills
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{match.analytics.total_kills}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    MVP Player
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-semibold">{match.analytics.mvp_player || "N/A"}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-semibold">
                    {match.home_score > match.away_score ? match.home_team.name : match.away_team.name} Win
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="stats" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Match Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Total Kills</span>
                    <span className="font-bold">{match.analytics.total_kills}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Total Deaths</span>
                    <span className="font-bold">{match.analytics.total_deaths}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>K/D Ratio</span>
                    <span className="font-bold">
                      {match.analytics.total_deaths > 0
                        ? (match.analytics.total_kills / match.analytics.total_deaths).toFixed(2)
                        : match.analytics.total_kills.toString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Match Duration</span>
                    <span className="font-bold">{match.analytics.duration}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="timeline" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Key Moments</CardTitle>
              </CardHeader>
              <CardContent>
                {match.analytics.key_moments.length > 0 ? (
                  <div className="space-y-4">
                    {match.analytics.key_moments.map((moment, index) => (
                      <div key={index} className="flex gap-4 p-3 border rounded-lg">
                        <div className="text-sm font-mono text-muted-foreground min-w-16">{moment.time}</div>
                        <div className="flex-1">
                          <div className="font-semibold text-sm">{moment.event}</div>
                          <div className="text-sm text-muted-foreground">{moment.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No timeline data available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MobileLayout>
  )
}
