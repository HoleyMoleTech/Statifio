import { Suspense } from "react"
import { TeamDetailsContent } from "@/components/teams/team-details-content"
import { Skeleton } from "@/components/ui/skeleton"
import { notFound } from "next/navigation"
import type { GameType } from "@/lib/api/pandascore/types"

interface TeamDetailsPageProps {
  params: Promise<{
    game: string
    id: string
  }>
}

export default async function TeamDetailsPage({ params }: TeamDetailsPageProps) {
  const { game, id } = await params

  // Validate game type
  if (!["lol", "cs2", "dota2"].includes(game)) {
    notFound()
  }

  const teamId = Number.parseInt(id)
  if (isNaN(teamId)) {
    notFound()
  }

  return (
    <div className="container py-8">
      <Suspense
        fallback={
          <div className="space-y-6">
            <Skeleton className="h-12 w-64" />
            <Skeleton className="h-64 w-full" />
            <div className="grid gap-6 md:grid-cols-2">
              <Skeleton className="h-96" />
              <Skeleton className="h-96" />
            </div>
          </div>
        }
      >
        <TeamDetailsContent game={game as GameType} teamId={teamId} />
      </Suspense>
    </div>
  )
}
