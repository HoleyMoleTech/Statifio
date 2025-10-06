import { NextResponse } from "next/server"

export interface ApiError {
  message: string
  code?: string
  statusCode: number
  details?: any
}

export class AppError extends Error {
  statusCode: number
  code?: string
  details?: any

  constructor(message: string, statusCode = 500, code?: string, details?: any) {
    super(message)
    this.statusCode = statusCode
    this.code = code
    this.details = details
    this.name = "AppError"
  }
}

export function handleApiError(error: unknown): NextResponse {
  console.error("[API Error]", error)

  // Handle known AppError instances
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        error: {
          message: error.message,
          code: error.code,
          details: process.env.NODE_ENV === "development" ? error.details : undefined,
        },
      },
      { status: error.statusCode },
    )
  }

  // Handle Supabase errors
  if (error && typeof error === "object" && "code" in error) {
    const supabaseError = error as any
    return NextResponse.json(
      {
        error: {
          message: "Database operation failed",
          code: supabaseError.code,
          details: process.env.NODE_ENV === "development" ? supabaseError.message : undefined,
        },
      },
      { status: 500 },
    )
  }

  // Handle generic errors
  if (error instanceof Error) {
    return NextResponse.json(
      {
        error: {
          message: "An unexpected error occurred",
          details: process.env.NODE_ENV === "development" ? error.message : undefined,
        },
      },
      { status: 500 },
    )
  }

  // Fallback for unknown errors
  return NextResponse.json(
    {
      error: {
        message: "An unexpected error occurred",
      },
    },
    { status: 500 },
  )
}

export function validateRequired(data: Record<string, any>, fields: string[]): void {
  const missing = fields.filter((field) => !data[field])
  if (missing.length > 0) {
    throw new AppError(`Missing required fields: ${missing.join(", ")}`, 400, "VALIDATION_ERROR")
  }
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}
