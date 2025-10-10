import { Suspense } from "react"
import { MatchDetailsContent } from "@/components/matches/match-details-content"
import { Skeleton } from "@/components/ui/skeleton"
import { notFound } from "next/navigation"
import type { GameType } from "@/lib/api/pandascore/types"

interface MatchDetailsPageProps {
  params: Promise<{
    game: string
    id: string
  }>
}

export default async function MatchDetailsPage({ params }: MatchDetailsPageProps) {
  const { game, id } = await params

  // Validate game type
  if (!["lol", "cs2", "dota2"].includes(game)) {
    notFound()
  }

  const matchId = Number.parseInt(id)
  if (isNaN(matchId)) {
    notFound()
  }

  return (
    <div className="container py-8">
      <Suspense
        fallback={
          <div className="space-y-6">
            <Skeleton className="h-12 w-64" />
            <Skeleton className="h-96 w-full" />
            <div className="grid gap-6 md:grid-cols-2">
              <Skeleton className="h-64" />
              <Skeleton className="h-64" />
            </div>
          </div>
        }
      >
        <MatchDetailsContent game={game as GameType} matchId={matchId} />
      </Suspense>
    </div>
  )
}
