import { pandaScoreAPI, type PandaScoreMatch, type PandaScoreTeam } from "./pandascore"
import { analyticsService } from "@/lib/supabase/analytics"
import { createClient } from "@/lib/supabase/server"

export interface EnhancedMatchData extends PandaScoreMatch {
  cached_at?: string
  analytics_data?: {
    predicted_winner?: string
    confidence_score?: number
    historical_performance?: any
  }
}

export interface EnhancedTeamData extends PandaScoreTeam {
  performance_stats?: {
    total_matches: number
    wins: number
    losses: number
    win_rate: number
    avg_score: number
  }
  ranking_data?: {
    global_rank?: number
    regional_rank?: number
    rating?: number
  }
}

export class EnhancedPandaScoreService {
  private readonly CACHE_DURATION = {
    LIVE_MATCHES: 2, // 2 minutes for live data
    TEAMS: 60, // 1 hour for team data
    RANKINGS: 30, // 30 minutes for rankings
    STATISTICS: 15, // 15 minutes for statistics
  }

  async getEnhancedLiveMatches(gameType?: string): Promise<EnhancedMatchData[]> {
    const cacheKey = `live_matches_${gameType || "all"}`

    // Try to get cached data first
    const cachedData = await analyticsService.getCachedAnalyticsData(cacheKey)
    if (cachedData) {
      console.log("[v0] Using cached live matches data")
      return cachedData
    }

    try {
      let matches: PandaScoreMatch[] = []

      if (gameType) {
        matches = await pandaScoreAPI.getRunningMatches(gameType)
      } else {
        // Get live matches for all supported games
        const [lolMatches, dota2Matches, csgoMatches, valorantMatches] = await Promise.allSettled([
          pandaScoreAPI.getRunningMatches("lol"),
          pandaScoreAPI.getRunningMatches("dota2"),
          pandaScoreAPI.getRunningMatches("csgo"),
          pandaScoreAPI.getRunningMatches("valorant"),
        ])

        matches = [
          ...(lolMatches.status === "fulfilled" ? lolMatches.value : []),
          ...(dota2Matches.status === "fulfilled" ? dota2Matches.value : []),
          ...(csgoMatches.status === "fulfilled" ? csgoMatches.value : []),
          ...(valorantMatches.status === "fulfilled" ? valorantMatches.value : []),
        ]
      }

      // Enhance matches with analytics data
      const enhancedMatches: EnhancedMatchData[] = await Promise.all(
        matches.map(async (match) => {
          const enhanced: EnhancedMatchData = {
            ...match,
            cached_at: new Date().toISOString(),
            analytics_data: await this.getMatchAnalytics(match),
          }
          return enhanced
        }),
      )

      // Cache the enhanced data
      await analyticsService.cacheAnalyticsData(
        cacheKey,
        enhancedMatches,
        this.CACHE_DURATION.LIVE_MATCHES,
        "esports",
        gameType,
      )

      return enhancedMatches
    } catch (error) {
      console.error("Error fetching enhanced live matches:", error)
      return []
    }
  }

  async getEnhancedTeams(gameType: string, page = 1): Promise<EnhancedTeamData[]> {
    const cacheKey = `teams_${gameType}_page_${page}`

    // Try to get cached data first
    const cachedData = await analyticsService.getCachedAnalyticsData(cacheKey)
    if (cachedData) {
      console.log("[v0] Using cached teams data")
      return cachedData
    }

    try {
      const teams = await pandaScoreAPI.getTeams(gameType, page, 20)

      // Enhance teams with performance stats and rankings
      const enhancedTeams: EnhancedTeamData[] = await Promise.all(
        teams.map(async (team) => {
          const [performanceStats, rankingData] = await Promise.allSettled([
            this.getTeamPerformanceStats(team.id.toString(), gameType),
            this.getTeamRankingData(team.id.toString(), gameType),
          ])

          const enhanced: EnhancedTeamData = {
            ...team,
            performance_stats: performanceStats.status === "fulfilled" ? performanceStats.value : undefined,
            ranking_data: rankingData.status === "fulfilled" ? rankingData.value : undefined,
          }
          return enhanced
        }),
      )

      // Cache the enhanced data
      await analyticsService.cacheAnalyticsData(cacheKey, enhancedTeams, this.CACHE_DURATION.TEAMS, "esports", gameType)

      return enhancedTeams
    } catch (error) {
      console.error("Error fetching enhanced teams:", error)
      return []
    }
  }

