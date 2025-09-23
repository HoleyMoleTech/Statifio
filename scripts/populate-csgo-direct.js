// Direct CSGO data population using Supabase REST API
const PANDASCORE_API_KEY = process.env.PANDASCORE_API_KEY
const PANDASCORE_BASE_URL = "https://api.pandascore.co"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("❌ Missing Supabase environment variables")
  process.exit(1)
}

if (!PANDASCORE_API_KEY) {
  console.error("❌ Missing PANDASCORE_API_KEY environment variable")
  process.exit(1)
}

async function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function fetchWithRetry(url, options = {}, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options)

      if (response.ok) {
        return await response.json()
      } else if (response.status === 429) {
        console.log(`⏳ Rate limited, waiting ${(i + 1) * 2} seconds...`)
        await delay((i + 1) * 2000)
        continue
      } else {
        const errorText = await response.text()
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }
    } catch (error) {
      if (i === retries - 1) throw error
      console.log(`⚠️ Attempt ${i + 1} failed, retrying...`)
      await delay(1000)
    }
  }
}

async function insertToSupabase(table, data) {
  const url = `${SUPABASE_URL}/rest/v1/${table}`

  return await fetchWithRetry(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
      apikey: SUPABASE_SERVICE_KEY,
      Prefer: "resolution=merge-duplicates",
    },
    body: JSON.stringify(data),
  })
}

async function populateTeams() {
  console.log("🔍 Fetching CSGO teams...")

  try {
    const teams = await fetchWithRetry(`${PANDASCORE_BASE_URL}/csgo/teams?per_page=20`, {
      headers: {
        Authorization: `Bearer ${PANDASCORE_API_KEY}`,
        Accept: "application/json",
      },
    })

    console.log(`📊 Found ${teams.length} CSGO teams`)

    for (const team of teams) {
      try {
        await insertToSupabase("teams", {
          id: team.id,
          name: team.name,
          slug: team.slug,
          acronym: team.acronym,
          image_url: team.image_url,
          location: team.location,
          game: "csgo",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })

        console.log(`✅ Synced team: ${team.name}`)
      } catch (error) {
        console.error(`❌ Error inserting team ${team.name}:`, error.message)
      }

      await delay(200) // Rate limiting
    }
  } catch (error) {
    console.error("❌ Error fetching teams:", error.message)
  }
}

async function populateMatches() {
  console.log("🔍 Fetching CSGO matches...")

  try {
    // Fetch running matches
    const runningMatches = await fetchWithRetry(`${PANDASCORE_BASE_URL}/csgo/matches/running?per_page=10`, {
      headers: {
        Authorization: `Bearer ${PANDASCORE_API_KEY}`,
        Accept: "application/json",
      },
    })

    console.log(`📊 Found ${runningMatches.length} running CSGO matches`)

    // Fetch upcoming matches
    await delay(1000)
    const upcomingMatches = await fetchWithRetry(`${PANDASCORE_BASE_URL}/csgo/matches/upcoming?per_page=10`, {
      headers: {
        Authorization: `Bearer ${PANDASCORE_API_KEY}`,
        Accept: "application/json",
      },
    })

    console.log(`📊 Found ${upcomingMatches.length} upcoming CSGO matches`)

    const allMatches = [...runningMatches, ...upcomingMatches]

    for (const match of allMatches) {
      try {
        await insertToSupabase("matches", {
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
        })

        console.log(`✅ Synced match: ${match.name} (${match.status})`)
      } catch (error) {
        console.error(`❌ Error inserting match ${match.name}:`, error.message)
      }

      await delay(200) // Rate limiting
    }
  } catch (error) {
    console.error("❌ Error fetching matches:", error.message)
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
