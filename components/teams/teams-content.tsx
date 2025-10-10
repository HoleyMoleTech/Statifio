"use client"

import { useState } from "react"
import { GameTabs } from "@/components/home/game-tabs"
import { TeamCard } from "@/components/teams/team-card"
import { useTeams } from "@/lib/hooks/use-teams"
import type { GameType } from "@/lib/api/pandascore/types"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

export function TeamsContent() {
  const [selectedGame, setSelectedGame] = useState<GameType>("lol")
  const [searchQuery, setSearchQuery] = useState("")

  const { teams, isLoading, isError } = useTeams(selectedGame)

  const filteredTeams = teams.filter((team) => team.name.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <GameTabs value={selectedGame} onValueChange={(v) => setSelectedGame(v as GameType)} />

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search teams..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {isLoading && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(12)].map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      )}

      {isError && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Failed to load teams</h3>
          <p className="text-muted-foreground">Please try again later</p>
        </div>
      )}

      {!isLoading && !isError && filteredTeams.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <h3 className="text-lg font-semibold mb-2">No teams found</h3>
          <p className="text-muted-foreground">
            {searchQuery ? "Try adjusting your search query" : "No teams available for this game"}
          </p>
        </div>
      )}

      {!isLoading && !isError && filteredTeams.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredTeams.map((team) => (
            <TeamCard key={team.id} team={team} game={selectedGame} />
          ))}
        </div>
      )}
    </div>
  )
}
