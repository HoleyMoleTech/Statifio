import { AppError } from "./error-handler"

export interface ValidationRule {
  field: string
  type: "string" | "number" | "email" | "url" | "uuid" | "date"
  required?: boolean
  min?: number
  max?: number
  pattern?: RegExp
  custom?: (value: any) => boolean
}

export function validateInput(data: Record<string, any>, rules: ValidationRule[]): void {
  const errors: string[] = []

  for (const rule of rules) {
    const value = data[rule.field]

    // Check required
    if (rule.required && (value === undefined || value === null || value === "")) {
      errors.push(`${rule.field} is required`)
      continue
    }

    // Skip validation if not required and value is empty
    if (!rule.required && (value === undefined || value === null || value === "")) {
      continue
    }

    // Type validation
    switch (rule.type) {
      case "string":
        if (typeof value !== "string") {
          errors.push(`${rule.field} must be a string`)
        } else {
          if (rule.min && value.length < rule.min) {
            errors.push(`${rule.field} must be at least ${rule.min} characters`)
          }
          if (rule.max && value.length > rule.max) {
            errors.push(`${rule.field} must be at most ${rule.max} characters`)
          }
        }
        break

      case "number":
        if (typeof value !== "number" || isNaN(value)) {
          errors.push(`${rule.field} must be a number`)
        } else {
          if (rule.min !== undefined && value < rule.min) {
            errors.push(`${rule.field} must be at least ${rule.min}`)
          }
          if (rule.max !== undefined && value > rule.max) {
            errors.push(`${rule.field} must be at most ${rule.max}`)
          }
        }
        break

      case "email":
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(value)) {
          errors.push(`${rule.field} must be a valid email address`)
        }
        break

      case "url":
        try {
          new URL(value)
        } catch {
          errors.push(`${rule.field} must be a valid URL`)
        }
        break

      case "uuid":
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
        if (!uuidRegex.test(value)) {
          errors.push(`${rule.field} must be a valid UUID`)
        }
        break

      case "date":
        const date = new Date(value)
        if (isNaN(date.getTime())) {
          errors.push(`${rule.field} must be a valid date`)
        }
        break
    }

    // Pattern validation
    if (rule.pattern && typeof value === "string" && !rule.pattern.test(value)) {
      errors.push(`${rule.field} has invalid format`)
    }

    // Custom validation
    if (rule.custom && !rule.custom(value)) {
      errors.push(`${rule.field} failed custom validation`)
    }
  }

  if (errors.length > 0) {
    throw new AppError(`Validation failed: ${errors.join(", ")}`, 400, "VALIDATION_ERROR", { errors })
  }
}

// Common validation patterns
export const validationPatterns = {
  alphanumeric: /^[a-zA-Z0-9]+$/,
  alphanumericWithSpaces: /^[a-zA-Z0-9\s]+$/,
  slug: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  hexColor: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
}
