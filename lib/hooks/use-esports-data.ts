"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { esportsService } from "@/lib/services/esports-service"
import type { GameStats, TeamRanking, MatchResult } from "@/lib/api/types"

// Global request cache to prevent duplicate requests
const requestCache = new Map<string, Promise<any>>()
const requestTimestamps = new Map<string, number>()

// Utility to create cache keys
function createCacheKey(fn: string, ...args: any[]): string {
  return `${fn}:${JSON.stringify(args)}`
}

// Utility to check if data is fresh (within 5 minutes)
function isDataFresh(key: string, maxAge = 300000): boolean {
  const timestamp = requestTimestamps.get(key)
  return timestamp ? Date.now() - timestamp < maxAge : false
}

// Custom hook for fetching esports data with loading states
export function useEsportsOverview() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    const cacheKey = createCacheKey("esportsOverview")

    // Return cached data if fresh
    if (isDataFresh(cacheKey) && data) {
      return
    }

    // Check if request is already in progress
    if (requestCache.has(cacheKey)) {
      try {
        const cachedResult = await requestCache.get(cacheKey)
        setData(cachedResult)
        setError(null)
        return
      } catch (err) {
        // Continue with new request if cached request failed
      }
    }

    try {
      setLoading(true)
      const request = esportsService.getEsportsOverview()
      requestCache.set(cacheKey, request)

      const overview = await request
      setData(overview)
      setError(null)
      requestTimestamps.set(cacheKey, Date.now())
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch esports data")
    } finally {
      setLoading(false)
      requestCache.delete(cacheKey)
    }
  }, [data])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, refetch: fetchData }
}

export function useGameStats(videogame: string) {
  const [stats, setStats] = useState<GameStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = useCallback(async () => {
    const cacheKey = createCacheKey("gameStats", videogame)

    if (isDataFresh(cacheKey) && stats) {
      return
    }

    if (requestCache.has(cacheKey)) {
      try {
        const cachedResult = await requestCache.get(cacheKey)
        setStats(cachedResult)
        setError(null)
        return
      } catch (err) {
        // Continue with new request
      }
    }

    try {
      setLoading(true)
      const request = esportsService.getGameStats(videogame)
      requestCache.set(cacheKey, request)

      const gameStats = await request
      setStats(gameStats)
      setError(null)
      requestTimestamps.set(cacheKey, Date.now())
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch game stats")
    } finally {
      setLoading(false)
      requestCache.delete(cacheKey)
    }
  }, [videogame, stats])

  useEffect(() => {
    if (videogame) {
      fetchStats()
    }
  }, [videogame, fetchStats])

  return { stats, loading, error, refetch: fetchStats }
}

export function useTopTeams(videogame: string, limit = 10) {
  const [teams, setTeams] = useState<TeamRanking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTeams = useCallback(async () => {
    const cacheKey = createCacheKey("topTeams", videogame, limit)

    if (isDataFresh(cacheKey) && teams.length > 0) {
      return
    }

    if (requestCache.has(cacheKey)) {
      try {
        const cachedResult = await requestCache.get(cacheKey)
        setTeams(cachedResult)
        setError(null)
        return
      } catch (err) {
        // Continue with new request
      }
    }

    try {
      setLoading(true)
      const request = esportsService.getTopTeams(videogame, limit)
      requestCache.set(cacheKey, request)

      const topTeams = await request
      setTeams(topTeams)
      setError(null)
      requestTimestamps.set(cacheKey, Date.now())
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch top teams")
    } finally {
      setLoading(false)
      requestCache.delete(cacheKey)
    }
  }, [videogame, limit, teams.length])

  useEffect(() => {
    if (videogame) {
      fetchTeams()
    }
  }, [videogame, limit, fetchTeams])

  return { teams, loading, error, refetch: fetchTeams }
}

export function useRecentMatches(videogame: string, limit = 10) {
  const [matches, setMatches] = useState<MatchResult[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMatches = useCallback(async () => {
    const cacheKey = createCacheKey("recentMatches", videogame, limit)

    if (isDataFresh(cacheKey) && matches.length > 0) {
      return
    }

    if (requestCache.has(cacheKey)) {
      try {
        const cachedResult = await requestCache.get(cacheKey)
        setMatches(cachedResult)
        setError(null)
        return
      } catch (err) {
        // Continue with new request
      }
    }

    try {
      setLoading(true)
      const request = esportsService.getRecentMatches(videogame, limit)
      requestCache.set(cacheKey, request)

      const recentMatches = await request
      setMatches(recentMatches)
      setError(null)
      requestTimestamps.set(cacheKey, Date.now())
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch recent matches")
    } finally {
      setLoading(false)
      requestCache.delete(cacheKey)
    }
  }, [videogame, limit, matches.length])

  useEffect(() => {
    if (videogame) {
      fetchMatches()
    }
  }, [videogame, limit, fetchMatches])

  return { matches, loading, error, refetch: fetchMatches }
}

export function useLiveMatches() {
  const [matches, setMatches] = useState<MatchResult[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const isVisibleRef = useRef(true)

  const fetchLiveMatches = useCallback(async () => {
    const cacheKey = createCacheKey("liveMatches")

    // For live matches, use shorter cache time (30 seconds)
    if (isDataFresh(cacheKey, 30000) && matches.length > 0) {
      return
    }

    if (requestCache.has(cacheKey)) {
      try {
        const cachedResult = await requestCache.get(cacheKey)
        setMatches(cachedResult)
        setError(null)
        return
      } catch (err) {
        // Continue with new request
      }
    }

    try {
      setLoading(true)
      const request = esportsService.getLiveMatches()
      requestCache.set(cacheKey, request)

      const liveMatches = await request
      console.log("[v0] useLiveMatches received:", liveMatches)
      setMatches(liveMatches)
      setError(null)
      requestTimestamps.set(cacheKey, Date.now())
    } catch (err) {
      console.error("[v0] useLiveMatches error:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch live matches")
    } finally {
      setLoading(false)
      requestCache.delete(cacheKey)
    }
  }, [matches.length])

  useEffect(() => {
    // Handle page visibility changes
    const handleVisibilityChange = () => {
      isVisibleRef.current = !document.hidden

      if (isVisibleRef.current) {
        // Page became visible, fetch immediately
        fetchLiveMatches()
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)

    // Initial fetch
    fetchLiveMatches()

    // Set up intelligent polling
    const startPolling = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }

      intervalRef.current = setInterval(() => {
        // Only poll if page is visible
        if (isVisibleRef.current) {
          fetchLiveMatches()
        }
      }, 60000) // Increased to 60 seconds to reduce API calls
    }

    startPolling()

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [fetchLiveMatches])

  return { matches, loading, error, refetch: fetchLiveMatches }
}
