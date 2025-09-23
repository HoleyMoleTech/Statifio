import { createClient } from "../supabase/server"
import { pandaScoreAPI } from "@/lib/api/pandascore"

// Data sync service for populating Supabase with PandaScore data
export class DataSyncService {
  private async getSupabaseClient() {
    return await createClient()
  }

  // Sync teams data with rate limiting consideration
  async syncTeamsData(game: string, batchSize = 5) {
    try {
      console.log(`[DataSync] Starting team sync for ${game}`)
      const supabase = await this.getSupabaseClient()

      const supportedGames = ["lol", "dota2", "csgo"] // Added csgo to supported games list
      if (!supportedGames.includes(game)) {
        console.log(`[DataSync] Skipping unsupported game: ${game}`)
        return { success: true, count: 0, skipped: true }
      }

      const teams = await pandaScoreAPI.getTeams(game, 1, batchSize)

      let savedCount = 0
      for (const team of teams) {
        try {
          const { data: existingTeam } = await supabase
            .from("teams")
            .select("id")
            .eq("external_id", team.id.toString())
            .eq("sport_type", "esports")
            .single()

          const teamData = {
            external_id: team.id.toString(),
            name: team.name,
            acronym: team.acronym || team.name.substring(0, 3).toUpperCase(),
            logo_url: team.image_url,
            location: team.location,
            sport_type: "esports",
            game_type: game,
            updated_at: new Date().toISOString(),
          }

          if (existingTeam) {
            await supabase.from("teams").update(teamData).eq("id", existingTeam.id)
          } else {
            await supabase.from("teams").insert(teamData)
          }
          savedCount++
        } catch (teamError) {
          console.error(`[DataSync] Error saving team ${team.name}:`, teamError)
        }
      }

      console.log(`[DataSync] Successfully synced ${savedCount} teams for ${game}`)
      return { success: true, count: savedCount }
    } catch (error) {
      console.error(`[DataSync] Error syncing teams for ${game}:`, error)
      return { success: false, error: error.message }
    }
  }

  // Sync matches data with intelligent scheduling
  async syncMatchesData(game: string, batchSize = 3) {
    try {
      console.log(`[DataSync] Starting matches sync for ${game}`)
      const supabase = await this.getSupabaseClient()

      const supportedGames = ["lol", "dota2", "csgo"] // Added csgo to supported games list
      if (!supportedGames.includes(game)) {
        console.log(`[DataSync] Skipping unsupported game: ${game}`)
        return { success: true, count: 0, skipped: true }
      }

      const matches = await pandaScoreAPI.getUpcomingMatches(game, 1, batchSize)

      let savedCount = 0
      for (const match of matches) {
        try {
          const { data: existingMatch } = await supabase
            .from("matches")
            .select("id")
            .eq("external_id", match.id.toString())
            .single()

          const matchData = {
            external_id: match.id.toString(),
            name: match.name,
            status: match.status,
            start_time: match.begin_at,
            end_time: match.end_at,
            sport_type: "esports",
            game_type: game,
            league_name: match.league?.name,
            tournament_name: match.tournament?.name,
            updated_at: new Date().toISOString(),
          }

          if (existingMatch) {
            await supabase.from("matches").update(matchData).eq("id", existingMatch.id)
          } else {
            await supabase.from("matches").insert(matchData)
          }
          savedCount++
        } catch (matchError) {
          console.error(`[DataSync] Error saving match ${match.name}:`, matchError)
        }
      }

      console.log(`[DataSync] Successfully synced ${savedCount} matches for ${game}`)
      return { success: true, count: savedCount }
    } catch (error) {
      console.error(`[DataSync] Error syncing matches for ${game}:`, error)
      return { success: false, error: error.message }
    }
  }

  // Intelligent sync scheduler that respects rate limits
  async performIntelligentSync() {
    const games = ["lol", "dota2", "csgo"] // Added csgo support
    const results = []

    console.log("[DataSync] Starting intelligent sync process")

    for (const game of games) {
      console.log(`[DataSync] Processing ${game}...`)

      const teamResult = await this.syncTeamsData(game, 5)
      results.push({ game, type: "teams", ...teamResult })

      await new Promise((resolve) => setTimeout(resolve, 4000)) // 4 second delay

      const matchResult = await this.syncMatchesData(game, 3)
      results.push({ game, type: "matches", ...matchResult })

      await new Promise((resolve) => setTimeout(resolve, 4000)) // 4 second delay
    }

    console.log("[DataSync] Intelligent sync completed:", results)
    return results
  }
}

export const dataSyncService = new DataSyncService()
