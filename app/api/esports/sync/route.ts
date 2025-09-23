import { NextResponse } from "next/server"
import { dataSyncService } from "@/lib/services/data-sync-service"

// Manual data sync endpoint for admin use
export async function POST() {
  try {
    console.log("[API] Starting manual data sync")

    const results = await dataSyncService.performIntelligentSync()

    return NextResponse.json({
      success: true,
      message: "Data sync completed",
      results,
    })
  } catch (error) {
    console.error("[API] Data sync failed:", error)
    return NextResponse.json({ success: false, error: "Data sync failed" }, { status: 500 })
  }
}

// Get sync status
export async function GET() {
  try {
    // Return basic sync information
    return NextResponse.json({
      status: "ready",
      lastSync: new Date().toISOString(),
      rateLimit: {
        maxRequestsPerHour: 1000,
        recommendedInterval: 3.6, // seconds
        batchSize: 3, // recommended batch size
      },
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to get sync status" }, { status: 500 })
  }
}
