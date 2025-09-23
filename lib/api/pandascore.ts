// PandaScore API client for eSports data
const PANDASCORE_BASE_URL = "https://api.pandascore.co"
const API_TOKEN = process.env.PANDASCORE_API_KEY

if (!API_TOKEN) {
  throw new Error("❌ Missing PANDASCORE_API_KEY environment variable")
}

// Type definitions for PandaScore API responses
export interface PandaScoreTeam {
  id: number
  name: string
  slug: string
  acronym: string
  image_url: string
  location: string
  current_videogame: {
    id: number
    name: string
    slug: string
  }
}

export interface PandaScorePlayer {
  id: number
  name: string
  slug: string
  first_name: string
  last_name: string
  image_url: string
  nationality: string
  current_team: {
    id: number
    name: string
    acronym: string
  }
}

export interface PandaScoreMatch {
  id: number
  name: string
  status: "not_started" | "running" | "finished"
  begin_at: string
  end_at: string | null
  videogame: {
    id: number
    name: string
    slug: string
  }
  league: {
    id: number
    name: string
    slug: string
    image_url: string
  }
  serie: {
    id: number
    name: string
    slug: string
  }
  tournament: {
    id: number
    name: string
    slug: string
  }
  opponents: Array<{
    opponent: PandaScoreTeam
    type: "Team"
  }>
  results: Array<{
    score: number
    team_id: number
  }>
}

export interface PandaScoreTournament {
  id: number
  name: string
  slug: string
  begin_at: string
  end_at: string
  league: {
    id: number
    name: string
    image_url: string
  }
  serie: {
    id: number
    name: string
  }
  videogame: {
    id: number
    name: string
    slug: string
  }
  prizepool: string | null
}

const GAME_ENDPOINTS = {
  lol: "lol",
  csgo: "csgo", // Changed from cs2 to csgo to match the actual game
  dota2: "dota2",
  valorant: "valorant",
} as const

const VIDEOGAME_FILTERS = {
  lol: "lol", // League of Legends
  csgo: "counterstrike", // Changed from cs2 to csgo
  dota2: "dota2", // Dota 2
  valorant: "valorant", // Valorant
} as const

const SUPPORTED_GAMES = ["lol", "dota2", "csgo", "valorant"] // Changed cs2 to csgo

// Rate limiting: 1000 requests/hour = ~1 request per 3.6 seconds
class RateLimiter {
  private lastRequestTime = 0
  private readonly minInterval = 3600 // 3.6 seconds in milliseconds

  async waitIfNeeded(): Promise<void> {
    const now = Date.now()
    const timeSinceLastRequest = now - this.lastRequestTime

    if (timeSinceLastRequest < this.minInterval) {
      const waitTime = this.minInterval - timeSinceLastRequest
      await new Promise((resolve) => setTimeout(resolve, waitTime))
    }

    this.lastRequestTime = Date.now()
  }
}

const rateLimiter = new RateLimiter()

// Import necessary modules for error handling
import { PandaScoreError } from "@/lib/api/types"
import { shouldRetry, getRetryDelay } from "@/lib/utils/error-handler"
import { withTimeout } from "@/lib/utils/api-response"

// API client class
class PandaScoreAPI {
  private baseURL = PANDASCORE_BASE_URL
  private token = API_TOKEN
  private readonly DEFAULT_TIMEOUT = 10000 // 10 seconds
  private readonly RETRY_TIMEOUT = 15000 // 15 seconds for retries

