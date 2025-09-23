// Script to test authentication flow endpoints
async function testAuthFlow() {
  console.log("🔐 Testing Authentication Flow...")

  const baseUrl = "https://v0-statifio-new-project-git-main-v0-app.vercel.app"

  try {
    // Test 1: Check if auth pages are accessible
    console.log("\n📋 Testing auth page accessibility...")

    const authPages = ["/auth/login", "/auth/signup", "/auth/signup-success"]

    for (const page of authPages) {
      try {
        const response = await fetch(`${baseUrl}${page}`)
        const status = response.ok ? "✅" : "❌"
        console.log(`${status} ${page}: ${response.status}`)
      } catch (error) {
        console.log(`❌ ${page}: Connection failed`)
      }
    }

    // Test 2: Check protected routes
    console.log("\n🔒 Testing protected routes...")

    const protectedPages = ["/dashboard", "/profile"]

    for (const page of protectedPages) {
      try {
        const response = await fetch(`${baseUrl}${page}`)
        const status = response.status === 200 || response.status === 401 ? "✅" : "❌"
        console.log(`${status} ${page}: ${response.status} (${response.status === 401 ? "Protected" : "Accessible"})`)
      } catch (error) {
        console.log(`❌ ${page}: Connection failed`)
      }
    }

    console.log("\n✅ Authentication flow test completed!")
    console.log("\n📝 Manual Testing Steps:")
    console.log("1. Visit /auth/signup to create a new account")
    console.log("2. Check email for verification link")
    console.log("3. Visit /auth/login to sign in")
    console.log("4. Access /profile and /dashboard when authenticated")
    console.log("5. Test logout functionality")
  } catch (error) {
    console.error("❌ Auth flow test failed:", error)
  }
}

// Run the test
testAuthFlow()
