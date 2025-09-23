"use client"

import { useState, useEffect, useCallback } from "react"

interface PlatformStats {
  totalMatches: number
  totalPlayers: number
  totalTeams: number
  isLoading: boolean
  error: string | null
}

let cachedStats: PlatformStats | null = null
let cacheTimestamp = 0
let ongoingRequest: Promise<any> | null = null

export function usePlatformStats(): PlatformStats {
  const [stats, setStats] = useState<PlatformStats>({
    totalMatches: 0,
    totalPlayers: 0,
    totalTeams: 0,
    isLoading: true,
    error: null,
  })

  const fetchStats = useCallback(async () => {
    // Return cached data if fresh (within 5 minutes)
    if (cachedStats && Date.now() - cacheTimestamp < 300000) {
      setStats(cachedStats)
      return
    }

    // If request is already ongoing, wait for it
    if (ongoingRequest) {
      try {
        const result = await ongoingRequest
        setStats(result)
        return
      } catch (err) {
        // Continue with new request if cached request failed
      }
    }

    try {
      setStats((prev) => ({ ...prev, isLoading: true, error: null }))

      ongoingRequest = fetch("/api/esports/overview").then(async (response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch statistics")
        }

        const data = await response.json()
        console.log("[v0] Platform stats API response:", data)

        const totalMatches =
          data.data?.games?.reduce((sum: number, game: any) => sum + (game.stats.activeMatches || 0), 0) || 0
        const totalPlayers =
          data.data?.games?.reduce((sum: number, game: any) => sum + (game.stats.totalPlayers || 0), 0) || 0
        const totalTeams =
          data.data?.games?.reduce((sum: number, game: any) => sum + (game.stats.totalPlayers / 5 || 0), 0) || 0

        console.log("[v0] Calculated totals:", { totalMatches, totalPlayers, totalTeams })

        const newStats = {
          totalMatches,
          totalPlayers,
          totalTeams: Math.floor(totalTeams),
          isLoading: false,
          error: null,
        }

        // Cache the result
        cachedStats = newStats
        cacheTimestamp = Date.now()

        return newStats
      })

      const result = await ongoingRequest
      setStats(result)
    } catch (error) {
      console.error("Error fetching platform stats:", error)
      const errorStats = {
        totalMatches: 0,
        totalPlayers: 0,
        totalTeams: 0,
        isLoading: false,
        error: error instanceof Error ? error.message : "Failed to load statistics",
      }
      setStats(errorStats)
      cachedStats = errorStats
      cacheTimestamp = Date.now()
    } finally {
      ongoingRequest = null
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  return stats
}
