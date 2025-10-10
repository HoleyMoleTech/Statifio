import { Card, CardContent } from "@/components/ui/card"
import type { Team, GameType } from "@/lib/api/pandascore/types"
import { MapPin } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface TeamCardProps {
  team: Team
  game: GameType
}

export function TeamCard({ team, game }: TeamCardProps) {
  return (
    <Link href={`/teams/${game}/${team.id}`}>
      <Card className="overflow-hidden hover:border-primary/50 transition-colors cursor-pointer h-full">
        <CardContent className="p-6">
          <div className="flex flex-col items-center text-center">
            {team.image_url ? (
              <Image
                src={team.image_url || "/placeholder.svg"}
                alt={team.name}
                width={80}
                height={80}
                className="rounded-lg mb-4"
              />
            ) : (
              <div className="w-20 h-20 rounded-lg bg-muted flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-muted-foreground">{team.acronym || team.name[0]}</span>
              </div>
            )}

            <h3 className="text-lg font-bold mb-1">{team.name}</h3>

            {team.acronym && <p className="text-sm text-muted-foreground mb-3">{team.acronym}</p>}

            {team.location && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-3 w-3" />
                {team.location}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
