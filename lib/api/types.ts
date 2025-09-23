// Shared types for API responses and data structures

export interface ApiResponse<T> {
  data: T
  error?: string
  loading?: boolean
}

export interface GameStats {
  totalTeams: number
  totalPlayers: number
  activeMatches: number
  upcomingMatches: number
}

export interface TeamRanking {
  rank: number
  team: {
    id: number
    name: string
    acronym: string
    image_url: string
    location: string
  }
  wins: number
  losses: number
  winRate: number
  recentForm: ("W" | "L")[]
}

export interface MatchResult {
  id: number
  date: string
  status: "finished" | "running" | "upcoming"
  teams: {
    team1: {
      name: string
      acronym: string
      image_url: string
      score?: number
    }
    team2: {
      name: string
      acronym: string
      image_url: string
      score?: number
    }
  }
  tournament: {
    name: string
    league: string
  }
  videogame: string
}

export interface PlayerStats {
  id: number
  name: string
  image_url: string
  team: {
    name: string
    acronym: string
  }
  nationality: string
  stats?: {
    kills?: number
    deaths?: number
    assists?: number
    kda?: number
  }
}

// Error handling types
export interface ApiError {
  message: string
  status?: number
  code?: string
}

export class PandaScoreError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string,
  ) {
    super(message)
    this.name = "PandaScoreError"
  }
}

export interface StandardApiResponse<T = any> {
  success: boolean
  data?: T
  error?: {
    message: string
    code?: string
    status?: number
    details?: any
  }
  metadata?: {
    timestamp: string
    requestId?: string
    cached?: boolean
    source?: string
    apiCallsUsed?: number
    rateLimit?: {
      remaining: number
      resetTime: string
    }
  }
}

export interface ValidationError {
  field: string
  message: string
  value?: any
}

export interface RequestValidationResult {
  isValid: boolean
  errors: ValidationError[]
}
