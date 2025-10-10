import { createClient } from "@/lib/supabase/server"
import { getLiveMatches, getUpcomingMatches } from "@/lib/api/pandascore/client"
import type { GameType, Match } from "@/lib/api/pandascore/types"

export async function getCachedLiveMatches(game?: GameType): Promise<Match[]> {
  const supabase = await createClient()

  // Check cache first
  const cacheKey = `live_matches_${game || "all"}`
  const { data: cached } = await supabase
    .from("analytics_cache")
    .select("cache_data")
    .eq("cache_key", cacheKey)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle()

  if (cached?.cache_data) {
    return cached.cache_data as Match[]
  }

  // Fetch from API
  const matches = await getLiveMatches(game)

  // Cache the result
  await supabase.from("analytics_cache").upsert({
    cache_key: cacheKey,
    sport_type: "esports",
    game_type: game || "all",
    cache_data: matches,
    expires_at: new Date(Date.now() + 2 * 60 * 1000).toISOString(), // 2 minutes
    updated_at: new Date().toISOString(),
  })

  return matches
}

export async function getCachedUpcomingMatches(game?: GameType): Promise<Match[]> {
  const supabase = await createClient()

  const cacheKey = `upcoming_matches_${game || "all"}`
  const { data: cached } = await supabase
    .from("analytics_cache")
    .select("cache_data")
    .eq("cache_key", cacheKey)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle()

  if (cached?.cache_data) {
    return cached.cache_data as Match[]
  }

  const matches = await getUpcomingMatches(game)

  await supabase.from("analytics_cache").upsert({
    cache_key: cacheKey,
    sport_type: "esports",
    game_type: game || "all",
    cache_data: matches,
    expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes
    updated_at: new Date().toISOString(),
  })

  return matches
}

export async function syncMatchToDatabase(match: Match, game: GameType): Promise<void> {
  const supabase = await createClient()

  const homeTeam = match.opponents[0]?.opponent
  const awayTeam = match.opponents[1]?.opponent

  await supabase.from("matches").upsert({
    external_id: String(match.id),
    sport_type: "esports",
    game_type: game,
    match_date: match.begin_at,
    status: match.status,
    tournament_name: match.tournament.name,
    home_score: match.results?.[0]?.score || 0,
    away_score: match.results?.[1]?.score || 0,
    match_details: match,
    updated_at: new Date().toISOString(),
  })
}
