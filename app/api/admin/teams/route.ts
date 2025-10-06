import { NextResponse, type NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function GET() {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    })

    // Get teams with player count
    const { data: teams, error } = await supabase
      .from("teams")
      .select(`
        *,
        players:players(count)
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching teams:", error)
      return NextResponse.json({ error: "Failed to fetch teams" }, { status: 500 })
    }

    // Transform the data to include player count
    const teamsWithPlayerCount =
      teams?.map((team) => ({
        ...team,
        player_count: team.players?.[0]?.count || 0,
      })) || []

    return NextResponse.json({ teams: teamsWithPlayerCount })
  } catch (error) {
    console.error("Error in teams API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    })

    const body = await request.json()
    const { name, sport_type, game_type, region, country, founded_year, description, website_url } = body

    if (!name || !sport_type) {
      return NextResponse.json({ error: "Name and sport type are required" }, { status: 400 })
    }

    const { data: team, error } = await supabase
      .from("teams")
      .insert({
        name,
        sport_type,
        game_type: sport_type === "esports" ? game_type : null,
        region,
        country,
        founded_year,
        description,
        website_url,
        logo_url: null, // Initialize with null, can be updated later
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating team:", error)
      return NextResponse.json({ error: "Failed to create team" }, { status: 500 })
    }

    return NextResponse.json({ team })
  } catch (error) {
    console.error("Error in create team API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
