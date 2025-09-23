import { PandaScoreError } from "@/lib/api/types"

export function handleApiError(error: unknown): string {
  if (error instanceof PandaScoreError) {
    switch (error.status) {
      case 401:
        return "Authentication failed. Please check your API credentials."
      case 403:
        return "Access denied. You don't have permission to access this data."
      case 404:
        return "The requested data was not found."
      case 429:
        return "Too many requests. Please wait a moment and try again."
      case 500:
        return "Server error. Please try again later."
      default:
        return error.message || "An unexpected error occurred."
    }
  }

  if (error instanceof Error) {
    if (error.message.includes("fetch")) {
      return "Network error. Please check your internet connection."
    }
    return error.message
  }

  return "An unexpected error occurred. Please try again."
}

export function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.message.includes("fetch") || error.message.includes("network") || error.message.includes("NetworkError")
    )
  }
  return false
}

export function shouldRetry(error: unknown): boolean {
  if (error instanceof PandaScoreError) {
    // Retry on server errors and rate limits, but not on client errors
    return error.status ? error.status >= 500 || error.status === 429 : true
  }

  // Retry on network errors
  return isNetworkError(error)
}

export function getRetryDelay(attempt: number): number {
  // Exponential backoff: 1s, 2s, 4s, 8s, max 30s
  return Math.min(1000 * Math.pow(2, attempt), 30000)
}
