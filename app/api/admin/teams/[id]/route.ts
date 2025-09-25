import { NextResponse, type NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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
      .update({
        name,
        sport_type,
        game_type: sport_type === "esports" ? game_type : null,
        region,
        country,
        founded_year,
        description,
        website_url,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)
      .select()
      .single()

    if (error) {
      console.error("Error updating team:", error)
      return NextResponse.json({ error: "Failed to update team" }, { status: 500 })
    }

    return NextResponse.json({ team })
  } catch (error) {
    console.error("Error in update team API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    })

    // First, check if team has players
    const { data: players, error: playersError } = await supabase.from("players").select("id").eq("team_id", params.id)

    if (playersError) {
      console.error("Error checking team players:", playersError)
      return NextResponse.json({ error: "Failed to check team players" }, { status: 500 })
    }

    if (players && players.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete team with active players. Remove players first." },
        { status: 400 },
      )
    }

    const { error } = await supabase.from("teams").delete().eq("id", params.id)

    if (error) {
      console.error("Error deleting team:", error)
      return NextResponse.json({ error: "Failed to delete team" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in delete team API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
