// Test script to validate CSGO API integration
import { pandaScoreAPI } from "../lib/api/pandascore.js"

async function testCSGOAPI() {
  console.log("[TEST] Starting CSGO API validation...")

  try {
    // Test teams endpoint
    console.log("[TEST] Testing CSGO teams endpoint...")
    const teams = await pandaScoreAPI.getTeams("csgo", 1, 5)
    console.log(`[TEST] ✅ CSGO teams: ${teams.length} found`)

    // Test running matches endpoint
    console.log("[TEST] Testing CSGO running matches endpoint...")
    const runningMatches = await pandaScoreAPI.getRunningMatches("csgo")
    console.log(`[TEST] ✅ CSGO running matches: ${runningMatches.length} found`)

    // Test upcoming matches endpoint
    console.log("[TEST] Testing CSGO upcoming matches endpoint...")
    const upcomingMatches = await pandaScoreAPI.getUpcomingMatches("csgo", 1, 5)
    console.log(`[TEST] ✅ CSGO upcoming matches: ${upcomingMatches.length} found`)

    console.log("[TEST] ✅ All CSGO API endpoints working correctly!")

    return {
      teams: teams.length,
      runningMatches: runningMatches.length,
      upcomingMatches: upcomingMatches.length,
      success: true,
    }
  } catch (error) {
    console.error("[TEST] ❌ CSGO API test failed:", error.message)
    return { success: false, error: error.message }
  }
}

// Run the test
testCSGOAPI().then((result) => {
  console.log("[TEST] Final result:", result)
  process.exit(result.success ? 0 : 1)
})
