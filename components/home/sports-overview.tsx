"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Trophy, Users, Calendar } from "lucide-react"
import Link from "next/link"

const sports = [
  {
    name: "League of Legends",
    icon: Trophy,
    href: "/matches?game=lol",
    description: "MOBA",
    color: "text-blue-500",
  },
  {
    name: "CS2",
    icon: Users,
    href: "/matches?game=csgo",
    description: "FPS",
    color: "text-orange-500",
  },
  {
    name: "Dota 2",
    icon: Calendar,
    href: "/matches?game=dota2",
    description: "MOBA",
    color: "text-red-500",
  },
]

export function SportsOverview() {
  return (
    <section className="px-4 py-8">
      <h2 className="text-2xl font-bold mb-4">Esports</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {sports.map((sport) => {
          const Icon = sport.icon
          return (
            <Link key={sport.name} href={sport.href}>
              <Card className="transition-colors hover:bg-accent">
                <CardContent className="flex items-center gap-4 p-6">
                  <div className={`rounded-lg bg-muted p-3 ${sport.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{sport.name}</h3>
                    <p className="text-sm text-muted-foreground">{sport.description}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
