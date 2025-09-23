// Advanced caching system for API responses
interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number // Time to live in milliseconds
}

class CacheManager {
  private cache = new Map<string, CacheEntry<any>>()

  // Cache durations based on data type and importance
  private readonly CACHE_DURATIONS = {
    teams: 30 * 60 * 1000, // 30 minutes - teams don't change often
    matches: 5 * 60 * 1000, // 5 minutes - matches need frequent updates
    live_matches: 30 * 1000, // 30 seconds - live data needs real-time updates
    tournaments: 60 * 60 * 1000, // 1 hour - tournaments change infrequently
    overview: 10 * 60 * 1000, // 10 minutes - overview data
  } as const

  set<T>(key: string, data: T, type: keyof typeof this.CACHE_DURATIONS): void {
    const ttl = this.CACHE_DURATIONS[type]
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    })
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key)

    if (!entry) {
      return null
    }

    // Check if cache entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return null
    }

    return entry.data as T
  }

  // Clear expired entries to prevent memory leaks
  clearExpired(): void {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key)
      }
    }
  }

  // Get cache statistics for monitoring
  getStats() {
    return {
      totalEntries: this.cache.size,
      entries: Array.from(this.cache.entries()).map(([key, entry]) => ({
        key,
        age: Date.now() - entry.timestamp,
        ttl: entry.ttl,
        expired: Date.now() - entry.timestamp > entry.ttl,
      })),
    }
  }
}

export const cacheManager = new CacheManager()

// Cleanup expired cache entries every 5 minutes
if (typeof window === "undefined") {
  // Server-side only
  setInterval(
    () => {
      cacheManager.clearExpired()
    },
    5 * 60 * 1000,
  )
}
