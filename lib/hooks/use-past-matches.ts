"use client"

import useSWR from "swr"
import type { GameType, Match } from "@/lib/api/pandascore/types"

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) throw new Error("Failed to fetch past matches")
  return res.json()
}

export function usePastMatches(game?: GameType) {
  const endpoint = game ? `/api/matches/past?game=${game}` : "/api/matches/past"

  const { data, error, isLoading } = useSWR<Match[]>(endpoint, fetcher, {
    refreshInterval: 60000, // Refresh every minute
    revalidateOnFocus: true,
  })

  return {
    matches: data || [],
    isLoading,
    isError: error,
  }
}
