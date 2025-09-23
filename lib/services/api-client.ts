// Client-side API service that calls our Next.js API routes instead of external APIs directly

class ApiClient {
  private baseUrl = "/api/esports"

  private async request<T>(endpoint: string): Promise<T> {
    console.log(`[v0] API Client making request to: ${this.baseUrl}${endpoint}`)
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      next: { revalidate: 300 }, // Cache for 5 minutes
    })

    if (!response.ok) {
      console.error(`[v0] API Client error: ${response.status} ${response.statusText}`)
      throw new Error(`API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    console.log(`[v0] API Client received data from ${endpoint}:`, data)
    return data
  }

  async getEsportsOverview() {
    return this.request("/overview")
  }

  async getTopTeams(game: string, limit = 10) {
    const response = await this.request<{ teams: any[]; pagination: any }>(`/teams/${game}?limit=${limit}`)
    return response.teams || []
  }

  async getRecentMatches(game: string, limit = 10) {
    return this.request(`/matches/${game}?limit=${limit}`)
  }

  async getLiveMatches() {
    console.log("[v0] API Client calling getLiveMatches")
    const result = await this.request("/live-matches")
    console.log("[v0] API Client getLiveMatches result:", result)
    return result
  }
}

export const apiClient = new ApiClient()
