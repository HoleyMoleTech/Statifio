// Reliable data population script focusing on working games only
import { dataSyncService } from "../lib/services/data-sync-service.js"

async function populateWorkingData() {
  console.log("🚀 Starting reliable data population...")

  try {
    // Focus only on League of Legends and Dota 2 (working games)
    const workingGames = ["lol", "dota2"]

    for (const game of workingGames) {
      console.log(`\n📊 Processing ${game.toUpperCase()}...`)

      // Sync teams first
      console.log(`Syncing teams for ${game}...`)
      const teamResult = await dataSyncService.syncTeamsData(game, 5)

      if (teamResult.success) {
        console.log(`✅ Successfully synced ${teamResult.count} teams for ${game}`)
      } else {
        console.log(`❌ Failed to sync teams for ${game}: ${teamResult.error}`)
      }

      // Wait between API calls
      await new Promise((resolve) => setTimeout(resolve, 4000))

      // Sync matches
      console.log(`Syncing matches for ${game}...`)
      const matchResult = await dataSyncService.syncMatchesData(game, 3)

      if (matchResult.success) {
        console.log(`✅ Successfully synced ${matchResult.count} matches for ${game}`)
      } else {
        console.log(`❌ Failed to sync matches for ${game}: ${matchResult.error}`)
      }

      // Wait between games
      await new Promise((resolve) => setTimeout(resolve, 4000))
    }

    console.log("\n🎉 Data population completed successfully!")
  } catch (error) {
    console.error("💥 Error during data population:", error)
  }
}

// Run the population
populateWorkingData()
