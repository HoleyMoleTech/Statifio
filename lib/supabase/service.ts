import { createClient } from "@supabase/supabase-js"

/**
 * Service role client for system operations that bypass RLS
 * Use this for API data population, admin operations, etc.
 * DO NOT use this for user-facing operations
 */
export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  console.log(`[v0] Supabase service client - URL exists: ${!!url}`)
  console.log(`[v0] Supabase service client - Key exists: ${!!key}`)

  if (!url || !key) {
    console.warn("Missing Supabase environment variables for service client")
    return {
      auth: {
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      },
      from: () => ({
        select: () => ({
          eq: () => ({
            eq: () => ({
              gte: () => ({
                limit: () => Promise.resolve({ data: [], error: null }),
                order: () => ({
                  limit: () => Promise.resolve({ data: [], error: null }),
                }),
              }),
              order: () => ({
                limit: () => Promise.resolve({ data: [], error: null }),
              }),
              limit: () => Promise.resolve({ data: [], error: null }),
            }),
            gte: () => ({
              limit: () => Promise.resolve({ data: [], error: null }),
            }),
            in: () => Promise.resolve({ data: [], error: null }),
            order: () => ({
              limit: () => Promise.resolve({ data: [], error: null }),
            }),
            limit: () => Promise.resolve({ data: [], error: null }),
            single: () => Promise.resolve({ data: null, error: new Error("Supabase not configured") }),
          }),
          in: () => Promise.resolve({ data: [], error: null }),
          order: () => ({
            limit: () => Promise.resolve({ data: [], error: null }),
          }),
          limit: () => Promise.resolve({ data: [], error: null }),
        }),
        upsert: () => Promise.resolve({ data: null, error: new Error("Supabase not configured") }),
      }),
    } as any
  }

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
