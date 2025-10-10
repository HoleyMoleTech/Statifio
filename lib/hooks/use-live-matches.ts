"use client"

import useSWR from "swr"
import type { GameType, Match } from "@/lib/api/pandascore/types"

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) throw new Error("Failed to fetch")
  return res.json()
}

export function useLiveMatches(game?: GameType) {
  const { data, error, isLoading, mutate } = useSWR<Match[]>(
    `/api/esports/live-matches${game ? `?game=${game}` : ""}`,
    fetcher,
    {
      refreshInterval: 30000, // Refresh every 30 seconds
      revalidateOnFocus: true,
    },
  )

  return {
    matches: data || [],
    isLoading,
    isError: error,
    refresh: mutate,
  }
}
