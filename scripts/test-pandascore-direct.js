// Direct test of PandaScore API without TypeScript imports
const PANDASCORE_BASE_URL = "https://api.pandascore.co"
const API_TOKEN = "diXgTnqQJJHQhk7n1mVzt4EaSEVBU1oMn6tYi9992YEsra4OkM4"

async function testPandaScoreAPI() {
  console.log("🔍 Testing PandaScore API connection...")

  try {
    // Test basic API connection
    const response = await fetch(`${PANDASCORE_BASE_URL}/videogames`, {
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
        Accept: "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }

    const videogames = await response.json()
    console.log("✅ API connection successful!")
    console.log(`📊 Found ${videogames.length} videogames`)

    // Test CSGO specifically
    console.log("\n🎮 Testing CSGO endpoints...")

    const csgoTests = [
      { name: "CSGO Teams", endpoint: "/csgo/teams" },
      { name: "CSGO Upcoming Matches", endpoint: "/csgo/matches/upcoming" },
      { name: "CSGO Running Matches", endpoint: "/csgo/matches/running" },
    ]

    for (const test of csgoTests) {
      try {
        const testResponse = await fetch(`${PANDASCORE_BASE_URL}${test.endpoint}?per_page=5`, {
          headers: {
            Authorization: `Bearer ${API_TOKEN}`,
            Accept: "application/json",
          },
        })

        if (testResponse.ok) {
          const data = await testResponse.json()
          console.log(`✅ ${test.name}: ${data.length} items found`)
        } else {
          console.log(`❌ ${test.name}: ${testResponse.status} ${testResponse.statusText}`)
        }
      } catch (error) {
        console.log(`❌ ${test.name}: ${error.message}`)
      }

      // Rate limiting delay
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }
  } catch (error) {
    console.error("❌ API test failed:", error.message)
    console.error("Full error:", error)
  }
}
;(async () => {
  try {
    await testPandaScoreAPI()
  } catch (error) {
    console.error("Script execution failed:", error)
    process.exit(1)
  }
})()
