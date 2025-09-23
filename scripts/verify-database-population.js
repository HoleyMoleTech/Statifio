// Verification script to check database population status
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

console.log("🔍 Verifying Statifio Database Population...\n")

async function verifyDatabasePopulation() {
  try {
    // Check teams table
    const { data: teams, error: teamsError } = await supabase
      .from("teams")
      .select("id, name, game_type, sport_type")
      .limit(100)

    if (teamsError) throw teamsError

    // Check matches table
    const { data: matches, error: matchesError } = await supabase
      .from("matches")
      .select("id, tournament_name, game_type, sport_type, status")
      .limit(100)

    if (matchesError) throw matchesError

    // Check players table
    const { data: players, error: playersError } = await supabase
      .from("players")
      .select("id, name, team_id, game_type")
      .limit(50)

    if (playersError) throw playersError

    // Analyze data by game type
    const gameStats = {}

    teams?.forEach((team) => {
      if (!gameStats[team.game_type]) {
        gameStats[team.game_type] = { teams: 0, matches: 0, players: 0 }
      }
      gameStats[team.game_type].teams++
    })

    matches?.forEach((match) => {
      if (gameStats[match.game_type]) {
        gameStats[match.game_type].matches++
      }
    })

    players?.forEach((player) => {
      if (gameStats[player.game_type]) {
        gameStats[player.game_type].players++
      }
    })

    // Display results
    console.log("📊 Database Population Status:")
    console.log("=".repeat(50))
    console.log(`📋 Total Records:`)
    console.log(`   • Teams: ${teams?.length || 0}`)
    console.log(`   • Matches: ${matches?.length || 0}`)
    console.log(`   • Players: ${players?.length || 0}`)

    console.log("\n🎮 By Game Type:")
    Object.entries(gameStats).forEach(([game, stats]) => {
      console.log(
        `   • ${game.toUpperCase()}: ${stats.teams} teams, ${stats.matches} matches, ${stats.players} players`,
      )
    })

    // Check for recent data
    const recentMatches = matches?.filter(
      (match) => new Date(match.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000),
    )

    console.log(`\n⏰ Recent Data (last 24h): ${recentMatches?.length || 0} matches`)

    // Determine status
    const totalRecords = (teams?.length || 0) + (matches?.length || 0) + (players?.length || 0)

    if (totalRecords > 10) {
      console.log("\n✅ Database Population: SUCCESSFUL")
      console.log("🚀 Statifio is ready for Phase 1 completion!")
    } else if (totalRecords > 0) {
      console.log("\n⚠️  Database Population: PARTIAL")
      console.log("💡 Consider running the population script again")
    } else {
      console.log("\n❌ Database Population: EMPTY")
      console.log("🔧 Run the populate-initial-data.js script to add data")
    }
  } catch (error) {
    console.error("❌ Database Verification Failed:", error.message)
    console.log("\n🔧 Troubleshooting:")
    console.log("   • Check Supabase connection")
    console.log("   • Verify environment variables")
    console.log("   • Ensure database schema exists")
  }
}

// Run verification
verifyDatabasePopulation()
