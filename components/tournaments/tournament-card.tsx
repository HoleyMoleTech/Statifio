import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Tournament } from "@/lib/api/pandascore/types"
import { Calendar, Trophy } from "lucide-react"
import { format } from "date-fns"
import Image from "next/image"

interface TournamentCardProps {
  tournament: Tournament
}

export function TournamentCard({ tournament }: TournamentCardProps) {
  const isOngoing =
    new Date(tournament.begin_at) <= new Date() && (!tournament.end_at || new Date(tournament.end_at) >= new Date())
  const isUpcoming = new Date(tournament.begin_at) > new Date()

  return (
    <Card className="overflow-hidden hover:border-primary/50 transition-colors h-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 flex-1">
            {tournament.league?.image_url && (
              <Image
                src={tournament.league.image_url || "/placeholder.svg"}
                alt={tournament.league.name}
                width={40}
                height={40}
                className="rounded"
              />
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-lg leading-tight mb-1 line-clamp-2">{tournament.name}</h3>
              <p className="text-sm text-muted-foreground">{tournament.league?.name}</p>
            </div>
          </div>

          {isOngoing && (
            <Badge variant="destructive" className="shrink-0">
              Live
            </Badge>
          )}
          {isUpcoming && <Badge className="shrink-0">Upcoming</Badge>}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex items-start gap-2 text-sm">
          <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
          <div>
            <p className="text-muted-foreground">Start: {format(new Date(tournament.begin_at), "MMM d, yyyy")}</p>
            {tournament.end_at && (
              <p className="text-muted-foreground">End: {format(new Date(tournament.end_at), "MMM d, yyyy")}</p>
            )}
          </div>
        </div>

        {tournament.prizepool && (
          <div className="flex items-center gap-2 text-sm">
            <Trophy className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{tournament.prizepool}</span>
          </div>
        )}

        {tournament.tier && (
          <div className="pt-2 border-t border-border/40">
            <Badge variant="secondary">{tournament.tier}</Badge>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
