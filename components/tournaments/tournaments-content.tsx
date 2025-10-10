"use client"

import { useState } from "react"
import { GameTabs } from "@/components/home/game-tabs"
import { TournamentCard } from "@/components/tournaments/tournament-card"
import { useTournaments } from "@/lib/hooks/use-tournaments"
import type { GameType } from "@/lib/api/pandascore/types"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

export function TournamentsContent() {
  const [selectedGame, setSelectedGame] = useState<GameType>("lol")
  const [searchQuery, setSearchQuery] = useState("")

  const { tournaments, isLoading, isError } = useTournaments(selectedGame)

  const filteredTournaments = tournaments.filter((tournament) =>
    tournament.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <GameTabs value={selectedGame} onValueChange={(v) => setSelectedGame(v as GameType)} />

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tournaments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
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
          <h3 className="text-lg font-semibold mb-2">Failed to load tournaments</h3>
          <p className="text-muted-foreground">Please try again later</p>
        </div>
      )}

      {!isLoading && !isError && filteredTournaments.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <h3 className="text-lg font-semibold mb-2">No tournaments found</h3>
          <p className="text-muted-foreground">
            {searchQuery ? "Try adjusting your search query" : "No tournaments available for this game"}
          </p>
        </div>
      )}

      {!isLoading && !isError && filteredTournaments.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredTournaments.map((tournament) => (
            <TournamentCard key={tournament.id} tournament={tournament} />
          ))}
        </div>
      )}
    </div>
  )
}
