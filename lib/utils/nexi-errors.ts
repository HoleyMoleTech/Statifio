// Nexi-specific error handling utilities
export interface NexiError {
  code: string
  message: string
  details?: any
}

export class NexiPaymentError extends Error {
  public code: string
  public details?: any

  constructor(code: string, message: string, details?: any) {
    super(message)
    this.name = "NexiPaymentError"
    this.code = code
    this.details = details
  }
}

// Common Nexi error codes and user-friendly messages
export const NEXI_ERROR_MESSAGES: Record<string, string> = {
  // Authentication errors
  AUTHENTICATION_FAILED: "Payment service authentication failed. Please try again.",
  INVALID_API_KEY: "Payment configuration error. Please contact support.",

  // Payment errors
  PAYMENT_DECLINED: "Your payment was declined. Please check your payment details and try again.",
  INSUFFICIENT_FUNDS: "Insufficient funds. Please check your account balance or try a different payment method.",
  CARD_EXPIRED: "Your card has expired. Please use a different payment method.",
  INVALID_CARD: "Invalid card details. Please check your information and try again.",
  CARD_NOT_SUPPORTED: "This card type is not supported. Please try a different payment method.",

  // Network/API errors
  NETWORK_ERROR: "Network connection error. Please check your internet connection and try again.",
  API_TIMEOUT: "Payment request timed out. Please try again.",
  SERVICE_UNAVAILABLE: "Payment service is temporarily unavailable. Please try again later.",

  // Validation errors
  INVALID_AMOUNT: "Invalid payment amount. Please check the amount and try again.",
  INVALID_CURRENCY: "Invalid currency specified.",
  MISSING_REQUIRED_FIELD: "Required payment information is missing.",

  // General errors
  UNKNOWN_ERROR: "An unexpected error occurred. Please try again or contact support.",
  PAYMENT_ALREADY_PROCESSED: "This payment has already been processed.",
  PAYMENT_CANCELLED: "Payment was cancelled by the user.",
}

export function parseNexiError(error: any): NexiPaymentError {
  // Handle different error formats from Nexi API
  if (error.response?.data) {
    const errorData = error.response.data

    // Handle structured error response
    if (errorData.errors && Array.isArray(errorData.errors)) {
      const firstError = errorData.errors[0]
      return new NexiPaymentError(
        firstError.code || "UNKNOWN_ERROR",
        NEXI_ERROR_MESSAGES[firstError.code] || firstError.message || "An error occurred",
        errorData,
      )
    }

    // Handle simple error response
    if (errorData.error) {
      return new NexiPaymentError(
        errorData.error.code || "UNKNOWN_ERROR",
        NEXI_ERROR_MESSAGES[errorData.error.code] || errorData.error.message || "An error occurred",
        errorData,
      )
    }
  }

  // Handle network errors
  if (error.code === "ECONNREFUSED" || error.code === "ENOTFOUND") {
    return new NexiPaymentError("NETWORK_ERROR", NEXI_ERROR_MESSAGES.NETWORK_ERROR)
  }

  if (error.code === "ETIMEDOUT") {
    return new NexiPaymentError("API_TIMEOUT", NEXI_ERROR_MESSAGES.API_TIMEOUT)
  }

  // Handle HTTP status codes
  if (error.response?.status) {
    switch (error.response.status) {
      case 401:
        return new NexiPaymentError("AUTHENTICATION_FAILED", NEXI_ERROR_MESSAGES.AUTHENTICATION_FAILED)
      case 403:
        return new NexiPaymentError("INVALID_API_KEY", NEXI_ERROR_MESSAGES.INVALID_API_KEY)
      case 422:
        return new NexiPaymentError("MISSING_REQUIRED_FIELD", NEXI_ERROR_MESSAGES.MISSING_REQUIRED_FIELD)
      case 503:
        return new NexiPaymentError("SERVICE_UNAVAILABLE", NEXI_ERROR_MESSAGES.SERVICE_UNAVAILABLE)
      default:
        return new NexiPaymentError("UNKNOWN_ERROR", NEXI_ERROR_MESSAGES.UNKNOWN_ERROR)
    }
  }

  // Fallback for unknown errors
  return new NexiPaymentError("UNKNOWN_ERROR", error.message || NEXI_ERROR_MESSAGES.UNKNOWN_ERROR, error)
}

export function isRetryableError(error: NexiPaymentError): boolean {
  const retryableCodes = ["NETWORK_ERROR", "API_TIMEOUT", "SERVICE_UNAVAILABLE"]

  return retryableCodes.includes(error.code)
}
