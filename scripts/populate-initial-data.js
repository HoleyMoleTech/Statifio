// Initial data population script for Statifio
import { dataSyncService } from "../lib/services/data-sync-service.js"

console.log("🚀 Starting Statifio Initial Data Population...\n")

async function populateInitialData() {
  try {
    console.log("📊 Phase 1: Populating Teams and Matches Data")
    console.log("⏰ This process respects API rate limits and may take a few minutes...\n")

    // Run the intelligent sync process
    const results = await dataSyncService.performIntelligentSync()

    // Analyze results
    let totalTeams = 0
    let totalMatches = 0
    let successfulSyncs = 0

    console.log("\n📈 Population Results:")
    console.log("=".repeat(50))

    results.forEach((result) => {
      const status = result.success ? "✅" : "❌"
      console.log(`${status} ${result.game.toUpperCase()} ${result.type}: ${result.count || 0} records`)

      if (result.success) {
        successfulSyncs++
        if (result.type === "teams") totalTeams += result.count || 0
        if (result.type === "matches") totalMatches += result.count || 0
      }
    })

    console.log("=".repeat(50))
    console.log(`📊 Summary:`)
    console.log(`   • Total Teams Populated: ${totalTeams}`)
    console.log(`   • Total Matches Populated: ${totalMatches}`)
    console.log(`   • Successful Operations: ${successfulSyncs}/${results.length}`)
    console.log(`   • Games Covered: League of Legends, CS2, Dota 2`)

    if (successfulSyncs === results.length) {
      console.log("\n🎉 Initial Data Population Complete!")
      console.log("✨ Your Statifio database is now ready with live esports data!")
    } else {
      console.log("\n⚠️  Some operations failed - this may be due to API rate limits")
      console.log("💡 You can run this script again to retry failed operations")
    }
  } catch (error) {
    console.error("❌ Initial Data Population Failed:", error.message)
    console.error("🔍 Error Details:", error.stack)
    console.log("\n💡 Troubleshooting Tips:")
    console.log("   • Check your internet connection")
    console.log("   • Verify Supabase environment variables are set")
    console.log("   • Ensure PandaScore API is accessible")
  }
}

// Run the population
populateInitialData()
