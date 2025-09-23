import { createClient } from "@supabase/supabase-js"

/**
 * Service role client for system operations that bypass RLS
 * Use this for API data population, admin operations, etc.
 * DO NOT use this for user-facing operations
 */
export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error("Missing Supabase environment variables for service client")
  }

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
