import { pandaScoreAPI } from "@/lib/api/pandascore"
import { databaseService } from "@/lib/services/database-service"
import { cacheManager } from "@/lib/services/cache-manager"
import { ApiResponseBuilder } from "@/lib/utils/api-response"
import { RequestValidator, parseSearchParams } from "@/lib/utils/request-validator"
import { performanceMonitor } from "@/lib/utils/performance-monitor"
import { resourceMonitor } from "@/lib/utils/resource-monitor"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { game: string } }) {
  const requestId = performanceMonitor.startRequest(`/api/esports/matches/${params.game}`, "GET")
  const startTime = Date.now()

  try {
    const { game } = params
    const searchParams = parseSearchParams(request)

    const validation = RequestValidator.create()
      .validateGameParam(game)
      .validatePagination(searchParams.page, searchParams.limit)
      .getResult()

    if (!validation.isValid) {
      performanceMonitor.endRequest(requestId, 400, "Validation failed")
      return ApiResponseBuilder.validationError(validation.errors)
    }

    const limit = Number.parseInt(searchParams.limit || "10")
    const cacheKey = `matches-${game}-${limit}`
    const cachedData = cacheManager.get(cacheKey)

    if (cachedData) {
      console.log(`[API] Returning cached matches data for ${game}`)
      resourceMonitor.trackCacheHit()
      performanceMonitor.endRequest(requestId, 200, undefined, true)

      return ApiResponseBuilder.success(cachedData, {
        cached: true,
        source: "cache",
        rateLimit: resourceMonitor.getRateLimitInfo(),
      })
    }

    resourceMonitor.trackCacheMiss()

    const isDataFresh = await databaseService.isDataFresh("matches", game, 15) // 15 minutes for matches

    if (isDataFresh) {
      console.log(`[API] Returning fresh database matches data for ${game}`)
      const dbMatches = await databaseService.getMatchesByGame(game, "esports", limit)

      if (dbMatches.length > 0) {
        const matchResults = dbMatches.map((match) => ({
          id: match.external_id,
          date: match.match_date,
          status: match.status === "finished" ? "finished" : match.status === "running" ? "running" : "upcoming",
          teams: {
            team1: {
              name: match.home_team?.name || "TBD",
              acronym: match.home_team?.name?.substring(0, 3).toUpperCase() || "TBD",
              image_url: match.home_team?.logo_url || "/abstract-team-logo.png",
              score: match.home_score,
            },
            team2: {
              name: match.away_team?.name || "TBD",
              acronym: match.away_team?.name?.substring(0, 3).toUpperCase() || "TBD",
              image_url: match.away_team?.logo_url || "/abstract-team-logo.png",
              score: match.away_score,
            },
          },
          tournament: {
            name: match.tournament_name || "Unknown Tournament",
            league: match.tournament_name || "Unknown League",
          },
          videogame: game,
        }))

        cacheManager.set(cacheKey, matchResults, "matches")

        const responseTime = Date.now() - startTime
        resourceMonitor.trackRequest(responseTime)
        performanceMonitor.endRequest(requestId, 200, undefined, false, 0)

        return ApiResponseBuilder.success(matchResults, {
          cached: false,
          source: "database",
          rateLimit: resourceMonitor.getRateLimitInfo(),
        })
      }
    }

    console.log(`[API] Fetching fresh matches data from PandaScore for ${game}`)
    const matches = await pandaScoreAPI.getMatches(game, 1, limit)

    if (matches.length > 0) {
      const teamsInMatches = new Set<string>()
      const teamDataMap = new Map<string, any>()

      matches.forEach((match) => {
        if (match.opponents?.[0]?.opponent) {
          const teamId = match.opponents[0].opponent.id?.toString()
          if (teamId) {
            teamsInMatches.add(teamId)
            teamDataMap.set(teamId, match.opponents[0].opponent)
          }
        }
        if (match.opponents?.[1]?.opponent) {
          const teamId = match.opponents[1].opponent.id?.toString()
          if (teamId) {
            teamsInMatches.add(teamId)
            teamDataMap.set(teamId, match.opponents[1].opponent)
          }
        }
      })

      console.log(`[v0] Found ${teamsInMatches.size} unique team IDs from matches`)

      // Get existing teams from database to avoid duplicates
      const existingTeams = await databaseService.getTeamsByExternalIds(Array.from(teamsInMatches), game)
      const existingTeamIds = new Set(existingTeams.map((team) => team.external_id))

      console.log(`[v0] Fetched ${existingTeams.length} teams referenced in matches`)

      // Save only new teams
      const newTeamIds = Array.from(teamsInMatches).filter((id) => !existingTeamIds.has(id))
      if (newTeamIds.length > 0) {
        const newTeamData = newTeamIds.map((teamId) => {
          const teamInfo = teamDataMap.get(teamId)
          return databaseService.transformTeamData(teamInfo, game)
        })

        await databaseService.saveTeams(newTeamData)
        console.log(`[v0] Saved ${newTeamData.length} new teams to database`)
      }

      console.log(`[v0] Total unique teams to save: ${teamsInMatches.size}`)

      // Now save matches - team IDs should resolve properly
      const matchData = matches.map((match) => databaseService.transformMatchData(match, game))
      await databaseService.saveMatches(matchData)
      console.log(`[API] Saved ${matchData.length} matches to database`)
    }

    const matchResults = matches.map((match) => ({
      id: match.id,
      date: match.begin_at,
      status: match.status === "finished" ? "finished" : match.status === "running" ? "running" : "upcoming",
      teams: {
        team1: {
          name: match.opponents[0]?.opponent.name || "TBD",
          acronym: match.opponents[0]?.opponent.acronym || "TBD",
          image_url: match.opponents[0]?.opponent.image_url || "/abstract-team-logo.png",
          score: match.results.find((r) => r.team_id === match.opponents[0]?.opponent.id)?.score,
        },
        team2: {
          name: match.opponents[1]?.opponent.name || "TBD",
          acronym: match.opponents[1]?.opponent.acronym || "TBD",
          image_url: match.opponents[1]?.opponent.image_url || "/abstract-team-logo.png",
          score: match.results.find((r) => r.team_id === match.opponents[1]?.opponent.id)?.score,
        },
      },
      tournament: {
        name: match.tournament.name,
        league: match.league.name,
      },
      videogame: match.videogame.name,
    }))

    cacheManager.set(cacheKey, matchResults, "matches")

    const responseTime = Date.now() - startTime
    resourceMonitor.trackRequest(responseTime)
    performanceMonitor.endRequest(requestId, 200, undefined, false, 1)

    return ApiResponseBuilder.success(matchResults, {
      cached: false,
      source: "pandascore",
      apiCallsUsed: 1,
      rateLimit: resourceMonitor.getRateLimitInfo(),
    })
  } catch (error) {
    console.error(`Error fetching matches for ${params.game}:`, error)

    const responseTime = Date.now() - startTime
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    resourceMonitor.trackRequest(responseTime, true)
    performanceMonitor.endRequest(requestId, 500, errorMessage)

    return ApiResponseBuilder.error("Failed to fetch matches data", 500, "FETCH_ERROR")
  }
}
