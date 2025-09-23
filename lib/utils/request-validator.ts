import type { NextRequest } from "next/server"
import type { RequestValidationResult, ValidationError } from "@/lib/api/types"

export class RequestValidator {
  private errors: ValidationError[] = []

  static create(): RequestValidator {
    return new RequestValidator()
  }

  validateGameParam(game: string | null): this {
    const validGames = ["lol", "csgo", "dota2", "valorant"]

    if (!game) {
      this.errors.push({
        field: "game",
        message: "Game parameter is required",
      })
    } else if (!validGames.includes(game)) {
      this.errors.push({
        field: "game",
        message: `Invalid game. Must be one of: ${validGames.join(", ")}`,
        value: game,
      })
    }

    return this
  }

  validatePagination(page?: string, limit?: string): this {
    if (page) {
      const pageNum = Number.parseInt(page, 10)
      if (isNaN(pageNum) || pageNum < 1) {
        this.errors.push({
          field: "page",
          message: "Page must be a positive integer",
          value: page,
        })
      } else if (pageNum > 100) {
        this.errors.push({
          field: "page",
          message: "Page cannot exceed 100",
          value: page,
        })
      }
    }

    if (limit) {
      const limitNum = Number.parseInt(limit, 10)
      if (isNaN(limitNum) || limitNum < 1) {
        this.errors.push({
          field: "limit",
          message: "Limit must be a positive integer",
          value: limit,
        })
      } else if (limitNum > 50) {
        this.errors.push({
          field: "limit",
          message: "Limit cannot exceed 50",
          value: limit,
        })
      }
    }

    return this
  }

  validateDateRange(startDate?: string, endDate?: string): this {
    if (startDate) {
      const start = new Date(startDate)
      if (isNaN(start.getTime())) {
        this.errors.push({
          field: "startDate",
          message: "Invalid start date format. Use ISO 8601 format",
          value: startDate,
        })
      }
    }

    if (endDate) {
      const end = new Date(endDate)
      if (isNaN(end.getTime())) {
        this.errors.push({
          field: "endDate",
          message: "Invalid end date format. Use ISO 8601 format",
          value: endDate,
        })
      }
    }

    if (startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      if (start > end) {
        this.errors.push({
          field: "dateRange",
          message: "Start date cannot be after end date",
        })
      }
    }

    return this
  }

  getResult(): RequestValidationResult {
    return {
      isValid: this.errors.length === 0,
      errors: this.errors,
    }
  }
}

export function parseSearchParams(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  return {
    page: searchParams.get("page") || "1",
    limit: searchParams.get("limit") || "10",
    game: searchParams.get("game"),
    startDate: searchParams.get("startDate"),
    endDate: searchParams.get("endDate"),
    status: searchParams.get("status"),
    search: searchParams.get("search"),
  }
}
