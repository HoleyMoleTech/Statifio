import { createServerClient as createSupabaseClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  console.log(`[v0] Supabase server client - URL exists: ${!!url}`)
  console.log(`[v0] Supabase server client - Key exists: ${!!key}`)

  if (!url || !key) {
    console.warn("Missing Supabase environment variables for server client")
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

  const cookieStore = await cookies()

  return createSupabaseClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  })
}

export const getSupabaseClient = createClient
