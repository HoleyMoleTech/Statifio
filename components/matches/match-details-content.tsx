"use client"

import { useMatchDetails } from "@/lib/hooks/use-match-details"
import type { GameType } from "@/lib/api/pandascore/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, ArrowLeft, Calendar, MapPin, Trophy, TrendingUp, Users } from "lucide-react"
import { format } from "date-fns"
import Image from "next/image"
import Link from "next/link"

interface MatchDetailsContentProps {
  game: GameType
  matchId: number
}

export function MatchDetailsContent({ game, matchId }: MatchDetailsContentProps) {
  const { match, isLoading, isError } = useMatchDetails(game, matchId)

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-96 w-full" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    )
  }

  if (isError || !match) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Failed to load match details</h3>
        <p className="text-muted-foreground mb-4">The match could not be found or there was an error loading it</p>
        <Button asChild>
          <Link href="/matches">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Matches
          </Link>
        </Button>
      </div>
    )
  }

  const homeTeam = match.opponents[0]?.opponent
  const awayTeam = match.opponents[1]?.opponent
  const homeScore = match.results?.[0]?.score
  const awayScore = match.results?.[1]?.score
  const isLive = match.status === "running"
  const isFinished = match.status === "finished"

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/matches">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {match.league?.image_url && (
                <Image
                  src={match.league.image_url || "/placeholder.svg"}
                  alt={match.league.name}
                  width={40}
                  height={40}
                  className="rounded"
                />
              )}
              <div>
                <CardTitle className="text-2xl">{match.league?.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{match.tournament?.name}</p>
              </div>
            </div>

            {isLive && (
              <Badge variant="destructive" className="animate-pulse">
                <span className="mr-1">●</span> LIVE
              </Badge>
            )}
            {isFinished && <Badge variant="secondary">Finished</Badge>}
            {!isLive && !isFinished && <Badge>Upcoming</Badge>}
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid md:grid-cols-3 gap-8 items-center">
            {/* Home Team */}
            <div className="flex flex-col items-center text-center">
              {homeTeam?.image_url && (
                <Image
                  src={homeTeam.image_url || "/placeholder.svg"}
                  alt={homeTeam.name}
                  width={120}
                  height={120}
                  className="rounded-lg mb-4"
                />
              )}
              <h3 className="text-2xl font-bold mb-1">{homeTeam?.name || "TBD"}</h3>
              {homeTeam?.acronym && <p className="text-muted-foreground">{homeTeam.acronym}</p>}
            </div>

            {/* Score */}
            <div className="flex flex-col items-center justify-center">
              {(isLive || isFinished) && homeScore !== undefined && awayScore !== undefined ? (
                <div className="flex items-center gap-6">
                  <span className="text-6xl font-bold">{homeScore}</span>
                  <span className="text-4xl text-muted-foreground">-</span>
                  <span className="text-6xl font-bold">{awayScore}</span>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">Match starts</p>
                  <p className="text-xl font-semibold">{format(new Date(match.begin_at), "MMM d, yyyy")}</p>
                  <p className="text-lg text-muted-foreground">{format(new Date(match.begin_at), "HH:mm")}</p>
                </div>
              )}
            </div>

            {/* Away Team */}
            <div className="flex flex-col items-center text-center">
              {awayTeam?.image_url && (
                <Image
                  src={awayTeam.image_url || "/placeholder.svg"}
                  alt={awayTeam.name}
                  width={120}
                  height={120}
                  className="rounded-lg mb-4"
                />
              )}
              <h3 className="text-2xl font-bold mb-1">{awayTeam?.name || "TBD"}</h3>
              {awayTeam?.acronym && <p className="text-muted-foreground">{awayTeam.acronym}</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Match Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Match Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <Trophy className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Tournament</p>
                <p className="font-medium">{match.tournament?.name}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Serie</p>
                <p className="font-medium">{match.serie?.name}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Start Time</p>
                <p className="font-medium">{format(new Date(match.begin_at), "PPpp")}</p>
              </div>
            </div>

            {match.end_at && (
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">End Time</p>
                  <p className="font-medium">{format(new Date(match.end_at), "PPpp")}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Streams */}
        {match.streams_list && match.streams_list.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Live Streams
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {match.streams_list.map((stream, index) => (
                <div key={index} className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{stream.language.toUpperCase()}</p>
                      {stream.official && (
                        <Badge variant="secondary" className="text-xs">
                          Official
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button size="sm" asChild>
                    <a href={stream.raw_url} target="_blank" rel="noopener noreferrer">
                      Watch
                    </a>
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Games */}
        {match.games && match.games.length > 0 && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Games</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {match.games.map((game, index) => (
                  <div key={game.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div className="flex items-center gap-4">
                      <span className="text-lg font-bold text-muted-foreground">Game {index + 1}</span>
                      <Badge variant={game.status === "finished" ? "secondary" : "default"}>{game.status}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {format(new Date(game.begin_at), "HH:mm")}
                      {game.end_at && ` - ${format(new Date(game.end_at), "HH:mm")}`}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
