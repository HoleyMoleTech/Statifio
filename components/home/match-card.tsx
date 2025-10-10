import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Match } from "@/lib/api/pandascore/types"
import { Clock } from "lucide-react"
import { format } from "date-fns"
import Image from "next/image"
import Link from "next/link"

interface MatchCardProps {
  match: Match
}

function getGameType(match: Match): string {
  // Infer game type from league or tournament name
  const name = (match.league?.name || match.tournament?.name || "").toLowerCase()
  if (name.includes("league of legends") || name.includes("lol")) return "lol"
  if (name.includes("counter-strike") || name.includes("cs2") || name.includes("cs:go")) return "cs2"
  if (name.includes("dota")) return "dota2"
  return "lol" // default fallback
}

export function MatchCard({ match }: MatchCardProps) {
  const homeTeam = match.opponents[0]?.opponent
  const awayTeam = match.opponents[1]?.opponent
  const homeScore = match.results?.[0]?.score
  const awayScore = match.results?.[1]?.score
  const isLive = match.status === "running"
  const gameType = getGameType(match)

  return (
    <Link href={`/matches/${gameType}/${match.id}`}>
      <Card className="overflow-hidden hover:border-primary/50 transition-colors cursor-pointer h-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {match.league?.image_url && (
                <Image
                  src={match.league.image_url || "/placeholder.svg"}
                  alt={match.league.name}
                  width={24}
                  height={24}
                  className="rounded"
                />
              )}
              <span className="text-sm text-muted-foreground">{match.league?.name}</span>
            </div>

            {isLive ? (
              <Badge variant="destructive" className="animate-pulse">
                <span className="mr-1">●</span> LIVE
              </Badge>
            ) : (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="h-3 w-3" />
                {format(new Date(match.begin_at), "MMM d, HH:mm")}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                {homeTeam?.image_url && (
                  <Image
                    src={homeTeam.image_url || "/placeholder.svg"}
                    alt={homeTeam.name}
                    width={40}
                    height={40}
                    className="rounded"
                  />
                )}
                <span className="font-semibold text-lg">{homeTeam?.name || "TBD"}</span>
              </div>
              {isLive && homeScore !== undefined && (
                <span className="text-2xl font-bold text-primary">{homeScore}</span>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                {awayTeam?.image_url && (
                  <Image
                    src={awayTeam.image_url || "/placeholder.svg"}
                    alt={awayTeam.name}
                    width={40}
                    height={40}
                    className="rounded"
                  />
                )}
                <span className="font-semibold text-lg">{awayTeam?.name || "TBD"}</span>
              </div>
              {isLive && awayScore !== undefined && (
                <span className="text-2xl font-bold text-primary">{awayScore}</span>
              )}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-border/40">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{match.tournament?.name}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
