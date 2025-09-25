import type React from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { Skeleton, MatchSkeleton, TeamSkeleton, GameStatsSkeleton, HeroStatsSkeleton } from "./loading-skeleton"

export function LoadingSpinner({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="flex items-center justify-center py-8">
      <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
      <span className="text-muted-foreground">{message}</span>
    </div>
  )
}

export function FullPageLoading({ message = "Loading Statifio..." }: { message?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground">{message}</h2>
          <p className="text-muted-foreground">Getting the latest sports data...</p>
        </div>
      </div>
    </div>
  )
}

export function LiveMatchesLoading() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} className="bg-card border">
          <CardContent className="p-0">
            <MatchSkeleton />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export function TopTeamsLoading() {
  return (
    <Card className="bg-card border">
      <CardHeader>
        <Skeleton className="h-6 w-24" />
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {Array.from({ length: 5 }).map((_, i) => (
            <TeamSkeleton key={i} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function GameStatsLoading() {
  return (
    <div className="grid gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} className="bg-card border">
          <CardContent className="p-0">
            <GameStatsSkeleton />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export function HeroStatsLoading() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="bg-card border">
          <CardContent className="p-0">
            <HeroStatsSkeleton />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string
  description: string
  action?: React.ReactNode
}) {
  return (
    <div className="text-center py-12 space-y-4">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <p className="text-muted-foreground max-w-md mx-auto">{description}</p>
      </div>
      {action}
    </div>
  )
}

export const LoadingStates = {
  Spinner: LoadingSpinner,
  FullPage: FullPageLoading,
  LiveMatches: LiveMatchesLoading,
  TopTeams: TopTeamsLoading,
  GameStats: GameStatsLoading,
  HeroStats: HeroStatsLoading,
  Empty: EmptyState,
}
