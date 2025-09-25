import { NextResponse, type NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    })

    // Get match with team information
    const { data: match, error } = await supabase
      .from("matches")
      .select(`
        *,
        home_team:teams!matches_home_team_id_fkey(name, logo_url),
        away_team:teams!matches_away_team_id_fkey(name, logo_url)
      `)
      .eq("id", params.id)
      .single()

    if (error) {
      console.error("Error fetching match:", error)
      return NextResponse.json({ error: "Match not found" }, { status: 404 })
    }

    // Generate mock analytics data for demonstration
    const analytics = {
      duration: "42:15",
      total_kills: Math.floor(Math.random() * 50) + 20,
      total_deaths: Math.floor(Math.random() * 40) + 15,
      mvp_player: "Player" + Math.floor(Math.random() * 10 + 1),
      key_moments: [
        {
          time: "05:30",
          event: "First Blood",
          description: `${match.home_team.name} secures first kill`,
        },
        {
          time: "12:45",
          event: "Team Fight",
          description: "Major team fight in mid lane",
        },
        {
          time: "25:20",
          event: "Objective Secured",
          description: `${match.away_team.name} takes Baron`,
        },
        {
          time: "38:10",
          event: "Game Ending",
          description: "Final push to victory",
        },
      ],
    }

    const matchWithAnalytics = {
      ...match,
      analytics,
    }

    return NextResponse.json({ match: matchWithAnalytics })
  } catch (error) {
    console.error("Error in match detail API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