  private async getMatchAnalytics(match: PandaScoreMatch): Promise<any> {
    try {
      // Get historical performance data for both teams
      const teamIds = match.opponents.map((opponent) => opponent.opponent.id.toString())

      const performanceData = await Promise.all(
        teamIds.map((teamId) => this.getTeamPerformanceStats(teamId, match.videogame.slug)),
      )

      return {
        historical_performance: performanceData,
        match_importance: this.calculateMatchImportance(match),
        estimated_duration: this.estimateMatchDuration(match.videogame.slug),
      }
    } catch (error) {
      console.error("Error getting match analytics:", error)
      return {}
    }
  }

  private async getTeamPerformanceStats(teamId: string, gameType: string) {
    try {
      return await analyticsService.getTeamPerformanceStats(teamId, gameType, 30)
    } catch (error) {
      console.error("Error getting team performance stats:", error)
      return null
    }
  }

  private async getTeamRankingData(teamId: string, gameType: string) {
    try {
      const supabase = await createClient()

      const { data, error } = await supabase
        .from("team_rankings")
        .select("rank_position, rating, ranking_type")
        .eq("team_id", teamId)
        .eq("game_type", gameType)
        .order("rank_position", { ascending: true })

      if (error || !data) {
        return null
      }

      const globalRank = data.find((r) => r.ranking_type === "global")
      const regionalRank = data.find((r) => r.ranking_type === "regional")

      return {
        global_rank: globalRank?.rank_position,
        regional_rank: regionalRank?.rank_position,
        rating: globalRank?.rating || regionalRank?.rating,
      }
    } catch (error) {
      console.error("Error getting team ranking data:", error)
      return null
    }
  }

  private calculateMatchImportance(match: PandaScoreMatch): "low" | "medium" | "high" {
    // Calculate importance based on tournament, league, and teams
    let score = 0

    // Tournament importance
    if (
      match.tournament.name.toLowerCase().includes("world") ||
      match.tournament.name.toLowerCase().includes("championship")
    ) {
      score += 3
    } else if (match.tournament.name.toLowerCase().includes("major")) {
      score += 2
    } else {
      score += 1
    }

    // League importance
    if (match.league.name.toLowerCase().includes("premier") || match.league.name.toLowerCase().includes("pro")) {
      score += 2
    } else {
      score += 1
    }

    if (score >= 5) return "high"
    if (score >= 3) return "medium"
    return "low"
  }

  private estimateMatchDuration(gameType: string): number {
    // Estimated duration in minutes based on game type
    const durations = {
      lol: 35,
      dota2: 45,
      csgo: 60,
      valorant: 40,
    }

    return durations[gameType as keyof typeof durations] || 40
  }

  async syncMatchesToDatabase(gameType: string): Promise<number> {
    try {
      const supabase = await createClient()
      const matches = await pandaScoreAPI.getMatches(gameType, 1, 50)

      let syncedCount = 0

      for (const match of matches) {
        const { error } = await supabase.from("matches").upsert(
          {
            external_id: match.id.toString(),
            sport_type: "esports",
            game_type: match.videogame.slug,
            tournament_name: match.tournament.name,
            status: match.status,
            match_date: match.begin_at,
            home_team_id: match.opponents[0]?.opponent.id.toString(),
            away_team_id: match.opponents[1]?.opponent.id.toString(),
            home_score: match.results[0]?.score || 0,
            away_score: match.results[1]?.score || 0,
            match_details: {
              league: match.league,
              serie: match.serie,
              tournament: match.tournament,
            },
          },
          {
            onConflict: "external_id",
          },
        )

        if (!error) {
          syncedCount++
        }
      }

      console.log(`[v0] Synced ${syncedCount} matches for ${gameType}`)
      return syncedCount
    } catch (error) {
      console.error("Error syncing matches to database:", error)
      return 0
    }
  }
}

export const enhancedPandaScoreService = new EnhancedPandaScoreService()
