"use client"

import useSWR from "swr"
import type { GameType, Tournament } from "@/lib/api/pandascore/types"

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) throw new Error("Failed to fetch tournaments")
  return res.json()
}

export function useTournaments(game: GameType) {
  const { data, error, isLoading } = useSWR<Tournament[]>(`/api/tournaments/${game}`, fetcher, {
    refreshInterval: 300000, // Refresh every 5 minutes
    revalidateOnFocus: true,
  })

  return {
    tournaments: data || [],
    isLoading,
    isError: error,
  }
}
