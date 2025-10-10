"use client"

import useSWR from "swr"
import type { GameType, Match } from "@/lib/api/pandascore/types"

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) throw new Error("Failed to fetch match details")
  return res.json()
}

export function useMatchDetails(game: GameType, matchId: number) {
  const { data, error, isLoading } = useSWR<Match>(`/api/matches/${game}/${matchId}`, fetcher, {
    refreshInterval: 30000, // Refresh every 30 seconds for live updates
    revalidateOnFocus: true,
  })

  return {
    match: data,
    isLoading,
    isError: error,
  }
}
