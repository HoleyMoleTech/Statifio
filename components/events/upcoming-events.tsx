"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, MapPin, Users } from "lucide-react"

const upcomingEvents = [
  {
    id: 1,
    title: "LCS Spring Finals",
    game: "League of Legends",
    date: "2024-04-15",
    time: "15:00",
    location: "Los Angeles, CA",
    teams: ["Team Liquid", "Cloud9"],
    viewers: "2.5M expected",
    status: "upcoming",
  },
  {
    id: 2,
    title: "Premier League",
    game: "Football",
    date: "2024-04-14",
    time: "16:30",
    location: "Emirates Stadium",
    teams: ["Arsenal", "Chelsea"],
    viewers: "Live on TV",
    status: "upcoming",
  },
  {
    id: 3,
    title: "IEM Katowice",
    game: "Counter-Strike 2",
    date: "2024-04-16",
    time: "12:00",
    location: "Katowice, Poland",
    teams: ["FaZe Clan", "Natus Vincere"],
    viewers: "1.8M expected",
    status: "upcoming",
  },
  {
    id: 4,
    title: "Champions League",
    game: "Football",
    date: "2024-04-17",
    time: "20:00",
    location: "Santiago Bernabéu",
    teams: ["Real Madrid", "Manchester City"],
    viewers: "Live on TV",
    status: "upcoming",
  },
]

export function UpcomingEvents() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">Upcoming Events</h2>
        <Button variant="ghost" size="sm" className="text-primary">
          View Calendar
        </Button>
      </div>

      <div className="space-y-4">
        {upcomingEvents.map((event) => (
          <Card key={event.id} className="bg-card border">
            <CardContent className="p-4">
              <div className="space-y-4">
                {/* Event Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground text-balance">{event.title}</h3>
                    <p className="text-sm text-muted-foreground">{event.game}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {event.status}
                  </Badge>
                </div>

                {/* Teams */}
                <div className="flex items-center justify-center gap-4">
                  <div className="text-center flex-1">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div className="text-sm font-medium text-foreground">{event.teams[0]}</div>
                  </div>
                  <div className="text-muted-foreground font-bold">VS</div>
                  <div className="text-center flex-1">
                    <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Users className="h-6 w-6 text-secondary" />
                    </div>
                    <div className="text-sm font-medium text-foreground">{event.teams[1]}</div>
                  </div>
                </div>

                {/* Event Details */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-foreground">{new Date(event.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-foreground">{event.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-foreground text-pretty">{event.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-foreground">{event.viewers}</span>
                  </div>
                </div>

                {/* Action Button */}
                <Button variant="outline" className="w-full bg-transparent">
                  Set Reminder
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
