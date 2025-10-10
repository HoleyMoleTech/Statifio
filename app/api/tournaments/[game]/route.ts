import { type NextRequest, NextResponse } from "next/server"
import { getTournaments } from "@/lib/api/pandascore/client"
import type { GameType } from "@/lib/api/pandascore/types"

interface RouteParams {
  params: Promise<{
    game: string
  }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { game } = await params

    // Validate game type
    if (!["lol", "cs2", "dota2"].includes(game)) {
      return NextResponse.json({ error: "Invalid game type" }, { status: 400 })
    }

    const tournaments = await getTournaments(game as GameType)

    return NextResponse.json(tournaments)
  } catch (error) {
    console.error("[v0] Error fetching tournaments:", error)
    return NextResponse.json({ error: "Failed to fetch tournaments" }, { status: 500 })
  }
}
