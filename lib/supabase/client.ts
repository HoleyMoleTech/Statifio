import { createBrowserClient } from "@supabase/ssr"
import { supabaseConfig } from "@/lib/config/supabase"

let browserClient: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  if (browserClient) {
    return browserClient
  }

  browserClient = createBrowserClient(supabaseConfig.url, supabaseConfig.anonKey)
  return browserClient
}
