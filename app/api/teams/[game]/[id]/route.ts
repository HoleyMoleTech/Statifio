import { type NextRequest, NextResponse } from "next/server"
import { getTeamById } from "@/lib/api/pandascore/client"
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

    const teamId = Number.parseInt(id)
    if (isNaN(teamId)) {
      return NextResponse.json({ error: "Invalid team ID" }, { status: 400 })
    }

    const team = await getTeamById(game as GameType, teamId)

    return NextResponse.json(team)
  } catch (error) {
    console.error("[v0] Error fetching team details:", error)
    return NextResponse.json({ error: "Failed to fetch team details" }, { status: 500 })
  }
}
