import { type NextRequest, NextResponse } from "next/server"
import { getCachedUpcomingMatches } from "@/lib/services/match-service"
import type { GameType } from "@/lib/api/pandascore/types"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const game = searchParams.get("game") as GameType | null

    const matches = await getCachedUpcomingMatches(game || undefined)

    return NextResponse.json(matches)
  } catch (error) {
    console.error("[v0] Error fetching upcoming matches:", error)
    return NextResponse.json({ error: "Failed to fetch upcoming matches" }, { status: 500 })
  }
}
