import { type NextRequest, NextResponse } from "next/server"
import { getTeams } from "@/lib/api/pandascore/client"
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

    const teams = await getTeams(game as GameType)

    return NextResponse.json(teams)
  } catch (error) {
    console.error("[v0] Error fetching teams:", error)
    return NextResponse.json({ error: "Failed to fetch teams" }, { status: 500 })
  }
}
