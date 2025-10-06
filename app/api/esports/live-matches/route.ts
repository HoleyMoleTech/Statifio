import { NextResponse } from "next/server"
import { pandaScoreAPI } from "@/lib/api/pandascore"
import { handleApiError } from "@/lib/middleware/error-handler"
import { rateLimit, rateLimitPresets } from "@/lib/middleware/rate-limit"

const limiter = rateLimit(rateLimitPresets.moderate)

export async function GET(request: Request) {
  try {
    const rateLimitResponse = await limiter(request as any)
    if (rateLimitResponse) return rateLimitResponse

    console.log("[v0] Live matches API called")

    const [lolMatches, csgoMatches, dota2Matches] = await Promise.all([
      pandaScoreAPI.getRunningMatches("lol").catch((err) => {
        console.log("[v0] Error fetching LoL running matches:", err.message)
        return []
      }),
      pandaScoreAPI.getRunningMatches("csgo").catch((err) => {
        console.log("[v0] Error fetching CSGO running matches:", err.message)
        return []
      }),
      pandaScoreAPI.getRunningMatches("dota2").catch((err) => {
        console.log("[v0] Error fetching DOTA2 running matches:", err.message)
        return []
      }),
    ])

    const allMatches = [...lolMatches, ...csgoMatches, ...dota2Matches]

    const liveMatches = allMatches.map((match) => {
      const team1 = match.opponents?.[0]?.opponent
      const team2 = match.opponents?.[1]?.opponent

      const team1Result = team1?.id ? match.results?.find((r) => r?.team_id === team1.id) : undefined
      const team2Result = team2?.id ? match.results?.find((r) => r?.team_id === team2.id) : undefined

      const team1Score = team1Result !== undefined ? team1Result.score : undefined
      const team2Score = team2Result !== undefined ? team2Result.score : undefined

      return {
        id: match.id,
        date: match.begin_at,
        status: "running" as const,
        teams: {
          team1: {
            name: team1?.name || "TBD",
            acronym: team1?.acronym || "TBD",
            image_url: team1?.image_url || "/abstract-team-logo.png",
            score: team1Score,
          },
          team2: {
            name: team2?.name || "TBD",
            acronym: team2?.acronym || "TBD",
            image_url: team2?.image_url || "/abstract-team-logo.png",
            score: team2Score,
          },
        },
        tournament: {
          name: match.tournament?.name || "Unknown Tournament",
          league: match.league?.name || "Unknown League",
        },
        videogame: match.videogame?.name || "Unknown Game",
      }
    })

    console.log("[v0] Processed", liveMatches.length, "live matches")
    return NextResponse.json(liveMatches)
  } catch (error) {
    return handleApiError(error)
  }
}
