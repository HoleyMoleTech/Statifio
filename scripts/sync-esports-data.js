// Script to populate the database with esports data from PandaScore API
import { dataSyncService } from "../lib/services/data-sync-service.js"

async function runDataSync() {
  console.log("🚀 Starting esports data synchronization...")

  try {
    // Run the intelligent sync process
    const results = await dataSyncService.performIntelligentSync()

    console.log("✅ Data sync completed successfully!")
    console.log("📊 Sync Results:")

    results.forEach((result) => {
      const status = result.success ? "✅" : "❌"
      const count = result.count || 0
      const skipped = result.skipped ? " (skipped)" : ""

      console.log(`${status} ${result.game} ${result.type}: ${count} records${skipped}`)

      if (!result.success && result.error) {
        console.log(`   Error: ${result.error}`)
      }
    })

    // Calculate totals
    const totalTeams = results
      .filter((r) => r.type === "teams" && r.success)
      .reduce((sum, r) => sum + (r.count || 0), 0)

    const totalMatches = results
      .filter((r) => r.type === "matches" && r.success)
      .reduce((sum, r) => sum + (r.count || 0), 0)

    console.log("\n📈 Summary:")
    console.log(`   Teams synced: ${totalTeams}`)
    console.log(`   Matches synced: ${totalMatches}`)
    console.log("   Database is now populated with live esports data!")
  } catch (error) {
    console.error("❌ Data sync failed:", error)
    process.exit(1)
  }
}

// Run the sync
runDataSync()
