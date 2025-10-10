"use client"

import useSWR from "swr"
import type { GameType, Team } from "@/lib/api/pandascore/types"

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) throw new Error("Failed to fetch team details")
  return res.json()
}

export function useTeamDetails(game: GameType, teamId: number) {
  const { data, error, isLoading } = useSWR<Team>(`/api/teams/${game}/${teamId}`, fetcher, {
    refreshInterval: 300000, // Refresh every 5 minutes
    revalidateOnFocus: true,
  })

  return {
    team: data,
    isLoading,
    isError: error,
  }
}
