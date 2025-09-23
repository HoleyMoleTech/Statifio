"use client"

import { MobileLayout } from "@/components/layout/mobile-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, TrendingUp } from "lucide-react"
import Link from "next/link"

const games = [
  {
    id: "lol",
    name: "League of Legends",
    description: "The world's most popular MOBA",
    color: "bg-blue-500",
    icon: "🏆",
    stats: {
      teams: "500+",
      players: "10M+",
      tournaments: "200+",
    },
  },
  {
    id: "csgo",
    name: "Counter-Strike: Global Offensive",
    description: "Tactical first-person shooter",
    color: "bg-orange-500",
    icon: "🎯",
    stats: {
      teams: "300+",
      players: "5M+",
      tournaments: "150+",
    },
  },
  {
    id: "dota2",
    name: "Dota 2",
    description: "Complex strategy MOBA",
    color: "bg-red-500",
    icon: "⚔️",
    stats: {
      teams: "200+",
      players: "3M+",
      tournaments: "100+",
    },
  },
]

export default function TeamsOverviewPage() {
  return (
    <MobileLayout title="Teams" showBack={true}>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center py-6">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">eSports Teams</h1>
          <p className="text-muted-foreground">Browse teams by game and view detailed rankings</p>
        </div>

        {/* Games Grid */}
        <div className="space-y-4">
          {games.map((game) => (
            <Card key={game.id} className="bg-card border hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 ${game.color} rounded-full flex items-center justify-center text-2xl`}>
                      {game.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-foreground">{game.name}</h3>
                      <p className="text-sm text-muted-foreground">{game.description}</p>
                    </div>
                  </div>
                  <Link href={`/teams/${game.id}`}>
                    <Button variant="outline" size="sm">
                      View Teams
                    </Button>
                  </Link>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-4 border-t border">
                  <div className="text-center">
                    <div className="font-bold text-foreground">{game.stats.teams}</div>
                    <div className="text-xs text-muted-foreground">Teams</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-foreground">{game.stats.players}</div>
                    <div className="text-xs text-muted-foreground">Players</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-foreground">{game.stats.tournaments}</div>
                    <div className="text-xs text-muted-foreground">Tournaments</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Stats */}
        <Card className="bg-card border">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Platform Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-foreground">1000+</div>
                <div className="text-sm text-muted-foreground">Total Teams</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-foreground">18M+</div>
                <div className="text-sm text-muted-foreground">Active Players</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MobileLayout>
  )
}