  private async request<T>(endpoint: string, params?: Record<string, string>, retryCount = 0): Promise<T> {
    await rateLimiter.waitIfNeeded()

    const url = new URL(`${this.baseURL}${endpoint}`)

    // Add query parameters
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value)
      })
    }

    console.log(`[API] Requesting: ${url.toString()} (attempt ${retryCount + 1})`)

    try {
      const timeoutMs = retryCount > 0 ? this.RETRY_TIMEOUT : this.DEFAULT_TIMEOUT
      const response = await withTimeout(
        fetch(url.toString(), {
          headers: {
            Authorization: `Bearer ${this.token}`,
            Accept: "application/json",
          },
          next: { revalidate: 300 }, // Cache for 5 minutes
        }),
        timeoutMs,
        `Request timeout after ${timeoutMs}ms for ${endpoint}`,
      )

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`[API] Error ${response.status}: ${errorText}`)

        const error = new PandaScoreError(
          `PandaScore API error: ${response.status} ${response.statusText}`,
          response.status,
          response.status.toString(),
        )

        // Handle rate limiting with exponential backoff
        if (response.status === 429) {
          console.warn(`[API] Rate limited for endpoint ${endpoint}. Waiting before retry...`)
          if (retryCount < 3) {
            const delay = getRetryDelay(retryCount)
            await new Promise((resolve) => setTimeout(resolve, delay))
            return this.request<T>(endpoint, params, retryCount + 1)
          }
        }

        // Retry on server errors
        if (shouldRetry(error) && retryCount < 2) {
          const delay = getRetryDelay(retryCount)
          console.log(`[API] Retrying request after ${delay}ms...`)
          await new Promise((resolve) => setTimeout(resolve, delay))
          return this.request<T>(endpoint, params, retryCount + 1)
        }

        throw error
      }

      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text()
        console.error(`[API] Non-JSON response received: ${text}`)
        throw new PandaScoreError(`Expected JSON response but got: ${text}`)
      }

      try {
        return await withTimeout(response.json(), 5000, "JSON parsing timeout")
      } catch (jsonError) {
        const text = await response.text()
        console.error(`[API] Failed to parse JSON response: ${text}`)
        throw new PandaScoreError(`Invalid JSON response: ${text}`)
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes("timeout")) {
        const timeoutError = new PandaScoreError(`Request timeout: ${error.message}`, 408, "TIMEOUT_ERROR")

        if (retryCount < 2) {
          const delay = getRetryDelay(retryCount)
          console.log(`[API] Timeout error, retrying after ${delay}ms...`)
          await new Promise((resolve) => setTimeout(resolve, delay))
          return this.request<T>(endpoint, params, retryCount + 1)
        }

        throw timeoutError
      }

      // Handle network errors
      if (error instanceof TypeError && error.message.includes("fetch")) {
        const networkError = new PandaScoreError(
          "Network error: Unable to connect to PandaScore API",
          0,
          "NETWORK_ERROR",
        )

        if (retryCount < 2) {
          const delay = getRetryDelay(retryCount)
          console.log(`[API] Network error, retrying after ${delay}ms...`)
          await new Promise((resolve) => setTimeout(resolve, delay))
          return this.request<T>(endpoint, params, retryCount + 1)
        }

        throw networkError
      }

      throw error
    }
  }

  async getTeams(videogame: string, page = 1, perPage = 50): Promise<PandaScoreTeam[]> {
    const endpoint = GAME_ENDPOINTS[videogame as keyof typeof GAME_ENDPOINTS]

    if (!endpoint) {
      throw new PandaScoreError(`Unsupported game: ${videogame}`, 400, "UNSUPPORTED_GAME")
    }

    if (!SUPPORTED_GAMES.includes(videogame)) {
      console.warn(`[API] Game ${videogame} is not in supported games list`)
      return []
    }

    const gameEndpoint = `/${endpoint}/teams`
    const params: Record<string, string> = {
      page: page.toString(),
      per_page: Math.min(perPage, 100).toString(), // API max is 100
    }

    try {
      console.log(`[v0] Fetching teams for ${videogame} using endpoint: ${gameEndpoint} with params:`, params)
      return await this.request<PandaScoreTeam[]>(gameEndpoint, params)
    } catch (error) {
      console.error(`[API] Failed to fetch teams for ${videogame}:`, error)
      // Return empty array instead of throwing to prevent cascade failures
      return []
    }
  }

  async getTeamsByIds(videogame: string, teamIds: string[]): Promise<PandaScoreTeam[]> {
    const endpoint = GAME_ENDPOINTS[videogame as keyof typeof GAME_ENDPOINTS]

    if (!endpoint) {
      throw new PandaScoreError(`Unsupported game: ${videogame}`, 400, "UNSUPPORTED_GAME")
    }

    if (!SUPPORTED_GAMES.includes(videogame)) {
      console.warn(`[API] Game ${videogame} is not in supported games list`)
      return []
    }

    const gameEndpoint = `/${endpoint}/teams`
    const params: Record<string, string> = {
      filter: `id:[${teamIds.join(",")}]`, // Filter by specific team IDs
      per_page: Math.min(teamIds.length, 100).toString(), // API max is 100
    }

    try {
      console.log(`[v0] Fetching specific teams for ${videogame} using endpoint: ${gameEndpoint} with params:`, params)
      return await this.request<PandaScoreTeam[]>(gameEndpoint, params)
    } catch (error) {
      console.error(`[API] Failed to fetch specific teams for ${videogame}:`, error)
      return []
    }
  }

  async getUpcomingMatches(videogame: string, page = 1, perPage = 20): Promise<PandaScoreMatch[]> {
    const endpoint = GAME_ENDPOINTS[videogame as keyof typeof GAME_ENDPOINTS]
    if (!endpoint) {
      throw new PandaScoreError(`Unsupported game: ${videogame}`, 400, "UNSUPPORTED_GAME")
    }

    const gameEndpoint = `/${endpoint}/matches/upcoming`
    const params: Record<string, string> = {
      page: page.toString(),
      per_page: Math.min(perPage, 100).toString(), // API max is 100
    }

    try {
      console.log(
        `[v0] Fetching upcoming matches for ${videogame} using endpoint: ${gameEndpoint} with params:`,
        params,
      )
      return await this.request<PandaScoreMatch[]>(gameEndpoint, params)
    } catch (error) {
      console.error(`[API] Failed to fetch upcoming matches for ${videogame}:`, error)
      return []
    }
  }

  async getRunningMatches(videogame: string): Promise<PandaScoreMatch[]> {
    const endpoint = GAME_ENDPOINTS[videogame as keyof typeof GAME_ENDPOINTS]
    if (!endpoint) {
      throw new PandaScoreError(`Unsupported game: ${videogame}`, 400, "UNSUPPORTED_GAME")
    }

    const gameEndpoint = `/${endpoint}/matches/running`
    const params: Record<string, string> = {}

    try {
      console.log(`[v0] Fetching running matches for ${videogame} using endpoint: ${gameEndpoint} with params:`, params)
      return await this.request<PandaScoreMatch[]>(gameEndpoint, params)
    } catch (error) {
      console.error(`[API] Failed to fetch running matches for ${videogame}:`, error)
      return []
    }
  }

  async getTournaments(videogame: string, page = 1, perPage = 50): Promise<PandaScoreTournament[]> {
    const endpoint = GAME_ENDPOINTS[videogame as keyof typeof GAME_ENDPOINTS]
    if (!endpoint) {
      throw new PandaScoreError(`Unsupported game: ${videogame}`, 400, "UNSUPPORTED_GAME")
    }

    const gameEndpoint = `/${endpoint}/tournaments`
    const params: Record<string, string> = {
      page: page.toString(),
      per_page: perPage.toString(),
      sort: "-begin_at",
    }

    try {
      console.log(`[v0] Fetching tournaments for ${videogame} using endpoint: ${gameEndpoint} with params:`, params)
      return await this.request<PandaScoreTournament[]>(gameEndpoint, params)
    } catch (error) {
      console.error(`[API] Failed to fetch tournaments for ${videogame}:`, error)
      return []
    }
  }

  async getMatches(videogame: string, page = 1, perPage = 20): Promise<PandaScoreMatch[]> {
    const endpoint = GAME_ENDPOINTS[videogame as keyof typeof GAME_ENDPOINTS]
    if (!endpoint) {
      throw new PandaScoreError(`Unsupported game: ${videogame}`, 400, "UNSUPPORTED_GAME")
    }

    const gameEndpoint = `/${endpoint}/matches`
    const params: Record<string, string> = {
      page: page.toString(),
      per_page: Math.min(perPage, 100).toString(), // API max is 100
      sort: "-begin_at", // Sort by most recent first
    }

    try {
      console.log(`[v0] Fetching matches for ${videogame} using endpoint: ${gameEndpoint} with params:`, params)
      return await this.request<PandaScoreMatch[]>(gameEndpoint, params)
    } catch (error) {
      console.error(`[API] Failed to fetch matches for ${videogame}:`, error)
      return []
    }
  }

  // Get all supported videogames
  async getVideogames(): Promise<Array<{ id: number; name: string; slug: string }>> {
    return this.request<Array<{ id: number; name: string; slug: string }>>("/videogames")
  }
}

