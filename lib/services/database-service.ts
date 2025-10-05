import { createClient } from "@/lib/supabase/server"
import { createServiceClient } from "@/lib/supabase/service"
import { queryCache } from "@/lib/cache/query-cache"

export interface TeamData {
  external_id: string
  name: string
  sport_type: string
  game_type: string
  logo_url?: string
  region?: string
  country?: string
  description?: string
  website_url?: string
  founded_year?: number
  social_links?: any
}

export interface MatchData {
  external_id: string
  home_team_id: string
  away_team_id: string
  match_date: Date
  sport_type: string
  game_type: string
  tournament_name?: string
  status: string
  home_score?: number
  away_score?: number
  match_details?: any
}

export interface PlayerData {
  external_id: string
  name: string
  nickname?: string
  team_id?: string
  sport_type: string
  game_type: string
  position?: string
  nationality?: string
  age?: number
  avatar_url?: string
  bio?: string
  stats?: any
  social_links?: any
}

export class DatabaseService {
  private serviceClient: ReturnType<typeof createServiceClient> | null = null
  private teamIdCache: Map<string, string | null> = new Map()

  private getServiceClient() {
    if (!this.serviceClient) {
      this.serviceClient = createServiceClient()
    }
    return this.serviceClient
  }

  private async getClient() {
    return await createClient()
  }

  private isSupabaseConfigured(): boolean {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    return !!(url && key && serviceKey)
  }

  async saveTeams(teams: TeamData[]): Promise<void> {
    if (!this.isSupabaseConfigured()) {
      console.warn("[v0] Supabase not configured, skipping team save operation")
      return
    }

    const supabase = this.getServiceClient()

    const { error } = await supabase.from("teams").upsert(teams, {
      onConflict: "external_id,sport_type,game_type",
      ignoreDuplicates: false,
    })

    if (error) {
      console.error("Error saving teams to database:", error)
      throw error
    }
  }

  async getTeamsByGame(gameType: string, sportType = "esports"): Promise<any[]> {
    if (!this.isSupabaseConfigured()) {
      console.warn("[v0] Supabase not configured, returning empty teams array")
      return []
    }

    const cacheKey = `teams:${gameType}:${sportType}`
    const cached = queryCache.get<any[]>(cacheKey)
    if (cached) {
      return cached
    }

    const supabase = await this.getClient()

    const { data, error } = await supabase
      .from("teams")
      .select("*")
      .eq("game_type", gameType)
      .eq("sport_type", sportType)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching teams from database:", error)
      return []
    }

