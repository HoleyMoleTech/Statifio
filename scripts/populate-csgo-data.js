// Script to populate CSGO data specifically
import { dataSyncService } from "../lib/services/data-sync-service.js"

async function populateCSGOData() {
  console.log("[POPULATE] Starting CSGO data population...")

  try {
    // Sync CSGO teams
    console.log("[POPULATE] Syncing CSGO teams...")
    const teamResult = await dataSyncService.syncTeamsData("csgo", 10)
    console.log("[POPULATE] Teams result:", teamResult)

    // Wait 4 seconds for rate limiting
    await new Promise((resolve) => setTimeout(resolve, 4000))

    // Sync CSGO matches
    console.log("[POPULATE] Syncing CSGO matches...")
    const matchResult = await dataSyncService.syncMatchesData("csgo", 5)
    console.log("[POPULATE] Matches result:", matchResult)

    console.log("[POPULATE] ✅ CSGO data population completed!")

    return {
      teams: teamResult,
      matches: matchResult,
      success: true,
    }
  } catch (error) {
    console.error("[POPULATE] ❌ CSGO data population failed:", error)
    return { success: false, error: error.message }
  }
}

// Run the population
populateCSGOData().then((result) => {
  console.log("[POPULATE] Final result:", result)
  process.exit(result.success ? 0 : 1)
})
