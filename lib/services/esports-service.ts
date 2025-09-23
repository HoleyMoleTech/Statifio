import { apiClient } from "./api-client"
import { withCache } from "@/lib/api/cache"
import type { GameStats, TeamRanking, MatchResult, PlayerStats } from "@/lib/api/types"

// Transform API data to our component format using our internal API routes
export class EsportsService {
  // Get game overview statistics
  async getEsportsOverview() {
    return withCache(
      "esports-overview",
      async () => {
        try {
          return await apiClient.getEsportsOverview()
        } catch (error) {
          console.error("Error fetching esports overview:", error)
          return {
            games: [],
            liveMatches: [],
            totalLiveMatches: 0,
          }
        }
      },
      5,
    ) // Cache for 5 minutes
  }

  // Get top teams with rankings
  async getTopTeams(videogame: string, limit = 10): Promise<TeamRanking[]> {
    return withCache(
      `top-teams-${videogame}`,
      async () => {
        try {
          return await apiClient.getTopTeams(videogame, limit)
        } catch (error) {
          console.error(`Error fetching top teams for ${videogame}:`, error)
          return []
        }
      },
      15,
    ) // Cache for 15 minutes
  }

  // Get recent matches
  async getRecentMatches(videogame: string, limit = 10): Promise<MatchResult[]> {
    return withCache(
      `recent-matches-${videogame}`,
      async () => {
        try {
          return await apiClient.getRecentMatches(videogame, limit)
        } catch (error) {
          console.error(`Error fetching recent matches for ${videogame}:`, error)
          return []
        }
      },
      5,
    ) // Cache for 5 minutes
  }

  // Get live matches across all games
  async getLiveMatches(): Promise<MatchResult[]> {
    return withCache(
      "live-matches-all",
      async () => {
        try {
          return await apiClient.getLiveMatches()
        } catch (error) {
          console.error("Error fetching live matches:", error)
          return []
        }
      },
      2,
    ) // Cache for 2 minutes (live data should be fresh)
  }

  // Mock implementation for game stats (derived from overview data)
  async getGameStats(videogame: string): Promise<GameStats> {
    return withCache(
      `game-stats-${videogame}`,
      async () => {
        try {
          const overview = await this.getEsportsOverview()
          const game = overview.games?.find((g: any) => g.id === videogame)

          if (game) {
            return {
              totalTeams: Math.floor(game.stats.totalPlayers / 5),
              totalPlayers: game.stats.totalPlayers,
              activeMatches: game.stats.activeMatches,
              upcomingMatches: game.stats.tournaments * 5, // Estimate
            }
          }

          return {
            totalTeams: 0,
            totalPlayers: 0,
            activeMatches: 0,
            upcomingMatches: 0,
          }
        } catch (error) {
          console.error(`Error fetching ${videogame} stats:`, error)
          return {
            totalTeams: 0,
            totalPlayers: 0,
            activeMatches: 0,
            upcomingMatches: 0,
          }
        }
      },
      10,
    ) // Cache for 10 minutes
  }

  // Mock implementation for top players
  async getTopPlayers(videogame: string, limit = 10): Promise<PlayerStats[]> {
    return withCache(
      `top-players-${videogame}`,
      async () => {
        // Return empty array for now - would need additional API endpoints
        return []
      },
      20,
    ) // Cache for 20 minutes
  }
}

// Export singleton instance
export const esportsService = new EsportsService()
