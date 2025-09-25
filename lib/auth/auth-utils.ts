import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import type { User } from "@supabase/supabase-js"

export async function getServerUser(): Promise<User | null> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error) {
      console.error("[v0] Error getting server user:", error)
      return null
    }

    return user
  } catch (error) {
    console.error("[v0] Error in getServerUser:", error)
    return null
  }
}

export async function requireAuth(redirectTo = "/auth/login"): Promise<User> {
  const user = await getServerUser()

  if (!user) {
    redirect(redirectTo)
  }

  return user
}

export async function requireAdmin(redirectTo = "/"): Promise<User> {
  const user = await requireAuth()

  try {
    const supabase = await createClient()
    const { data: profile, error } = await supabase.from("users").select("is_admin").eq("id", user.id).single()

    if (error || !profile?.is_admin) {
      redirect(redirectTo)
    }

    return user
  } catch (error) {
    console.error("[v0] Error checking admin status:", error)
    redirect(redirectTo)
  }
}

export async function requirePremium(redirectTo = "/premium"): Promise<User> {
  const user = await requireAuth()

  try {
    const supabase = await createClient()
    const { data: profile, error } = await supabase
      .from("users")
      .select("is_premium, is_admin")
      .eq("id", user.id)
      .single()

    if (error || (!profile?.is_premium && !profile?.is_admin)) {
      redirect(redirectTo)
    }

    return user
  } catch (error) {
    console.error("[v0] Error checking premium status:", error)
    redirect(redirectTo)
  }
}

export async function getUserProfile(userId: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.from("users").select("*").eq("id", userId).single()

    if (error) {
      console.error("[v0] Error fetching user profile:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("[v0] Error in getUserProfile:", error)
    return null
  }
}
