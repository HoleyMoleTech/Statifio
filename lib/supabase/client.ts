import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  console.log("[v0] createClient called")
  console.log("[v0] typeof process:", typeof process)
  console.log("[v0] typeof process.env:", typeof process?.env)
  console.log("[v0] All env keys:", process?.env ? Object.keys(process.env) : "no env")
  console.log("[v0] NEXT_PUBLIC_SUPABASE_URL:", process.env.NEXT_PUBLIC_SUPABASE_URL)
  console.log("[v0] NEXT_PUBLIC_SUPABASE_ANON_KEY:", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "exists" : "missing")

  // Try accessing without process.env
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  console.log("[v0] url value:", url)
  console.log("[v0] key value:", key ? "exists" : "missing")
  console.log("[v0] url type:", typeof url)
  console.log("[v0] key type:", typeof key)

  if (!url || !key) {
    console.error("[v0] Supabase not configured - missing environment variables")
    console.error("[v0] URL present:", !!url, "value:", url)
    console.error("[v0] Key present:", !!key)
    throw new Error("Supabase not configured")
  }

  console.log("[v0] Creating Supabase client with valid credentials")
  return createBrowserClient(url, key)
}
