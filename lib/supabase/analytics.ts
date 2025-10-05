import { createClient } from "@/lib/supabase/server"
import { queryCache } from "@/lib/cache/query-cache"

export interface TeamPerformanceStats {
  total_matches: number
  wins: number
  losses: number
  win_rate: number
  avg_score: number
}

export interface LiveMatchesCount {
  game_type: string
  live_count: number
}

export interface PlayerRanking {
  id: string
  player_id: string
  sport_type: string
  game_type: string
  ranking_type: string
  rank_position: number
  rating: number
  points: number
  wins: number
  losses: number
  win_rate: number
  season: string
  region: string
  player: {
    name: string
    nickname: string
    avatar_url: string
    nationality: string
  }
}

export interface TeamRanking {
  id: string
  team_id: string
  sport_type: string
  game_type: string
  ranking_type: string
  rank_position: number
  rating: number
  points: number
  wins: number
  losses: number
  win_rate: number
  season: string
  region: string
  team: {
    name: string
    logo_url: string
    country: string
    region: string
  }
}

export interface MatchStatistics {
  id: string
  match_id: string
  team_id: string
  player_id: string
  kills: number
  deaths: number
  assists: number
  damage_dealt: number
  damage_taken: number
  gold_earned: number
  cs_score: number
  headshots: number
  accuracy: number
  game_duration: number
  additional_stats: Record<string, any>
}

export class SupabaseAnalyticsService {
  private clientPromise: Promise<ReturnType<typeof createClient>> | null = null

  private async getClient() {
    if (!this.clientPromise) {
      this.clientPromise = createClient()
    }
    return await this.clientPromise
  }

  async getTeamPerformanceStats(
    teamId: string,
    gameType?: string,
    daysBack = 30,
  ): Promise<TeamPerformanceStats | null> {
    try {
      const cacheKey = `team-perf:${teamId}:${gameType}:${daysBack}`
      const cached = queryCache.get<TeamPerformanceStats>(cacheKey)
      if (cached) {
        return cached
      }

      const supabase = await this.getClient()

      const { data, error } = await supabase
        .rpc("get_team_performance_stats", {
          team_uuid: teamId,
          game_type_param: gameType,
          days_back: daysBack,
        })
        .single()

      if (error) {
        console.error("Error fetching team performance stats:", error)
        return null
      }

      if (data) {
        queryCache.set(cacheKey, data, 5 * 60 * 1000)
      }

      return data
    } catch (error) {
      console.error("Error in getTeamPerformanceStats:", error)
      return null
    }
  }

  async getLiveMatchesCount(): Promise<LiveMatchesCount[]> {
    try {
      const cacheKey = "live-matches-count"
      const cached = queryCache.get<LiveMatchesCount[]>(cacheKey)
      if (cached) {
        return cached
      }

      const supabase = await this.getClient()

      const { data, error } = await supabase.rpc("get_live_matches_count")

      if (error) {
        console.error("Error fetching live matches count:", error)
        return []
      }

      const result = data || []
      queryCache.set(cacheKey, result, 60 * 1000)

      return result
    } catch (error) {
      console.error("Error in getLiveMatchesCount:", error)
      return []
    }
  }

  async getPlayerRankings(
    gameType: string,
    rankingType = "global",
    limit = 50,
    region?: string,
  ): Promise<PlayerRanking[]> {
    try {
      const cacheKey = `player-rankings:${gameType}:${rankingType}:${limit}:${region || "all"}`
      const cached = queryCache.get<PlayerRanking[]>(cacheKey)
      if (cached) {
        return cached
      }

      const supabase = await this.getClient()

      let query = supabase
        .from("player_rankings")
        .select(`
          *,
          player:players(
            name,
            nickname,
            avatar_url,
            nationality
          )
        `)
        .eq("game_type", gameType)
        .eq("ranking_type", rankingType)
        .order("rank_position", { ascending: true })
        .limit(limit)

      if (region) {
        query = query.eq("region", region)
      }

      const { data, error } = await query

      if (error) {
        console.error("Error fetching player rankings:", error)
        return []
      }

      const result = data || []
      queryCache.set(cacheKey, result, 15 * 60 * 1000)

      return result
    } catch (error) {
      console.error("Error in getPlayerRankings:", error)
      return []
    }
  }

