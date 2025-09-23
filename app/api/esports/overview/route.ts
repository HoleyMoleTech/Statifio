import { pandaScoreAPI } from "@/lib/api/pandascore"
import { cacheManager } from "@/lib/services/cache-manager"
import { databaseService } from "@/lib/services/database-service"
import { ApiResponseBuilder } from "@/lib/utils/api-response"
import { performanceMonitor } from "@/lib/utils/performance-monitor"
import { resourceMonitor } from "@/lib/utils/resource-monitor"

export async function GET() {
  const requestId = performanceMonitor.startRequest("/api/esports/overview", "GET")
  const startTime = Date.now()

  try {
    const cacheKey = "esports-overview"
    const cachedData = cacheManager.get(cacheKey)

    if (cachedData) {
      console.log("[API] Returning cached overview data")
      resourceMonitor.trackCacheHit()
      performanceMonitor.endRequest(requestId, 200, undefined, true)

      return ApiResponseBuilder.success(cachedData, {
        cached: true,
        source: "cache",
        rateLimit: resourceMonitor.getRateLimitInfo(),
      })
    }

    resourceMonitor.trackCacheMiss()

    const games = ["lol", "csgo", "dota2"]
    const freshDataAvailable = await Promise.all(games.map((game) => databaseService.isDataFresh("teams", game, 30)))

    const [lolLive, csgoLive, dota2Live] = await Promise.all([
      pandaScoreAPI.getRunningMatches("lol").catch(() => []),
      pandaScoreAPI.getRunningMatches("csgo").catch(() => []),
      pandaScoreAPI.getRunningMatches("dota2").catch(() => []),
    ])

    if (freshDataAvailable.every((fresh) => fresh)) {
      console.log("[API] Building overview from fresh database data")

      const [lolTeams, csgoTeams, dota2Teams] = await Promise.all([
        databaseService.getTeamsByGame("lol"),
        databaseService.getTeamsByGame("csgo"),
        databaseService.getTeamsByGame("dota2"),
      ])

      const [lolMatches, csgoMatches, dota2Matches] = await Promise.all([
        databaseService.getMatchesByGame("lol", "esports", 5),
        databaseService.getMatchesByGame("csgo", "esports", 5),
        databaseService.getMatchesByGame("dota2", "esports", 5),
      ])

      const overview = {
        games: [
          {
            id: "lol",
            name: "League of Legends",
            shortName: "LoL",
            color: "bg-blue-500",
            stats: {
              activeMatches: lolLive.length,
              totalPlayers: lolTeams.length * 5,
              tournaments: Math.floor(lolMatches.length / 5),
              avgViewers: "2.4M",
            },
          },
          {
            id: "csgo",
            name: "Counter-Strike: Global Offensive",
            shortName: "CS:GO",
            color: "bg-orange-500",
            stats: {
              activeMatches: csgoLive.length,
              totalPlayers: csgoTeams.length * 5,
              tournaments: Math.floor(csgoMatches.length / 5),
              avgViewers: "1.8M",
            },
          },
          {
            id: "dota2",
            name: "Dota 2",
            shortName: "Dota 2",
            color: "bg-red-500",
            stats: {
              activeMatches: dota2Live.length,
              totalPlayers: dota2Teams.length * 5,
              tournaments: Math.floor(dota2Matches.length / 5),
              avgViewers: "1.2M",
            },
          },
        ],
        liveMatches: [...lolLive, ...csgoLive, ...dota2Live].slice(0, 10).map((match) => ({
          id: match.id,
          date: match.begin_at,
          status: "running",
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
        })),
        totalLiveMatches: lolLive.length + csgoLive.length + dota2Live.length,
        metadata: {
          fetchedAt: new Date().toISOString(),
          apiCallsUsed: 3, // Updated API calls count for live matches
          cached: false,
          source: "database+pandascore",
        },
      }

      cacheManager.set(cacheKey, overview, "overview")

      const responseTime = Date.now() - startTime
      resourceMonitor.trackRequest(responseTime)
      performanceMonitor.endRequest(requestId, 200, undefined, false, 3)

      return ApiResponseBuilder.success(overview, {
        cached: false,
        source: "database+pandascore",
        rateLimit: resourceMonitor.getRateLimitInfo(),
      })
    }

    console.log("[API] Fetching fresh overview data from PandaScore")

    // Fetch data from multiple games in parallel with reduced batch sizes
    const [lolTeams, csgoTeams, dota2Teams, lolMatches, csgoMatches, dota2Matches] = await Promise.all([
      pandaScoreAPI.getTeams("lol", 1, 5).catch(() => []),
      pandaScoreAPI.getTeams("csgo", 1, 5).catch(() => []),
      pandaScoreAPI.getTeams("dota2", 1, 5).catch(() => []),
      pandaScoreAPI.getUpcomingMatches("lol", 1, 3).catch(() => []),
      pandaScoreAPI.getUpcomingMatches("csgo", 1, 3).catch(() => []),
      pandaScoreAPI.getUpcomingMatches("dota2", 1, 3).catch(() => []),
    ])

    const teamsInMatches = new Set<string>()
    const teamDataMap = new Map<string, any>()

    // Collect all teams from matches
    const allMatches = [...lolMatches, ...csgoMatches, ...dota2Matches]
    allMatches.forEach((match) => {
      if (match.opponents?.[0]?.opponent) {
        const teamId = match.opponents[0].opponent.id?.toString()
        if (teamId) {
          teamsInMatches.add(teamId)
          teamDataMap.set(teamId, { ...match.opponents[0].opponent, game_type: match.videogame?.slug || "unknown" })
        }
      }
      if (match.opponents?.[1]?.opponent) {
        const teamId = match.opponents[1].opponent.id?.toString()
        if (teamId) {
          teamsInMatches.add(teamId)
          teamDataMap.set(teamId, { ...match.opponents[1].opponent, game_type: match.videogame?.slug || "unknown" })
        }
      }
    })

    console.log(`[v0] Found ${teamsInMatches.size} unique team IDs from matches`)

    // Combine top teams with match teams
    const allTeams = [
      ...lolTeams.map((team) => databaseService.transformTeamData(team, "lol")),
      ...csgoTeams.map((team) => databaseService.transformTeamData(team, "csgo")),
      ...dota2Teams.map((team) => databaseService.transformTeamData(team, "dota2")),
      ...Array.from(teamDataMap.values())
        .map((team) => {
          const gameType = team.game_type === "cs2" ? "csgo" : team.game_type // Map cs2 to csgo
          return databaseService.transformTeamData(team, gameType)
        })
        .filter((team) => team.game_type !== "unknown"),
    ]

    // Remove duplicates based on external_id and game_type
    const uniqueTeams = allTeams.filter(
      (team, index, self) =>
        index === self.findIndex((t) => t.external_id === team.external_id && t.game_type === team.game_type),
    )

    console.log(`[v0] Total unique teams to save: ${uniqueTeams.length}`)

    if (uniqueTeams.length > 0) {
      await databaseService.saveTeams(uniqueTeams)
      console.log(`[API] Saved ${uniqueTeams.length} teams to database`)
    }

    const transformedMatches = allMatches
      .map((match) => {
        const gameType = match.videogame?.slug === "cs2" ? "csgo" : match.videogame?.slug || "unknown"
        return databaseService.transformMatchData(match, gameType)
      })
      .filter((match) => match.game_type !== "unknown")

    if (transformedMatches.length > 0) {
      await databaseService.saveMatches(transformedMatches)
      console.log(`[API] Attempted to save ${transformedMatches.length} matches to database`)
    }

    const liveMatches = [...lolLive, ...csgoLive, ...dota2Live]

    const overview = {
      games: [
        {
          id: "lol",
          name: "League of Legends",
          shortName: "LoL",
          color: "bg-blue-500",
          stats: {
            activeMatches: lolLive.length,
            totalPlayers: lolTeams.length * 5,
            tournaments: Math.floor(lolMatches.length / 5),
            avgViewers: "2.4M",
          },
        },
        {
          id: "csgo",
          name: "Counter-Strike: Global Offensive",
          shortName: "CS:GO",
          color: "bg-orange-500",
          stats: {
            activeMatches: csgoLive.length,
            totalPlayers: csgoTeams.length * 5,
            tournaments: Math.floor(csgoMatches.length / 5),
            avgViewers: "1.8M",
          },
        },
        {
          id: "dota2",
          name: "Dota 2",
          shortName: "Dota 2",
          color: "bg-red-500",
          stats: {
            activeMatches: dota2Live.length,
            totalPlayers: dota2Teams.length * 5,
            tournaments: Math.floor(dota2Matches.length / 5),
            avgViewers: "1.2M",
          },
        },
      ],
      liveMatches: liveMatches.map((match) => ({
        id: match.id,
        date: match.begin_at,
        status: "running",
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
      })),
      totalLiveMatches: liveMatches.length,
      metadata: {
        fetchedAt: new Date().toISOString(),
        apiCallsUsed: 9,
        cached: false,
        source: "pandascore",
      },
    }

    cacheManager.set(cacheKey, overview, "overview")

    const responseTime = Date.now() - startTime
    resourceMonitor.trackRequest(responseTime)
    performanceMonitor.endRequest(requestId, 200, undefined, false, 9)

    return ApiResponseBuilder.success(overview, {
      cached: false,
      source: "pandascore",
      apiCallsUsed: 9,
      rateLimit: resourceMonitor.getRateLimitInfo(),
    })
  } catch (error) {
    console.error("Error fetching esports overview:", error)

    const responseTime = Date.now() - startTime
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    resourceMonitor.trackRequest(responseTime, true)
    performanceMonitor.endRequest(requestId, 500, errorMessage)

    return ApiResponseBuilder.error("Failed to fetch esports data", 500, "FETCH_ERROR")
  }
}
