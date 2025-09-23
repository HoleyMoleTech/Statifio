// Direct database population script for CSGO data
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase environment variables")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

const PANDASCORE_API_KEY = process.env.PANDASCORE_API_KEY
const BASE_URL = "https://api.pandascore.co"

if (!PANDASCORE_API_KEY) {
  console.error("❌ Missing PANDASCORE_API_KEY environment variable")
  process.exit(1)
}

async function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function fetchWithRetry(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${PANDASCORE_API_KEY}`,
          Accept: "application/json",
        },
      })

      if (response.ok) {
        return await response.json()
      } else if (response.status === 429) {
        console.log(`⏳ Rate limited, waiting ${(i + 1) * 2} seconds...`)
        await delay((i + 1) * 2000)
        continue
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
    } catch (error) {
      if (i === retries - 1) throw error
      console.log(`⚠️ Attempt ${i + 1} failed, retrying...`)
      await delay(1000)
    }
  }
}

async function populateTeams() {
  console.log("🔍 Fetching CSGO teams...")

  try {
    const teams = await fetchWithRetry(`${BASE_URL}/csgo/teams?per_page=50`)
    console.log(`📊 Found ${teams.length} CSGO teams`)

    for (const team of teams) {
      const { error } = await supabase.from("teams").upsert(
        {
          id: team.id,
          name: team.name,
          slug: team.slug,
          acronym: team.acronym,
          image_url: team.image_url,
          location: team.location,
          game: "csgo",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "id",
        },
      )

      if (error) {
        console.error(`❌ Error inserting team ${team.name}:`, error)
      } else {
        console.log(`✅ Synced team: ${team.name}`)
      }

      await delay(100) // Rate limiting
    }
  } catch (error) {
    console.error("❌ Error fetching teams:", error)
  }
}

async function populateMatches() {
  console.log("🔍 Fetching CSGO matches...")

  try {
    // Fetch running matches
    const runningMatches = await fetchWithRetry(`${BASE_URL}/csgo/matches/running?per_page=50`)
    console.log(`📊 Found ${runningMatches.length} running CSGO matches`)

    // Fetch upcoming matches
    await delay(1000)
    const upcomingMatches = await fetchWithRetry(`${BASE_URL}/csgo/matches/upcoming?per_page=50`)
    console.log(`📊 Found ${upcomingMatches.length} upcoming CSGO matches`)

    const allMatches = [...runningMatches, ...upcomingMatches]

    for (const match of allMatches) {
      const { error } = await supabase.from("matches").upsert(
        {
          id: match.id,
          name: match.name,
          slug: match.slug,
          status: match.status,
          begin_at: match.begin_at,
          end_at: match.end_at,
          game: "csgo",
          league_id: match.league?.id,
          league_name: match.league?.name,
          serie_id: match.serie?.id,
          serie_name: match.serie?.name,
          tournament_id: match.tournament?.id,
          tournament_name: match.tournament?.name,
          team1_id: match.opponents?.[0]?.opponent?.id,
          team1_name: match.opponents?.[0]?.opponent?.name,
          team2_id: match.opponents?.[1]?.opponent?.id,
          team2_name: match.opponents?.[1]?.opponent?.name,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "id",
        },
      )

      if (error) {
        console.error(`❌ Error inserting match ${match.name}:`, error)
      } else {
        console.log(`✅ Synced match: ${match.name} (${match.status})`)
      }

      await delay(100) // Rate limiting
    }
  } catch (error) {
    console.error("❌ Error fetching matches:", error)
  }
}

async function main() {
  console.log("🚀 Starting CSGO data population...")

  await populateTeams()
  await delay(2000)
  await populateMatches()

  console.log("✅ CSGO data population completed!")
}

main().catch(console.error)
