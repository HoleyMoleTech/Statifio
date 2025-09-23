import { NextResponse } from "next/server"
import type { StandardApiResponse } from "@/lib/api/types"

export class ApiResponseBuilder {
  private static generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  static success<T>(
    data: T,
    metadata?: Partial<StandardApiResponse<T>["metadata"]>,
  ): NextResponse<StandardApiResponse<T>> {
    const response: StandardApiResponse<T> = {
      success: true,
      data,
      metadata: {
        timestamp: new Date().toISOString(),
        requestId: this.generateRequestId(),
        cached: false,
        ...metadata,
      },
    }

    const headers = new Headers()

    // Add rate limit headers if available
    if (metadata?.rateLimit) {
      headers.set("X-RateLimit-Remaining", metadata.rateLimit.remaining.toString())
      headers.set("X-RateLimit-Reset", metadata.rateLimit.resetTime)
    }

    // Add performance headers
    headers.set("X-Response-Time", `${Date.now()}ms`)
    headers.set("X-Request-ID", response.metadata!.requestId!)

    return NextResponse.json(response, { headers })
  }

  static error(message: string, status = 500, code?: string, details?: any): NextResponse<StandardApiResponse> {
    const response: StandardApiResponse = {
      success: false,
      error: {
        message,
        status,
        code,
        details,
      },
      metadata: {
        timestamp: new Date().toISOString(),
        requestId: this.generateRequestId(),
      },
    }

    const headers = new Headers()
    headers.set("X-Request-ID", response.metadata!.requestId!)

    return NextResponse.json(response, { status, headers })
  }

  static validationError(
    errors: Array<{ field: string; message: string; value?: any }>,
    message = "Validation failed",
  ): NextResponse<StandardApiResponse> {
    return this.error(message, 400, "VALIDATION_ERROR", { validationErrors: errors })
  }
}

export function withTimeout<T>(promise: Promise<T>, timeoutMs = 10000, errorMessage = "Request timeout"): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => setTimeout(() => reject(new Error(errorMessage)), timeoutMs)),
  ])
}
