import { type NextRequest, NextResponse } from "next/server"
import { getMatchById } from "@/lib/api/pandascore/client"
import type { GameType } from "@/lib/api/pandascore/types"

interface RouteParams {
  params: Promise<{
    game: string
    id: string
  }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { game, id } = await params

    // Validate game type
    if (!["lol", "cs2", "dota2"].includes(game)) {
      return NextResponse.json({ error: "Invalid game type" }, { status: 400 })
    }

    const matchId = Number.parseInt(id)
    if (isNaN(matchId)) {
      return NextResponse.json({ error: "Invalid match ID" }, { status: 400 })
    }

    const match = await getMatchById(game as GameType, matchId)

    return NextResponse.json(match)
  } catch (error) {
    console.error("[v0] Error fetching match details:", error)
    return NextResponse.json({ error: "Failed to fetch match details" }, { status: 500 })
  }
}
