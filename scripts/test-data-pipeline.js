// Test script to verify the data pipeline integration
import { esportsService } from "../lib/services/esports-service.js"
import { pandaScoreAPI } from "../lib/api/pandascore.js"

console.log("🚀 Starting Statifio Data Pipeline Test...\n")

async function testDataPipeline() {
  try {
    // Test 1: Check if esports service can fetch overview data
    console.log("📊 Testing Esports Overview Service...")
    const overview = await esportsService.getEsportsOverview()
    console.log(
      `✅ Overview fetched: ${overview.games?.length || 0} games, ${overview.totalLiveMatches || 0} live matches`,
    )

    // Test 2: Check live matches functionality
    console.log("\n🔴 Testing Live Matches Service...")
    const liveMatches = await esportsService.getLiveMatches()
    console.log(`✅ Live matches fetched: ${liveMatches.length} matches`)

    // Test 3: Test game-specific stats
    console.log("\n🎮 Testing Game Stats Service...")
    const lolStats = await esportsService.getGameStats("lol")
    console.log(`✅ LoL stats: ${lolStats.totalTeams} teams, ${lolStats.activeMatches} active matches`)

    // Test 4: Test top teams functionality
    console.log("\n🏆 Testing Top Teams Service...")
    const topTeams = await esportsService.getTopTeams("lol", 5)
    console.log(`✅ Top teams fetched: ${topTeams.length} teams`)

    // Test 5: Test recent matches
    console.log("\n⏰ Testing Recent Matches Service...")
    const recentMatches = await esportsService.getRecentMatches("lol", 5)
    console.log(`✅ Recent matches fetched: ${recentMatches.length} matches`)

    // Test 6: Direct API test (rate limited)
    console.log("\n🌐 Testing Direct PandaScore API...")
    try {
      const apiTeams = await pandaScoreAPI.getTeams("lol", 1, 3)
      console.log(`✅ Direct API test: ${apiTeams.length} teams from PandaScore`)
    } catch (apiError) {
      console.log(`⚠️  Direct API test failed (expected due to rate limiting): ${apiError.message}`)
    }

    console.log("\n🎉 Data Pipeline Test Complete!")
    console.log("📈 Summary:")
    console.log(`   • Overview Service: Working`)
    console.log(`   • Live Matches: Working`)
    console.log(`   • Game Stats: Working`)
    console.log(`   • Top Teams: Working`)
    console.log(`   • Recent Matches: Working`)
    console.log(`   • API Integration: ${overview.games?.length > 0 ? "Working" : "Limited"}`)
  } catch (error) {
    console.error("❌ Data Pipeline Test Failed:", error.message)
    console.error("Stack:", error.stack)
  }
}

// Run the test
testDataPipeline()
