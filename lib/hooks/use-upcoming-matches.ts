"use client"

import useSWR from "swr"
import type { GameType, Match } from "@/lib/api/pandascore/types"

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) throw new Error("Failed to fetch")
  return res.json()
}

export function useUpcomingMatches(game?: GameType) {
  const { data, error, isLoading } = useSWR<Match[]>(
    `/api/esports/upcoming-matches${game ? `?game=${game}` : ""}`,
    fetcher,
    {
      refreshInterval: 60000, // Refresh every minute
    },
  )

  return {
    matches: data || [],
    isLoading,
    isError: error,
  }
}
