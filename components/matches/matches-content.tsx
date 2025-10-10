"use client"

import { useState } from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GameTabs } from "@/components/home/game-tabs"
import { MatchCard } from "@/components/home/match-card"
import { useLiveMatches } from "@/lib/hooks/use-live-matches"
import { useUpcomingMatches } from "@/lib/hooks/use-upcoming-matches"
import { usePastMatches } from "@/lib/hooks/use-past-matches"
import type { GameType } from "@/lib/api/pandascore/types"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle } from "lucide-react"

type MatchStatus = "live" | "upcoming" | "past"

export function MatchesContent() {
  const [selectedGame, setSelectedGame] = useState<GameType | "all">("all")
  const [matchStatus, setMatchStatus] = useState<MatchStatus>("live")

  const gameFilter = selectedGame === "all" ? undefined : selectedGame

  const { matches: liveMatches, isLoading: liveLoading, isError: liveError } = useLiveMatches(gameFilter)
  const {
    matches: upcomingMatches,
    isLoading: upcomingLoading,
    isError: upcomingError,
  } = useUpcomingMatches(gameFilter)
  const { matches: pastMatches, isLoading: pastLoading, isError: pastError } = usePastMatches(gameFilter)

  const matches = matchStatus === "live" ? liveMatches : matchStatus === "upcoming" ? upcomingMatches : pastMatches
  const isLoading = matchStatus === "live" ? liveLoading : matchStatus === "upcoming" ? upcomingLoading : pastLoading
  const isError = matchStatus === "live" ? liveError : matchStatus === "upcoming" ? upcomingError : pastError

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <Tabs value={matchStatus} onValueChange={(v) => setMatchStatus(v as MatchStatus)}>
          <TabsList>
            <TabsTrigger value="live">Live</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
          </TabsList>
        </Tabs>

        <GameTabs value={selectedGame} onValueChange={setSelectedGame} />
      </div>

      {isLoading && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(9)].map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      )}

      {isError && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Failed to load matches</h3>
          <p className="text-muted-foreground">Please try again later</p>
        </div>
      )}

      {!isLoading && !isError && matches.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <h3 className="text-lg font-semibold mb-2">No {matchStatus} matches</h3>
          <p className="text-muted-foreground">
            {matchStatus === "live"
              ? "Check back soon for live action"
              : matchStatus === "upcoming"
                ? "No upcoming matches scheduled"
                : "No past matches found"}
          </p>
        </div>
      )}

      {!isLoading && !isError && matches.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {matches.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>
      )}
    </div>
  )
}
