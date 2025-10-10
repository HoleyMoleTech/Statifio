export type GameType = "lol" | "cs2" | "dota2"
export type SportType = "esports"

export interface Team {
  id: number
  name: string
  acronym?: string
  image_url?: string
  location?: string
}

export interface Match {
  id: number
  name: string
  status: "not_started" | "running" | "finished"
  begin_at: string
  end_at?: string
  tournament: {
    id: number
    name: string
  }
  league: {
    id: number
    name: string
    image_url?: string
  }
  serie: {
    id: number
    name: string
  }
  opponents: Array<{
    opponent: Team
    type: string
  }>
  results?: Array<{
    team_id: number
    score: number
  }>
  games?: Array<{
    id: number
    status: string
    begin_at: string
    end_at?: string
    winner?: {
      id: number
      type: string
    }
  }>
  streams_list?: Array<{
    embed_url: string
    language: string
    main: boolean
    official: boolean
    raw_url: string
  }>
}

export interface Tournament {
  id: number
  name: string
  slug: string
  begin_at: string
  end_at?: string
  league: {
    id: number
    name: string
    image_url?: string
  }
  serie: {
    id: number
    name: string
  }
  tier?: string
  prizepool?: string
  winner_id?: number
  winner_type?: string
}

export interface Player {
  id: number
  name: string
  first_name?: string
  last_name?: string
  slug: string
  image_url?: string
  nationality?: string
  age?: number
  current_team?: Team
  role?: string
}

export interface TeamStats {
  team: Team
  games_count: number
  wins: number
  losses: number
  win_rate: number
}
