"use client"

import { useTeamDetails } from "@/lib/hooks/use-team-details"
import type { GameType } from "@/lib/api/pandascore/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, ArrowLeft, MapPin, Users } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface TeamDetailsContentProps {
  game: GameType
  teamId: number
}

export function TeamDetailsContent({ game, teamId }: TeamDetailsContentProps) {
  const { team, isLoading, isError } = useTeamDetails(game, teamId)

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-64 w-full" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    )
  }

  if (isError || !team) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Failed to load team details</h3>
        <p className="text-muted-foreground mb-4">The team could not be found or there was an error loading it</p>
        <Button asChild>
          <Link href="/teams">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Teams
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/teams">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            {team.image_url ? (
              <Image
                src={team.image_url || "/placeholder.svg"}
                alt={team.name}
                width={160}
                height={160}
                className="rounded-lg"
              />
            ) : (
              <div className="w-40 h-40 rounded-lg bg-muted flex items-center justify-center">
                <span className="text-5xl font-bold text-muted-foreground">{team.acronym || team.name[0]}</span>
              </div>
            )}

            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl font-bold mb-2">{team.name}</h1>
              {team.acronym && <p className="text-xl text-muted-foreground mb-4">{team.acronym}</p>}

              {team.location && (
                <div className="flex items-center gap-2 text-muted-foreground justify-center md:justify-start">
                  <MapPin className="h-4 w-4" />
                  {team.location}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Team ID</p>
              <p className="font-medium">{team.id}</p>
            </div>

            {team.acronym && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Acronym</p>
                <p className="font-medium">{team.acronym}</p>
              </div>
            )}

            {team.location && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Location</p>
                <p className="font-medium">{team.location}</p>
              </div>
            )}

            <div>
              <p className="text-sm text-muted-foreground mb-1">Game</p>
              <p className="font-medium uppercase">{game}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
