export function formatMatchDuration(beginAt: string, endAt?: string | null): string {
  const start = new Date(beginAt)
  const end = endAt ? new Date(endAt) : new Date()

  const diffMs = end.getTime() - start.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

  if (diffHours > 0) {
    return `${diffHours}h ${diffMinutes}m`
  }
  return `${diffMinutes}m`
}

export function formatMatchStatus(status: string): "Live" | "Finished" | "Upcoming" {
  switch (status) {
    case "running":
      return "Live"
    case "finished":
      return "Finished"
    case "not_started":
      return "Upcoming"
    default:
      return "Upcoming"
  }
}

export function calculateWinRate(wins: number, losses: number): number {
  const total = wins + losses
  return total > 0 ? Math.round((wins / total) * 100) : 0
}

export function formatPrizepool(prizepool: string | null): string {
  if (!prizepool) return "TBD"

  const amount = Number.parseInt(prizepool)
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`
  } else if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(0)}K`
  }
  return `$${amount}`
}

export function getGameDisplayName(slug: string): string {
  const gameNames: Record<string, string> = {
    lol: "League of Legends",
    csgo: "Counter-Strike: Global Offensive", // updated cs2 to csgo
    dota2: "Dota 2",
    valorant: "VALORANT",
    overwatch: "Overwatch 2",
  }
  return gameNames[slug] || slug.toUpperCase()
}

export function getGameColor(slug: string): string {
  const gameColors: Record<string, string> = {
    lol: "bg-blue-500",
    csgo: "bg-orange-500", // updated cs2 to csgo
    dota2: "bg-red-500",
    valorant: "bg-pink-500",
    overwatch: "bg-purple-500",
  }
  return gameColors[slug] || "bg-gray-500"
}

export function formatTeamName(name: string, maxLength = 20): string {
  return name.length > maxLength ? `${name.substring(0, maxLength)}...` : name
}

export function generateMockStats() {
  return {
    kills: Math.floor(Math.random() * 25) + 5,
    deaths: Math.floor(Math.random() * 15) + 2,
    assists: Math.floor(Math.random() * 20) + 3,
    kda: Number.parseFloat((Math.random() * 3 + 0.5).toFixed(2)),
  }
}

// Helper to safely get nested properties
export function safeGet<T>(obj: any, path: string, defaultValue: T): T {
  return path.split(".").reduce((current, key) => current?.[key], obj) ?? defaultValue
}
