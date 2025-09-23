"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EsportsStats } from "./esports-stats"
import { FootballStats } from "./football-stats"
import { Gamepad2, Trophy } from "lucide-react"

export function SportsTabs() {
  return (
    <Tabs defaultValue="esports" className="w-full">
      <TabsList className="grid w-full grid-cols-2 bg-muted">
        <TabsTrigger value="esports" className="flex items-center gap-2">
          <Gamepad2 className="h-4 w-4" />
          eSports
        </TabsTrigger>
        <TabsTrigger value="football" className="flex items-center gap-2">
          <Trophy className="h-4 w-4" />
          Football
        </TabsTrigger>
      </TabsList>

      <TabsContent value="esports" className="mt-6">
        <EsportsStats />
      </TabsContent>

      <TabsContent value="football" className="mt-6">
        <FootballStats />
      </TabsContent>
    </Tabs>
  )
}
