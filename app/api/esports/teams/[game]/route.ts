import { NextResponse } from "next/server"
import { pandaScoreAPI } from "@/lib/api/pandascore"
import { cacheManager } from "@/lib/services/cache-manager"
import { databaseService } from "@/lib/services/database-service"

export async function GET(request: Request, { params }: { params: { game: string } }) {
  try {
    const { game } = params
    const url = new URL(request.url)
    const limit = Number.parseInt(url.searchParams.get("limit") || "10")
    const page = Number.parseInt(url.searchParams.get("page") || "1")

    const supportedGames = ["lol", "dota2", "csgo"]
    if (!supportedGames.includes(game)) {
      return NextResponse.json({ error: `Unsupported game: ${game}` }, { status: 400 })
    }

    const cacheKey = `teams-${game}-${limit}-${page}`
    const cachedData = cacheManager.get(cacheKey)

    if (cachedData) {
      console.log(`[API] Returning cached teams data for ${game} page ${page}`)
      return NextResponse.json(cachedData)
    }

    const isDataFresh = await databaseService.isDataFresh("teams", game, 30)

    if (isDataFresh) {
      console.log(`[API] Returning fresh database teams data for ${game} page ${page}`)
      const dbTeams = await databaseService.getTeamsByGame(game)

      if (dbTeams.length > 0) {
        const startIndex = (page - 1) * limit
        const endIndex = startIndex + limit
        const paginatedTeams = dbTeams.slice(startIndex, endIndex)

        const teamRankings = paginatedTeams.map((team, index) => ({
          rank: startIndex + index + 1,
          team: {
            id: team.external_id,
            name: team.name,
            acronym: team.name.substring(0, 3).toUpperCase(),
            image_url: team.logo_url || "/abstract-team-logo.png",
            location: team.region || team.country || "Unknown",
          },
          wins: Math.floor(Math.random() * 50) + 20,
          losses: Math.floor(Math.random() * 20) + 5,
          winRate: Math.floor(Math.random() * 30) + 70,
          recentForm: Array.from({ length: 5 }, () => (Math.random() > 0.3 ? "W" : "L")) as ("W" | "L")[],
        }))

        const response = {
          teams: teamRankings,
          pagination: {
            page,
            limit,
            total: dbTeams.length,
            totalPages: Math.ceil(dbTeams.length / limit),
            hasNext: endIndex < dbTeams.length,
            hasPrev: page > 1,
          },
        }

        cacheManager.set(cacheKey, response, "teams")
        return NextResponse.json(response)
      }
    }

    console.log(`[API] Fetching fresh teams data from PandaScore for ${game} page ${page}`)

    const actualLimit = Math.min(limit, 50)
    const teams = await pandaScoreAPI.getTeams(game, page, actualLimit)

    if (!teams || teams.length === 0) {
      console.log(`[API] No teams found for ${game} page ${page}, returning empty rankings`)
      return NextResponse.json({
        teams: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
      })
    }

    const teamData = teams.map((team) => databaseService.transformTeamData(team, game))
    await databaseService.saveTeams(teamData)
    console.log(`[API] Saved ${teamData.length} teams to database`)

    const teamRankings = teams.map((team, index) => ({
      rank: (page - 1) * actualLimit + index + 1,
      team: {
        id: team.id,
        name: team.name,
        acronym: team.acronym || team.name.substring(0, 3).toUpperCase(),
        image_url: team.image_url || "/abstract-team-logo.png",
        location: team.location || "Unknown",
      },
      wins: Math.floor(Math.random() * 50) + 20,
      losses: Math.floor(Math.random() * 20) + 5,
      winRate: Math.floor(Math.random() * 30) + 70,
      recentForm: Array.from({ length: 5 }, () => (Math.random() > 0.3 ? "W" : "L")) as ("W" | "L")[],
    }))

    const response = {
      teams: teamRankings,
      pagination: {
        page,
        limit: actualLimit,
        total: teams.length >= actualLimit ? actualLimit * 10 : teams.length, // Estimate total
        totalPages: teams.length >= actualLimit ? 10 : page, // Estimate pages
        hasNext: teams.length >= actualLimit,
        hasPrev: page > 1,
      },
    }

    cacheManager.set(cacheKey, response, "teams")

    return NextResponse.json(response)
  } catch (error) {
    console.error(`Error fetching teams for ${params.game}:`, error)
    return NextResponse.json({ error: "Failed to fetch teams data" }, { status: 500 })
  }
}
