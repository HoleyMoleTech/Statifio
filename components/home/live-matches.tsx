"use client"
import { MatchCard } from "./match-card"
import { useLiveMatches } from "@/lib/hooks/use-live-matches"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function LiveMatches() {
  const { matches, isLoading, isError } = useLiveMatches()

  return (
    <section className="px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Live Matches</h2>
          <p className="text-sm text-muted-foreground">Watch ongoing matches in real-time</p>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/matches">View All</Link>
        </Button>
      </div>

      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      )}

      {isError && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-card p-12 text-center">
          <AlertCircle className="mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-semibold">Failed to load matches</h3>
          <p className="text-muted-foreground">Please try again later</p>
        </div>
      )}

      {!isLoading && !isError && matches.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-card p-12 text-center">
          <h3 className="mb-2 text-lg font-semibold">No live matches</h3>
          <p className="text-muted-foreground">Check back soon for live action</p>
        </div>
      )}

      {!isLoading && !isError && matches.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {matches.slice(0, 3).map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>
      )}
    </section>
  )
}
