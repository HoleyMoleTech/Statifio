import type { GameType, Match, Tournament, Team, Player } from "./types"

const PANDASCORE_API_URL = "https://api.pandascore.co"
const PANDASCORE_API_KEY = process.env.PANDASCORE_API_KEY || ""

interface PandaScoreRequestOptions {
  endpoint: string
  params?: Record<string, string | number | boolean>
}

async function pandascoreRequest<T>({ endpoint, params = {} }: PandaScoreRequestOptions): Promise<T> {
  const url = new URL(`${PANDASCORE_API_URL}${endpoint}`)

  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, String(value))
  })

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${PANDASCORE_API_KEY}`,
      Accept: "application/json",
    },
    next: { revalidate: 60 }, // Cache for 1 minute
  })

  if (!response.ok) {
    throw new Error(`PandaScore API error: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

export async function getLiveMatches(game?: GameType): Promise<Match[]> {
  const endpoint = game ? `/${game}/matches/running` : "/matches/running"
  return pandascoreRequest<Match[]>({
    endpoint,
    params: { per_page: 20 },
  })
}

export async function getUpcomingMatches(game?: GameType): Promise<Match[]> {
  const endpoint = game ? `/${game}/matches/upcoming` : "/matches/upcoming"
  return pandascoreRequest<Match[]>({
    endpoint,
    params: { per_page: 20 },
  })
}

export async function getPastMatches(game?: GameType): Promise<Match[]> {
  const endpoint = game ? `/${game}/matches/past` : "/matches/past"
  return pandascoreRequest<Match[]>({
    endpoint,
    params: { per_page: 20 },
  })
}

export async function getMatchById(game: GameType, matchId: number): Promise<Match> {
  return pandascoreRequest<Match>({
    endpoint: `/${game}/matches/${matchId}`,
  })
}

export async function getTournaments(game: GameType): Promise<Tournament[]> {
  return pandascoreRequest<Tournament[]>({
    endpoint: `/${game}/tournaments`,
    params: { per_page: 20 },
  })
}

export async function getTeams(game: GameType): Promise<Team[]> {
  return pandascoreRequest<Team[]>({
    endpoint: `/${game}/teams`,
    params: { per_page: 50 },
  })
}

export async function getTeamById(game: GameType, teamId: number): Promise<Team> {
  return pandascoreRequest<Team>({
    endpoint: `/${game}/teams/${teamId}`,
  })
}

export async function getPlayers(game: GameType): Promise<Player[]> {
  return pandascoreRequest<Player[]>({
    endpoint: `/${game}/players`,
    params: { per_page: 50 },
  })
}
