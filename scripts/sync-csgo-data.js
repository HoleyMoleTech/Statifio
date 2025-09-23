import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase environment variables")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// Mock CSGO data for testing (since we don't have API key)
const mockCSGOTeams = [
  {
    id: 1001,
    name: "Natus Vincere",
    slug: "natus-vincere",
    acronym: "NAVI",
    image_url: "https://cdn.pandascore.co/images/team/image/1001/navi.png",
    location: "UA",
    game: "csgo",
  },
  {
    id: 1002,
    name: "Astralis",
    slug: "astralis",
    acronym: "AST",
    image_url: "https://cdn.pandascore.co/images/team/image/1002/astralis.png",
    location: "DK",
    game: "csgo",
  },
  {
    id: 1003,
    name: "FaZe Clan",
    slug: "faze-clan",
    acronym: "FAZE",
    image_url: "https://cdn.pandascore.co/images/team/image/1003/faze.png",
    location: "US",
    game: "csgo",
  },
]

const mockCSGOMatches = [
  {
    id: 2001,
    name: "NAVI vs Astralis",
    slug: "navi-vs-astralis",
    status: "running",
    begin_at: new Date().toISOString(),
    end_at: null,
    game: "csgo",
    league_name: "ESL Pro League",
    team1_id: 1001,
    team1_name: "Natus Vincere",
    team2_id: 1002,
    team2_name: "Astralis",
  },
  {
    id: 2002,
    name: "FaZe vs NAVI",
    slug: "faze-vs-navi",
    status: "not_started",
    begin_at: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
    end_at: null,
    game: "csgo",
    league_name: "BLAST Premier",
    team1_id: 1003,
    team1_name: "FaZe Clan",
    team2_id: 1001,
    team2_name: "Natus Vincere",
  },
]

async function populateTeams() {
  console.log("🔍 Populating CSGO teams...")

  for (const team of mockCSGOTeams) {
    const { error } = await supabase.from("teams").upsert(
      {
        id: team.id,
        name: team.name,
        slug: team.slug,
        acronym: team.acronym,
        image_url: team.image_url,
        location: team.location,
        game: team.game,
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
  }
}

async function populateMatches() {
  console.log("🔍 Populating CSGO matches...")

  for (const match of mockCSGOMatches) {
    const { error } = await supabase.from("matches").upsert(
      {
        id: match.id,
        name: match.name,
        slug: match.slug,
        status: match.status,
        begin_at: match.begin_at,
        end_at: match.end_at,
        game: match.game,
        league_name: match.league_name,
        team1_id: match.team1_id,
        team1_name: match.team1_name,
        team2_id: match.team2_id,
        team2_name: match.team2_name,
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
  }
}

async function main() {
  console.log("🚀 Starting CSGO data sync...")

  await populateTeams()
  await populateMatches()

  console.log("✅ CSGO data sync completed!")
}

main().catch(console.error)
