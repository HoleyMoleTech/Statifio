// Resource monitoring and API usage tracking
interface APIUsageStats {
  totalRequests: number
  requestsThisHour: number
  lastRequestTime: number
  averageResponseTime: number
  errorRate: number
  cacheHitRate: number
}

interface RateLimitInfo {
  remaining: number
  resetTime: string
  limit: number
  used: number
}

class ResourceMonitor {
  private stats: APIUsageStats = {
    totalRequests: 0,
    requestsThisHour: 0,
    lastRequestTime: 0,
    averageResponseTime: 0,
    errorRate: 0,
    cacheHitRate: 0,
  }

  private requestTimes: number[] = []
  private hourlyRequests: number[] = []
  private errors = 0
  private cacheHits = 0
  private cacheMisses = 0

  private readonly HOURLY_LIMIT = 1000 // PandaScore API limit
  private readonly RESET_INTERVAL = 60 * 60 * 1000 // 1 hour in milliseconds

  // Track API request
  trackRequest(responseTime: number, isError = false) {
    this.stats.totalRequests++
    this.stats.lastRequestTime = Date.now()

    // Track response times
    this.requestTimes.push(responseTime)
    if (this.requestTimes.length > 100) {
      this.requestTimes.shift() // Keep only last 100 requests
    }

    // Calculate average response time
    this.stats.averageResponseTime = this.requestTimes.reduce((a, b) => a + b, 0) / this.requestTimes.length

    // Track errors
    if (isError) {
      this.errors++
    }

    // Calculate error rate
    this.stats.errorRate = (this.errors / this.stats.totalRequests) * 100

    // Track hourly requests
    this.updateHourlyCount()
  }

  // Track cache usage
  trackCacheHit() {
    this.cacheHits++
    this.updateCacheHitRate()
  }

  trackCacheMiss() {
    this.cacheMisses++
    this.updateCacheHitRate()
  }

  private updateCacheHitRate() {
    const total = this.cacheHits + this.cacheMisses
    this.stats.cacheHitRate = total > 0 ? (this.cacheHits / total) * 100 : 0
  }

  private updateHourlyCount() {
    const now = Date.now()
    const oneHourAgo = now - this.RESET_INTERVAL

    // Add current request
    this.hourlyRequests.push(now)

    // Remove requests older than 1 hour
    this.hourlyRequests = this.hourlyRequests.filter((time) => time > oneHourAgo)

    this.stats.requestsThisHour = this.hourlyRequests.length
  }

  getRateLimitInfo(): RateLimitInfo {
    const now = Date.now()
    const oldestRequest = this.hourlyRequests[0] || now
    const resetTime = new Date(oldestRequest + this.RESET_INTERVAL).toISOString()

    return {
      limit: this.HOURLY_LIMIT,
      used: this.stats.requestsThisHour,
      remaining: Math.max(0, this.HOURLY_LIMIT - this.stats.requestsThisHour),
      resetTime,
    }
  }

  canMakeRequest(): boolean {
    return this.stats.requestsThisHour < this.HOURLY_LIMIT
  }

  // Get current usage statistics
  getStats(): APIUsageStats & {
    rateLimitStatus: "safe" | "warning" | "critical"
    recommendedAction: string
  } {
    let rateLimitStatus: "safe" | "warning" | "critical" = "safe"
    let recommendedAction = "Continue normal operation"

    if (this.stats.requestsThisHour > 800) {
      rateLimitStatus = "critical"
      recommendedAction = "Reduce API calls immediately - approaching rate limit"
    } else if (this.stats.requestsThisHour > 600) {
      rateLimitStatus = "warning"
      recommendedAction = "Monitor usage closely - consider increasing cache duration"
    }

    return {
      ...this.stats,
      rateLimitStatus,
      recommendedAction,
    }
  }

  // Reset statistics (for testing or new periods)
  reset() {
    this.stats = {
      totalRequests: 0,
      requestsThisHour: 0,
      lastRequestTime: 0,
      averageResponseTime: 0,
      errorRate: 0,
      cacheHitRate: 0,
    }
    this.requestTimes = []
    this.hourlyRequests = []
    this.errors = 0
    this.cacheHits = 0
    this.cacheMisses = 0
  }
}

export const resourceMonitor = new ResourceMonitor()
