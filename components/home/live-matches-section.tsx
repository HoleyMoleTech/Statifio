"use client"

import { useState } from "react"
import { GameTabs } from "./game-tabs"
import { MatchCard } from "./match-card"
import { useLiveMatches } from "@/lib/hooks/use-live-matches"
import type { GameType } from "@/lib/api/pandascore/types"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle } from "lucide-react"

export function LiveMatchesSection() {
  const [selectedGame, setSelectedGame] = useState<GameType | "all">("all")
  const { matches, isLoading, isError } = useLiveMatches(selectedGame === "all" ? undefined : selectedGame)

  return (
    <section className="container py-12 md:py-16">
      <div className="mb-8">
        <h2 className="text-3xl md:text-4xl font-bold mb-2">Live Matches</h2>
        <p className="text-muted-foreground">Watch ongoing matches in real-time</p>
      </div>

      <div className="mb-8">
        <GameTabs value={selectedGame} onValueChange={setSelectedGame} />
      </div>

      {isLoading && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
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
          <h3 className="text-lg font-semibold mb-2">No live matches</h3>
          <p className="text-muted-foreground">Check back soon for live action</p>
        </div>
      )}

      {!isLoading && !isError && matches.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {matches.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>
      )}
    </section>
  )
}
