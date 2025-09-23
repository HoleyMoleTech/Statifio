interface PerformanceMetrics {
  requestId: string
  endpoint: string
  method: string
  startTime: number
  endTime?: number
  duration?: number
  status?: number
  error?: string
  cacheHit?: boolean
  apiCallsUsed?: number
  memoryUsage?: {
    used: number
    total: number
    percentage: number
  }
}

interface AggregatedMetrics {
  totalRequests: number
  averageResponseTime: number
  errorRate: number
  cacheHitRate: number
  slowestEndpoints: Array<{
    endpoint: string
    averageTime: number
    requestCount: number
  }>
  errorsByType: Record<string, number>
  requestsPerMinute: number
  memoryTrend: Array<{
    timestamp: number
    usage: number
  }>
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = []
  private readonly MAX_METRICS = 1000 // Keep last 1000 requests
  private readonly MEMORY_SAMPLES = 100 // Keep last 100 memory samples

  // Start tracking a request
  startRequest(endpoint: string, method = "GET"): string {
    const requestId = `perf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const metric: PerformanceMetrics = {
      requestId,
      endpoint,
      method,
      startTime: performance.now(),
    }

    this.metrics.push(metric)

    // Keep only recent metrics
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics = this.metrics.slice(-this.MAX_METRICS)
    }

    return requestId
  }

  // End tracking a request
  endRequest(requestId: string, status?: number, error?: string, cacheHit?: boolean, apiCallsUsed?: number): void {
    const metric = this.metrics.find((m) => m.requestId === requestId)
    if (!metric) return

    const endTime = performance.now()
    metric.endTime = endTime
    metric.duration = endTime - metric.startTime
    metric.status = status
    metric.error = error
    metric.cacheHit = cacheHit
    metric.apiCallsUsed = apiCallsUsed

    // Add memory usage if available
    if (typeof window !== "undefined" && "memory" in performance) {
      const memory = (performance as any).memory
      metric.memoryUsage = {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        percentage: (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100,
      }
    }

    console.log(
      `[Performance] ${metric.method} ${metric.endpoint}: ${metric.duration?.toFixed(2)}ms (${status || "unknown"})`,
    )
  }

  // Get aggregated performance metrics
  getAggregatedMetrics(): AggregatedMetrics {
    const completedMetrics = this.metrics.filter((m) => m.duration !== undefined)
    const totalRequests = completedMetrics.length

    if (totalRequests === 0) {
      return {
        totalRequests: 0,
        averageResponseTime: 0,
        errorRate: 0,
        cacheHitRate: 0,
        slowestEndpoints: [],
        errorsByType: {},
        requestsPerMinute: 0,
        memoryTrend: [],
      }
    }

    // Calculate average response time
    const totalTime = completedMetrics.reduce((sum, m) => sum + (m.duration || 0), 0)
    const averageResponseTime = totalTime / totalRequests

    // Calculate error rate
    const errorCount = completedMetrics.filter((m) => m.error || (m.status && m.status >= 400)).length
    const errorRate = (errorCount / totalRequests) * 100

    // Calculate cache hit rate
    const cacheableRequests = completedMetrics.filter((m) => m.cacheHit !== undefined)
    const cacheHits = cacheableRequests.filter((m) => m.cacheHit).length
    const cacheHitRate = cacheableRequests.length > 0 ? (cacheHits / cacheableRequests.length) * 100 : 0

    // Find slowest endpoints
    const endpointStats = new Map<string, { totalTime: number; count: number }>()
    completedMetrics.forEach((m) => {
      const key = `${m.method} ${m.endpoint}`
      const existing = endpointStats.get(key) || { totalTime: 0, count: 0 }
      endpointStats.set(key, {
        totalTime: existing.totalTime + (m.duration || 0),
        count: existing.count + 1,
      })
    })

    const slowestEndpoints = Array.from(endpointStats.entries())
      .map(([endpoint, stats]) => ({
        endpoint,
        averageTime: stats.totalTime / stats.count,
        requestCount: stats.count,
      }))
      .sort((a, b) => b.averageTime - a.averageTime)
      .slice(0, 10)

    // Group errors by type
    const errorsByType: Record<string, number> = {}
    completedMetrics.forEach((m) => {
      if (m.error) {
        errorsByType[m.error] = (errorsByType[m.error] || 0) + 1
      } else if (m.status && m.status >= 400) {
        const errorType = `HTTP_${m.status}`
        errorsByType[errorType] = (errorsByType[errorType] || 0) + 1
      }
    })

    // Calculate requests per minute
    const now = Date.now()
    const oneMinuteAgo = now - 60000
    const recentRequests = completedMetrics.filter((m) => m.startTime && now - m.startTime <= 60000)
    const requestsPerMinute = recentRequests.length

    // Memory trend
    const memoryTrend = completedMetrics
      .filter((m) => m.memoryUsage)
      .slice(-this.MEMORY_SAMPLES)
      .map((m) => ({
        timestamp: m.startTime,
        usage: m.memoryUsage!.percentage,
      }))

    return {
      totalRequests,
      averageResponseTime,
      errorRate,
      cacheHitRate,
      slowestEndpoints,
      errorsByType,
      requestsPerMinute,
      memoryTrend,
    }
  }

  // Get performance summary for logging
  getPerformanceSummary(): string {
    const metrics = this.getAggregatedMetrics()

    return [
      `Performance Summary:`,
      `- Total Requests: ${metrics.totalRequests}`,
      `- Average Response Time: ${metrics.averageResponseTime.toFixed(2)}ms`,
      `- Error Rate: ${metrics.errorRate.toFixed(2)}%`,
      `- Cache Hit Rate: ${metrics.cacheHitRate.toFixed(2)}%`,
      `- Requests/Minute: ${metrics.requestsPerMinute}`,
      `- Slowest Endpoint: ${metrics.slowestEndpoints[0]?.endpoint || "N/A"} (${metrics.slowestEndpoints[0]?.averageTime.toFixed(2) || 0}ms)`,
    ].join("\n")
  }

  // Clear all metrics
  clear(): void {
    this.metrics = []
  }

  // Export metrics for analysis
  exportMetrics(): PerformanceMetrics[] {
    return [...this.metrics]
  }
}

// Create singleton instance
export const performanceMonitor = new PerformanceMonitor()

// Utility function to wrap API calls with performance monitoring
export function withPerformanceMonitoring<T>(endpoint: string, method = "GET") {
  return async (apiCall: () => Promise<T>): Promise<T> => {
    const requestId = performanceMonitor.startRequest(endpoint, method)

    try {
      const result = await apiCall()
      performanceMonitor.endRequest(requestId, 200, undefined, false)
      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      const status = error instanceof Error && "status" in error ? (error as any).status : 500
      performanceMonitor.endRequest(requestId, status, errorMessage, false)
      throw error
    }
  }
}