  async getTeamRankings(gameType: string, rankingType = "global", limit = 50, region?: string): Promise<TeamRanking[]> {
    try {
      const cacheKey = `team-rankings:${gameType}:${rankingType}:${limit}:${region || "all"}`
      const cached = queryCache.get<TeamRanking[]>(cacheKey)
      if (cached) {
        return cached
      }

      const supabase = await this.getClient()

      let query = supabase
        .from("team_rankings")
        .select(`
          *,
          team:teams(
            name,
            logo_url,
            country,
            region
          )
        `)
        .eq("game_type", gameType)
        .eq("ranking_type", rankingType)
        .order("rank_position", { ascending: true })
        .limit(limit)

      if (region) {
        query = query.eq("region", region)
      }

      const { data, error } = await query

      if (error) {
        console.error("Error fetching team rankings:", error)
        return []
      }

      const result = data || []
      queryCache.set(cacheKey, result, 15 * 60 * 1000)

      return result
    } catch (error) {
      console.error("Error in getTeamRankings:", error)
      return []
    }
  }

  async getMatchStatistics(matchId: string): Promise<MatchStatistics[]> {
    try {
      const cacheKey = `match-stats:${matchId}`
      const cached = queryCache.get<MatchStatistics[]>(cacheKey)
      if (cached) {
        return cached
      }

      const supabase = await this.getClient()

      const { data, error } = await supabase.from("match_statistics").select("*").eq("match_id", matchId)

      if (error) {
        console.error("Error fetching match statistics:", error)
        return []
      }

      const result = data || []
      queryCache.set(cacheKey, result, 10 * 60 * 1000)

      return result
    } catch (error) {
      console.error("Error in getMatchStatistics:", error)
      return []
    }
  }

  async getTopPerformers(
    gameType: string,
    metric: "kills" | "assists" | "damage_dealt" | "accuracy" = "kills",
    limit = 10,
    daysBack = 7,
  ): Promise<any[]> {
    try {
      const supabase = await this.getClient()

      const { data, error } = await supabase
        .from("match_statistics")
        .select(`
          *,
          player:players(name, nickname, avatar_url),
          match:matches(game_type, match_date)
        `)
        .gte("match.match_date", new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000).toISOString())
        .eq("match.game_type", gameType)
        .order(metric, { ascending: false })
        .limit(limit)

      if (error) {
        console.error("Error fetching top performers:", error)
        return []
      }

      return data || []
    } catch (error) {
      console.error("Error in getTopPerformers:", error)
      return []
    }
  }

  async cacheAnalyticsData(
    cacheKey: string,
    data: any,
    expiresInMinutes = 60,
    sportType?: string,
    gameType?: string,
  ): Promise<boolean> {
    try {
      const supabase = await this.getClient()

      const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000)

      const { error } = await supabase.from("analytics_cache").upsert({
        cache_key: cacheKey,
        cache_data: data,
        sport_type: sportType,
        game_type: gameType,
        expires_at: expiresAt.toISOString(),
      })

      if (error) {
        console.error("Error caching analytics data:", error)
        return false
      }

      return true
    } catch (error) {
      console.error("Error in cacheAnalyticsData:", error)
      return false
    }
  }

  async getCachedAnalyticsData(cacheKey: string): Promise<any | null> {
    try {
      const supabase = await this.getClient()

      const { data, error } = await supabase
        .from("analytics_cache")
        .select("cache_data")
        .eq("cache_key", cacheKey)
        .gt("expires_at", new Date().toISOString())
        .single()

      if (error || !data) {
        return null
      }

      return data.cache_data
    } catch (error) {
      console.error("Error in getCachedAnalyticsData:", error)
      return null
    }
  }
}

export const analyticsService = new SupabaseAnalyticsService()
