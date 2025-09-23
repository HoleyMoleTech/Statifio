"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { MobileLayout } from "@/components/layout/mobile-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, ChevronLeft, ChevronRight, Trophy, TrendingUp } from "lucide-react"

interface Team {
  rank: number
  team: {
    id: string | number
    name: string
    acronym: string
    image_url: string
    location: string
  }
  wins: number
  losses: number
  winRate: number
  recentForm: ("W" | "L")[]
}

interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

interface TeamsResponse {
  teams: Team[]
  pagination: PaginationInfo
}

export default function TeamsPage() {
  const params = useParams()
  const game = params.game as string
  const [teams, setTeams] = useState<Team[]>([])
  const [pagination, setPagination] = useState<PaginationInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  const gameNames: Record<string, string> = {
    lol: "League of Legends",
    csgo: "Counter-Strike: Global Offensive",
    dota2: "Dota 2",
  }

  const fetchTeams = async (page: number) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/esports/teams/${game}?limit=20&page=${page}`)
      if (!response.ok) {
        throw new Error(`Failed to fetch teams: ${response.statusText}`)
      }

      const data: TeamsResponse = await response.json()
      setTeams(data.teams || [])
      setPagination(data.pagination)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch teams")
      setTeams([])
      setPagination(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (game) {
      fetchTeams(currentPage)
    }
  }, [game, currentPage])

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const renderPagination = () => {
    if (!pagination || pagination.totalPages <= 1) return null

    const pages = []
    const maxVisiblePages = 5
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
    const endPage = Math.min(pagination.totalPages, startPage + maxVisiblePages - 1)

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }

    return (
      <div className="flex items-center justify-center gap-2 mt-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={!pagination.hasPrev}
          className="flex items-center gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>

        <div className="flex items-center gap-1">
          {startPage > 1 && (
            <>
              <Button variant="outline" size="sm" onClick={() => handlePageChange(1)} className="w-10 h-10">
                1
              </Button>
              {startPage > 2 && <span className="px-2 text-muted-foreground">...</span>}
            </>
          )}

          {pages.map((page) => (
            <Button
              key={page}
              variant={page === currentPage ? "default" : "outline"}
              size="sm"
              onClick={() => handlePageChange(page)}
              className="w-10 h-10"
            >
              {page}
            </Button>
          ))}

          {endPage < pagination.totalPages && (
            <>
              {endPage < pagination.totalPages - 1 && <span className="px-2 text-muted-foreground">...</span>}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.totalPages)}
                className="w-10 h-10"
              >
                {pagination.totalPages}
              </Button>
            </>
          )}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={!pagination.hasNext}
          className="flex items-center gap-1"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  if (!game || !gameNames[game]) {
    return (
      <MobileLayout title="Teams" showBack>
        <div className="text-center py-12">
          <div className="text-red-500 mb-4">Invalid Game</div>
          <p className="text-muted-foreground">The requested game is not supported.</p>
        </div>
      </MobileLayout>
    )
  }

  return (
    <MobileLayout title={`${gameNames[game]} Teams`} showBack>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center py-6">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">{gameNames[game]}</h1>
          <p className="text-muted-foreground">Team rankings and statistics</p>
          {pagination && (
            <p className="text-sm text-muted-foreground mt-2">
              Showing {teams.length} teams • Page {pagination.page} of {pagination.totalPages}
            </p>
          )}
        </div>

        {/* Teams List */}
        <Card className="bg-card border">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">Team Rankings</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Loading teams...</span>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <div className="text-red-500 mb-4">Failed to load teams</div>
                <p className="text-muted-foreground mb-4">{error}</p>
                <Button onClick={() => fetchTeams(currentPage)} variant="outline">
                  Try Again
                </Button>
              </div>
            ) : teams.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-muted-foreground mb-4">No teams found</div>
                <p className="text-sm text-muted-foreground">Try refreshing the page or check back later.</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {teams.map((team) => (
                  <div key={`${team.team.id}-${team.rank}`} className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-primary">#{team.rank}</span>
                        </div>
                        <div>
                          <div className="font-semibold text-foreground">{team.team.name}</div>
                          <div className="text-sm text-muted-foreground">{team.team.location}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg text-foreground">{team.winRate}%</div>
                        <div className="text-sm text-muted-foreground">Win Rate</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-sm">
                          <span className="text-green-600 font-medium">{team.wins}W</span>
                          <span className="text-muted-foreground mx-1">-</span>
                          <span className="text-red-600 font-medium">{team.losses}L</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3 text-green-600" />
                          <span className="text-xs text-muted-foreground">Recent Form</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {team.recentForm.map((result, index) => (
                          <Badge
                            key={index}
                            variant={result === "W" ? "default" : "secondary"}
                            className={`w-6 h-6 text-xs p-0 flex items-center justify-center ${
                              result === "W"
                                ? "bg-green-100 text-green-800 border-green-200"
                                : "bg-red-100 text-red-800 border-red-200"
                            }`}
                          >
                            {result}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {renderPagination()}
      </div>
    </MobileLayout>
  )
}
