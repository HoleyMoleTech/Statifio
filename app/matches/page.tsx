"use client"

import { useState, useEffect } from "react"
import { MobileLayout } from "@/components/layout/mobile-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock, Trophy, Filter, Search, Loader2 } from "lucide-react"
import Link from "next/link"

interface Match {
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
}

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [gameFilter, setGameFilter] = useState("all")
  const [activeTab, setActiveTab] = useState("all")

  const fetchMatches = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/matches")
      if (!response.ok) throw new Error("Failed to fetch matches")
      const data = await response.json()
      setMatches(data.matches || [])
    } catch (error) {
      console.error("Error fetching matches:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMatches()
  }, [])

  const filteredMatches = matches.filter((match) => {
    const matchesSearch =
      match.home_team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      match.away_team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      match.tournament_name?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || match.status === statusFilter
    const matchesGame = gameFilter === "all" || match.game_type === gameFilter
    const matchesTab = activeTab === "all" || match.status === activeTab

    return matchesSearch && matchesStatus && matchesGame && matchesTab
  })

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

  const getMatchCounts = () => {
    return {
      all: matches.length,
      live: matches.filter((m) => m.status === "live" || m.status === "running").length,
      scheduled: matches.filter((m) => m.status === "scheduled").length,
      finished: matches.filter((m) => m.status === "finished").length,
    }
  }

  const counts = getMatchCounts()

  return (
    <MobileLayout title="Match History" showBack>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center py-6">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Match History</h1>
          <p className="text-muted-foreground">Complete match results and upcoming fixtures</p>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search teams or tournaments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="flex-1">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="live">Live</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="finished">Finished</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={gameFilter} onValueChange={setGameFilter}>
                  <SelectTrigger className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Games</SelectItem>
                    <SelectItem value="lol">LoL</SelectItem>
                    <SelectItem value="csgo">CS:GO</SelectItem>
                    <SelectItem value="dota2">Dota 2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Match Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All ({counts.all})</TabsTrigger>
            <TabsTrigger value="live">Live ({counts.live})</TabsTrigger>
            <TabsTrigger value="scheduled">Upcoming ({counts.scheduled})</TabsTrigger>
            <TabsTrigger value="finished">Finished ({counts.finished})</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Matches ({filteredMatches.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <span className="ml-2">Loading matches...</span>
                  </div>
                ) : filteredMatches.length === 0 ? (
                  <div className="text-center py-8">
                    <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No matches found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredMatches.map((match) => {
                      const { date, time } = formatDate(match.match_date)
                      return (
                        <Link key={match.id} href={`/matches/${match.id}`}>
                          <div className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <Badge className={getStatusColor(match.status)}>
                                  {match.status === "running" ? "LIVE" : match.status.toUpperCase()}
                                </Badge>
                                {match.game_type && <Badge variant="outline">{match.game_type.toUpperCase()}</Badge>}
                              </div>
                              <div className="text-right text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {date}
                                </div>
                                <div className="flex items-center gap-1 mt-1">
                                  <Clock className="h-3 w-3" />
                                  {time}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 flex-1">
                                <div className="text-right flex-1">
                                  <div className="font-semibold">{match.home_team.name}</div>
                                </div>
                                <div className="flex items-center gap-2 px-4">
                                  <span className="text-2xl font-bold">{match.home_score}</span>
                                  <span className="text-muted-foreground">-</span>
                                  <span className="text-2xl font-bold">{match.away_score}</span>
                                </div>
                                <div className="text-left flex-1">
                                  <div className="font-semibold">{match.away_team.name}</div>
                                </div>
                              </div>
                            </div>

                            {match.tournament_name && (
                              <div className="mt-3 pt-3 border-t">
                                <div className="text-sm text-muted-foreground">{match.tournament_name}</div>
                              </div>
                            )}
                          </div>
                        </Link>
                      )
                    })}
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
