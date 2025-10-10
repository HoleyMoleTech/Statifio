import { type NextRequest, NextResponse } from "next/server"
import { getPastMatches } from "@/lib/api/pandascore/client"
import type { GameType } from "@/lib/api/pandascore/types"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const game = searchParams.get("game") as GameType | null

    const matches = await getPastMatches(game || undefined)

    return NextResponse.json(matches)
  } catch (error) {
    console.error("[v0] Error fetching past matches:", error)
    return NextResponse.json({ error: "Failed to fetch past matches" }, { status: 500 })
  }
}
