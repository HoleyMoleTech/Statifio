const PANDASCORE_API_KEY = "diXgTnqQJJHQhk7n1mVzt4EaSEVBU1oMn6tYi9992YEsra4OkM4"
const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

async function fetchCSGOTeams() {
  console.log("🔍 Fetching CSGO teams from PandaScore...")

  try {
    const response = await fetch("https://api.pandascore.co/csgo/teams?per_page=10", {
      headers: {
        Authorization: `Bearer ${PANDASCORE_API_KEY}`,
        Accept: "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`)
    }

    const teams = await response.json()
    console.log(`✅ Successfully fetched ${teams.length} CSGO teams`)

    // Log first team for verification
    if (teams.length > 0) {
      console.log("📊 Sample team:", {
        id: teams[0].id,
        name: teams[0].name,
        location: teams[0].location,
        slug: teams[0].slug,
      })
    }

    return teams
  } catch (error) {
    console.error("❌ Error fetching teams:", error.message)
    throw error
  }
}

async function fetchCSGOMatches() {
  console.log("🔍 Fetching CSGO matches from PandaScore...")

  try {
    const response = await fetch("https://api.pandascore.co/csgo/matches/upcoming?per_page=10", {
      headers: {
        Authorization: `Bearer ${PANDASCORE_API_KEY}`,
        Accept: "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`)
    }

    const matches = await response.json()
    console.log(`✅ Successfully fetched ${matches.length} CSGO matches`)

    // Log first match for verification
    if (matches.length > 0) {
      console.log("📊 Sample match:", {
        id: matches[0].id,
        name: matches[0].name,
        status: matches[0].status,
        begin_at: matches[0].begin_at,
      })
    }

    return matches
  } catch (error) {
    console.error("❌ Error fetching matches:", error.message)
    throw error
  }
}

async function syncToSupabase(teams, matches) {
  console.log("💾 Syncing data to Supabase...")

  try {
    // Sync teams
    for (const team of teams.slice(0, 5)) {
      // Limit to 5 teams for testing
      const teamData = {
        external_id: team.id.toString(),
        name: team.name,
        slug: team.slug,
        location: team.location || null,
        acronym: team.acronym || null,
        image_url: team.image_url || null,
        game: "csgo",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const response = await fetch(`${SUPABASE_URL}/rest/v1/teams`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
          apikey: SUPABASE_SERVICE_KEY,
          "Content-Type": "application/json",
          Prefer: "resolution=merge-duplicates",
        },
        body: JSON.stringify(teamData),
      })

      if (response.ok) {
        console.log(`✅ Synced team: ${team.name}`)
      } else {
        console.log(`⚠️ Team ${team.name} may already exist or sync failed`)
      }
    }

    // Sync matches
    for (const match of matches.slice(0, 5)) {
      // Limit to 5 matches for testing
      const matchData = {
        external_id: match.id.toString(),
        name: match.name || "TBD vs TBD",
        status: match.status,
        begin_at: match.begin_at,
        game: "csgo",
        tournament_name: match.tournament?.name || null,
        league_name: match.league?.name || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const response = await fetch(`${SUPABASE_URL}/rest/v1/matches`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
          apikey: SUPABASE_SERVICE_KEY,
          "Content-Type": "application/json",
          Prefer: "resolution=merge-duplicates",
        },
        body: JSON.stringify(matchData),
      })

      if (response.ok) {
        console.log(`✅ Synced match: ${match.name || "TBD vs TBD"}`)
      } else {
        console.log(`⚠️ Match may already exist or sync failed`)
      }
    }

    console.log("🎉 Data sync completed successfully!")
  } catch (error) {
    console.error("❌ Error syncing to Supabase:", error.message)
    throw error
  }
}

async function main() {
  try {
    console.log("🚀 Starting CSGO data sync...")

    const teams = await fetchCSGOTeams()
    const matches = await fetchCSGOMatches()

    await syncToSupabase(teams, matches)

    console.log("✅ CSGO data sync completed successfully!")
  } catch (error) {
    console.error("❌ Sync failed:", error.message)
    process.exit(1)
  }
}

main()