    const result = data || []
    queryCache.set(cacheKey, result, 10 * 60 * 1000)
    return result
  }

  async getTeamsByExternalIds(externalIds: string[], gameType: string, sportType = "esports"): Promise<any[]> {
    if (!this.isSupabaseConfigured()) {
      console.warn("[v0] Supabase not configured, returning empty teams array")
      return []
    }

    const cacheKey = `teams:external:${gameType}:${sportType}:${externalIds.sort().join(",")}`
    const cached = queryCache.get<any[]>(cacheKey)
    if (cached) {
      return cached
    }

    const supabase = await this.getClient()

    const { data, error } = await supabase
      .from("teams")
      .select("*")
      .in("external_id", externalIds)
      .eq("game_type", gameType)
      .eq("sport_type", sportType)

    if (error) {
      console.error("Error fetching teams by external IDs from database:", error)
      return []
    }

    const result = data || []
    queryCache.set(cacheKey, result, 15 * 60 * 1000)
    return result
  }

  async saveMatches(matches: MatchData[]): Promise<void> {
    if (!this.isSupabaseConfigured()) {
      console.warn("[v0] Supabase not configured, skipping match save operation")
      return
    }

    const supabase = this.getServiceClient()

    console.log(`[v0] Starting to save ${matches.length} matches`)

    const validInputMatches = matches.filter((match) => match.home_team_id && match.away_team_id)
    console.log(`[v0] Filtered to ${validInputMatches.length} matches with valid team IDs`)

    if (validInputMatches.length === 0) {
      console.warn("No matches with valid team IDs to process")
      return
    }

    const resolvedMatches = await Promise.all(
      validInputMatches.map(async (match) => {
        console.log(
          `[v0] Resolving team IDs for match ${match.external_id}: home=${match.home_team_id}, away=${match.away_team_id}`,
        )

        const homeTeamId = await this.getTeamIdByExternalId(match.home_team_id, match.game_type, match.sport_type)
        const awayTeamId = await this.getTeamIdByExternalId(match.away_team_id, match.game_type, match.sport_type)

        console.log(`[v0] Resolved team IDs for match ${match.external_id}: home=${homeTeamId}, away=${awayTeamId}`)

        return {
          ...match,
          home_team_id: homeTeamId,
          away_team_id: awayTeamId,
        }
      }),
    )

    const validMatches = resolvedMatches.filter((match) => match.home_team_id && match.away_team_id)

    console.log(`[v0] Valid matches after filtering: ${validMatches.length} out of ${matches.length}`)

    if (validMatches.length === 0) {
      console.warn("No valid matches to save - all team IDs could not be resolved")
      resolvedMatches.forEach((match) => {
        if (!match.home_team_id || !match.away_team_id) {
          console.warn(
            `[v0] Failed to resolve team IDs for match ${match.external_id}: home=${match.home_team_id}, away=${match.away_team_id}`,
          )
        }
      })
      return
    }

    const { error } = await supabase.from("matches").upsert(validMatches, {
      onConflict: "external_id,sport_type,game_type",
      ignoreDuplicates: false,
    })

    if (error) {
      console.error("Error saving matches to database:", error)
      throw error
    }

    console.log(`[API] Saved ${validMatches.length} matches to database`)
  }

  async getMatchesByGame(gameType: string, sportType = "esports", limit = 10): Promise<any[]> {
    if (!this.isSupabaseConfigured()) {
      console.warn("[v0] Supabase not configured, returning empty matches array")
      return []
    }

    const cacheKey = `matches:${gameType}:${sportType}:${limit}`
    const cached = queryCache.get<any[]>(cacheKey)
    if (cached) {
      return cached
    }

    const supabase = await this.getClient()

    const { data, error } = await supabase
      .from("matches")
      .select(`
        *,
        home_team:teams!matches_home_team_id_fkey(*),
        away_team:teams!matches_away_team_id_fkey(*)
      `)
      .eq("game_type", gameType)
      .eq("sport_type", sportType)
      .order("match_date", { ascending: false })
      .limit(limit)

    if (error) {
      console.error("Error fetching matches from database:", error)
      return []
    }

    const result = data || []
    queryCache.set(cacheKey, result, 2 * 60 * 1000)
    return result
  }

  async savePlayers(players: PlayerData[]): Promise<void> {
    if (!this.isSupabaseConfigured()) {
      console.warn("[v0] Supabase not configured, skipping player save operation")
      return
    }

    const supabase = this.getServiceClient()

    const { error } = await supabase.from("players").upsert(players, {
      onConflict: "external_id,sport_type,game_type",
      ignoreDuplicates: false,
    })

    if (error) {
      console.error("Error saving players to database:", error)
      throw error
    }
  }

  async getPlayersByTeam(teamId: string): Promise<any[]> {
    if (!this.isSupabaseConfigured()) {
      console.warn("[v0] Supabase not configured, returning empty players array")
      return []
    }

    const cacheKey = `players:team:${teamId}`
    const cached = queryCache.get<any[]>(cacheKey)
    if (cached) {
      return cached
    }

    const supabase = await this.getClient()

    const { data, error } = await supabase
      .from("players")
      .select("*")
      .eq("team_id", teamId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching players from database:", error)
      return []
    }

    const result = data || []
    queryCache.set(cacheKey, result, 30 * 60 * 1000)
    return result
  }

  async isDataFresh(table: string, gameType: string, maxAgeMinutes = 30): Promise<boolean> {
    if (!this.isSupabaseConfigured()) {
      console.warn("[v0] Supabase not configured, treating data as not fresh")
      return false
    }

    const supabase = await this.getClient()

    const cutoffTime = new Date(Date.now() - maxAgeMinutes * 60 * 1000).toISOString()

    const { data, error } = await supabase
      .from(table)
      .select("updated_at")
      .eq("game_type", gameType)
      .gte("updated_at", cutoffTime)
      .limit(1)

    if (error) {
      console.error(`Error checking data freshness for ${table}:`, error)
      return false
    }

    return data && data.length > 0
  }

  transformTeamData(pandaTeam: any, gameType: string): TeamData {
    return {
      external_id: pandaTeam.id.toString(),
      name: pandaTeam.name,
      sport_type: "esports",
      game_type: gameType,
      logo_url: pandaTeam.image_url,
      region: pandaTeam.location,
      country: pandaTeam.location,
      description: pandaTeam.description,
      website_url: pandaTeam.website_url,
      founded_year: pandaTeam.founded_year,
      social_links: pandaTeam.social_links || {},
    }
  }

  transformMatchData(pandaMatch: any, gameType: string): MatchData {
    const homeTeamId = pandaMatch.opponents?.[0]?.opponent?.id?.toString() || null
    const awayTeamId = pandaMatch.opponents?.[1]?.opponent?.id?.toString() || null

    if (!homeTeamId || !awayTeamId) {
      console.warn(
        `[v0] Skipping match ${pandaMatch.id} due to missing team data: home=${homeTeamId}, away=${awayTeamId}`,
      )
    }

    return {
      external_id: pandaMatch.id.toString(),
      home_team_id: homeTeamId || "",
      away_team_id: awayTeamId || "",
      match_date: new Date(pandaMatch.scheduled_at || pandaMatch.begin_at),
      sport_type: "esports",
      game_type: gameType,
      tournament_name: pandaMatch.tournament?.name || pandaMatch.serie?.name,
      status: pandaMatch.status,
      home_score: pandaMatch.results?.[0]?.score,
      away_score: pandaMatch.results?.[1]?.score,
      match_details: {
        streams: pandaMatch.streams,
        games: pandaMatch.games,
        winner: pandaMatch.winner,
      },
    }
  }

  private async getTeamIdByExternalId(
    externalId: string,
    gameType: string,
    sportType = "esports",
  ): Promise<string | null> {
    if (!this.isSupabaseConfigured()) {
      console.warn("[v0] Supabase not configured, cannot resolve team ID")
      return null
    }

    const cacheKey = `${externalId}:${gameType}:${sportType}`
    if (this.teamIdCache.has(cacheKey)) {
      return this.teamIdCache.get(cacheKey)!
    }

    const supabase = this.getServiceClient()

    console.log(`[v0] Looking up team ID for external_id=${externalId}, game_type=${gameType}, sport_type=${sportType}`)

    const { data, error } = await supabase
      .from("teams")
      .select("id")
      .eq("external_id", externalId)
      .eq("game_type", gameType)
      .eq("sport_type", sportType)
      .limit(1)

    if (error) {
      console.warn(
        `[v0] Could not find team with external_id=${externalId}, game_type=${gameType}, sport_type=${sportType}. Error:`,
        error.message,
      )
      this.teamIdCache.set(cacheKey, null)
      return null
    }

    if (!data || data.length === 0) {
      console.warn(`[v0] No team found with external_id=${externalId}, game_type=${gameType}, sport_type=${sportType}`)
      this.teamIdCache.set(cacheKey, null)
      return null
    }

    if (data.length > 1) {
      console.warn(
        `[v0] Multiple teams found with external_id=${externalId}, game_type=${gameType}, sport_type=${sportType}. Using first match.`,
      )
    }

    console.log(`[v0] Found team ID ${data[0].id} for external_id=${externalId}`)
    const teamId = data[0].id
    this.teamIdCache.set(cacheKey, teamId)
    return teamId
  }
}

export const databaseService = new DatabaseService()
