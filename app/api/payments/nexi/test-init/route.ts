import { type NextRequest, NextResponse } from "next/server"
import { NexiService } from "@/lib/services/nexi-service"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Testing Nexi service initialization")

    const nexiService = new NexiService()
    const isInitialized = await nexiService.initialize()

    if (isInitialized) {
      console.log("[v0] Nexi service initialization test successful")
      return NextResponse.json({
        success: true,
        data: {
          initialized: true,
          environment: "test",
          timestamp: new Date().toISOString(),
        },
      })
    } else {
      console.log("[v0] Nexi service initialization test failed")
      return NextResponse.json(
        {
          success: false,
          error: "Service failed to initialize",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("[v0] Nexi service initialization test error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
