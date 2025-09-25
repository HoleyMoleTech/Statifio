import { NextResponse } from "next/server"
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

    // Get matches with team information
    const { data: matches, error } = await supabase
      .from("matches")
      .select(`
        *,
        home_team:teams!matches_home_team_id_fkey(name, logo_url),
        away_team:teams!matches_away_team_id_fkey(name, logo_url)
      `)
      .order("match_date", { ascending: false })
      .limit(100)

    if (error) {
      console.error("Error fetching matches:", error)
      return NextResponse.json({ error: "Failed to fetch matches" }, { status: 500 })
    }

    return NextResponse.json({ matches: matches || [] })
  } catch (error) {
    console.error("Error in matches API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
