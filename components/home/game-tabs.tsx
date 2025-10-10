"use client"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { GameType } from "@/lib/api/pandascore/types"

interface GameTabsProps {
  value: GameType | "all"
  onValueChange: (value: GameType | "all") => void
}

export function GameTabs({ value, onValueChange }: GameTabsProps) {
  return (
    <Tabs value={value} onValueChange={(v) => onValueChange(v as GameType | "all")} className="w-full">
      <TabsList className="grid w-full max-w-md grid-cols-4">
        <TabsTrigger value="all">All Games</TabsTrigger>
        <TabsTrigger value="lol">LoL</TabsTrigger>
        <TabsTrigger value="cs2">CS2</TabsTrigger>
        <TabsTrigger value="dota2">Dota 2</TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
