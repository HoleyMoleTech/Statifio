import { createBrowserClient } from "@supabase/ssr"
import { supabaseConfig } from "@/lib/config/supabase"

export function createClient() {
  const url = supabaseConfig.url
  const key = supabaseConfig.anonKey

  console.log("[v0] Supabase client - URL exists:", !!url)
  console.log("[v0] Supabase client - Key exists:", !!key)

  if (!url || !key) {
    console.error("[v0] Missing Supabase environment variables for browser client")
    console.error("[v0] URL:", url || "undefined")
    console.error("[v0] Key:", key ? "exists" : "missing")
    throw new Error("Supabase not configured")
  }

  return createBrowserClient(url, key)
}
