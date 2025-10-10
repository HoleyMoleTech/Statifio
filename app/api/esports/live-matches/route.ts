import { type NextRequest, NextResponse } from "next/server"
import { getCachedLiveMatches } from "@/lib/services/match-service"
import type { GameType } from "@/lib/api/pandascore/types"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const game = searchParams.get("game") as GameType | null

    const matches = await getCachedLiveMatches(game || undefined)

    return NextResponse.json(matches)
  } catch (error) {
    console.error("[v0] Error fetching live matches:", error)
    return NextResponse.json({ error: "Failed to fetch live matches" }, { status: 500 })
  }
}
