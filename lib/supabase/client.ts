import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  console.log("[v0] createClient called")
  console.log("[v0] NEXT_PUBLIC_SUPABASE_URL:", process.env.NEXT_PUBLIC_SUPABASE_URL)
  console.log("[v0] NEXT_PUBLIC_SUPABASE_ANON_KEY:", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "exists" : "missing")

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    console.error("[v0] Supabase not configured - missing environment variables")
    console.error("[v0] URL present:", !!url)
    console.error("[v0] Key present:", !!key)
    throw new Error("Supabase not configured")
  }

  console.log("[v0] Creating Supabase client with valid credentials")
  return createBrowserClient(url, key)
}
