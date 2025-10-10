"use client"

import { useState } from "react"
import { GameTabs } from "./game-tabs"
import { MatchCard } from "./match-card"
import { useUpcomingMatches } from "@/lib/hooks/use-upcoming-matches"
import type { GameType } from "@/lib/api/pandascore/types"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

export function UpcomingMatchesSection() {
  const [selectedGame, setSelectedGame] = useState<GameType | "all">("all")
  const { matches, isLoading } = useUpcomingMatches(selectedGame === "all" ? undefined : selectedGame)

  const displayMatches = matches.slice(0, 6)

  return (
    <section className="container py-12 md:py-16 border-t border-border/40">
      <div className="mb-8">
        <h2 className="text-3xl md:text-4xl font-bold mb-2">Upcoming Matches</h2>
        <p className="text-muted-foreground">Schedule for the next matches</p>
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

      {!isLoading && displayMatches.length > 0 && (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
            {displayMatches.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>

          <div className="text-center">
            <Button variant="outline" size="lg" asChild>
              <Link href="/matches">
                View All Matches
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </>
      )}
    </section>
  )
}