// Export singleton instance
export const pandaScoreAPI = new PandaScoreAPI()

export async function getEsportsData() {
  try {
    const results = {
      teams: {} as any,
      matches: {} as any,
    }

    for (const game of SUPPORTED_GAMES) {
      try {
        console.log(`[API] Fetching data for ${game}`)
        const [teams, matches] = await Promise.all([
          pandaScoreAPI.getTeams(game, 1, 10),
          pandaScoreAPI.getUpcomingMatches(game, 1, 5),
        ])

        results.teams[game] = teams
        results.matches[game] = matches
        console.log(`[API] Successfully fetched ${teams.length} teams and ${matches.length} matches for ${game}`)
      } catch (error) {
        console.error(`[API] Error fetching data for ${game}:`, error)
        results.teams[game] = []
        results.matches[game] = []
      }
    }

    return results
  } catch (error) {
    console.error("Error fetching eSports data:", error)
    throw error
  }
}

export async function getLiveMatches() {
  try {
    const [lolLive, dota2Live, csgoLive] = await Promise.all([
      pandaScoreAPI.getRunningMatches("lol"),
      pandaScoreAPI.getRunningMatches("dota2"),
      pandaScoreAPI.getRunningMatches("csgo"), // Changed from cs2 to csgo
    ])

    return [...lolLive, ...dota2Live, ...csgoLive] // Updated variable name
  } catch (error) {
    console.error("Error fetching live matches:", error)
    return []
  }
}
