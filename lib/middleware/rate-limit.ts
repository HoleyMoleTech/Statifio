import { type NextRequest, NextResponse } from "next/server"

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

const store: RateLimitStore = {}

// Clean up old entries every 5 minutes
setInterval(
  () => {
    const now = Date.now()
    Object.keys(store).forEach((key) => {
      if (store[key].resetTime < now) {
        delete store[key]
      }
    })
  },
  5 * 60 * 1000,
)

export interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum requests per window
}

export function rateLimit(config: RateLimitConfig) {
  return async (request: NextRequest): Promise<NextResponse | null> => {
    // Get client identifier (IP address or user ID)
    const identifier = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "anonymous"

    const key = `${identifier}:${request.nextUrl.pathname}`
    const now = Date.now()

    // Initialize or get existing rate limit data
    if (!store[key] || store[key].resetTime < now) {
      store[key] = {
        count: 1,
        resetTime: now + config.windowMs,
      }
      return null // Allow request
    }

    // Increment request count
    store[key].count++

    // Check if limit exceeded
    if (store[key].count > config.maxRequests) {
      const resetIn = Math.ceil((store[key].resetTime - now) / 1000)
      return NextResponse.json(
        {
          error: {
            message: "Too many requests. Please try again later.",
            code: "RATE_LIMIT_EXCEEDED",
            retryAfter: resetIn,
          },
        },
        {
          status: 429,
          headers: {
            "Retry-After": resetIn.toString(),
            "X-RateLimit-Limit": config.maxRequests.toString(),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": store[key].resetTime.toString(),
          },
        },
      )
    }

    return null // Allow request
  }
}

// Preset configurations
export const rateLimitPresets = {
  strict: { windowMs: 60 * 1000, maxRequests: 10 }, // 10 requests per minute
  moderate: { windowMs: 60 * 1000, maxRequests: 30 }, // 30 requests per minute
  lenient: { windowMs: 60 * 1000, maxRequests: 100 }, // 100 requests per minute
}
