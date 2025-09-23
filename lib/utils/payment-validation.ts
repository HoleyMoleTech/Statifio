// Payment validation utilities
export interface PaymentValidationResult {
  isValid: boolean
  errors: string[]
}

export function validatePaymentAmount(amount: number, currency = "EUR"): PaymentValidationResult {
  const errors: string[] = []

  // Check if amount is a valid number
  if (typeof amount !== "number" || isNaN(amount)) {
    errors.push("Amount must be a valid number")
  }

  // Check minimum amount (typically 1 cent/euro cent)
  if (amount < 0.01) {
    errors.push("Amount must be at least 0.01")
  }

  // Check maximum amount (reasonable limit)
  if (amount > 999999.99) {
    errors.push("Amount exceeds maximum limit")
  }

  // Check decimal places (max 2 for most currencies)
  if (amount * 100 !== Math.floor(amount * 100)) {
    errors.push("Amount can have at most 2 decimal places")
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

export function validateCurrency(currency: string): PaymentValidationResult {
  const errors: string[] = []
  const supportedCurrencies = ["EUR", "USD", "GBP", "SEK", "NOK", "DKK"]

  if (!currency || typeof currency !== "string") {
    errors.push("Currency is required")
  } else if (!supportedCurrencies.includes(currency.toUpperCase())) {
    errors.push(`Currency ${currency} is not supported. Supported currencies: ${supportedCurrencies.join(", ")}`)
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

export function validatePaymentRequest(request: {
  amount: number
  currency: string
  planId: string
  userId: string
}): PaymentValidationResult {
  const errors: string[] = []

  // Validate amount
  const amountValidation = validatePaymentAmount(request.amount, request.currency)
  if (!amountValidation.isValid) {
    errors.push(...amountValidation.errors)
  }

  // Validate currency
  const currencyValidation = validateCurrency(request.currency)
  if (!currencyValidation.isValid) {
    errors.push(...currencyValidation.errors)
  }

  // Validate plan ID
  if (!request.planId || typeof request.planId !== "string" || request.planId.trim().length === 0) {
    errors.push("Plan ID is required")
  }

  // Validate user ID
  if (!request.userId || typeof request.userId !== "string" || request.userId.trim().length === 0) {
    errors.push("User ID is required")
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

export function sanitizePaymentData(data: any): any {
  // Remove sensitive fields that shouldn't be logged or stored
  const sensitiveFields = ["cardNumber", "cvv", "expiryDate", "apiKey", "secretKey"]

  if (typeof data !== "object" || data === null) {
    return data
  }

  const sanitized = { ...data }

  for (const field of sensitiveFields) {
    if (sanitized[field]) {
      sanitized[field] = "[REDACTED]"
    }
  }

  return sanitized
}
