// Simple in-memory cache for API responses
interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

class APICache {
  private cache = new Map<string, CacheEntry<any>>()

  set<T>(key: string, data: T, ttlMinutes = 5): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMinutes * 60 * 1000,
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

    return entry.data
  }

  clear(): void {
    this.cache.clear()
  }

  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  // Get cache statistics
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    }
  }
}

export const apiCache = new APICache()

// Cache wrapper function
export async function withCache<T>(key: string, fetcher: () => Promise<T>, ttlMinutes = 5): Promise<T> {
  // Try to get from cache first
  const cached = apiCache.get<T>(key)
  if (cached) {
    return cached
  }

  // Fetch fresh data
  const data = await fetcher()

  // Store in cache
  apiCache.set(key, data, ttlMinutes)

  return data
}
