"use client"

import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import type { User } from "@supabase/supabase-js"

interface UserProfile {
  id: string
  email: string
  username?: string
  first_name?: string
  last_name?: string
  avatar_url?: string
  is_premium: boolean
  is_admin: boolean
  favorite_sports?: string[]
  bio?: string
  created_at: string
  updated_at: string
}

interface AuthState {
  user: User | null
  profile: UserProfile | null
  isLoading: boolean
  isAuthenticated: boolean
  isPremium: boolean
  isAdmin: boolean
}

export function useAuth(): AuthState & {
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
} {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase.from("users").select("*").eq("id", userId).single()

      if (error) {
        console.error("[v0] Error fetching user profile:", error)
        return null
      }

      return data as UserProfile
    } catch (error) {
      console.error("[v0] Error in fetchUserProfile:", error)
      return null
    }
  }

  const refreshProfile = async () => {
    if (user) {
      const userProfile = await fetchUserProfile(user.id)
      setProfile(userProfile)
    }
  }

  const signOut = async () => {
    try {
      setIsLoading(true)
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error("[v0] Error signing out:", error)
      } else {
        setUser(null)
        setProfile(null)
        console.log("[v0] User signed out successfully")
      }
    } catch (error) {
      console.error("[v0] Error in signOut:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Get initial user
    const getUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        setUser(user)

        if (user) {
          const userProfile = await fetchUserProfile(user.id)
          setProfile(userProfile)
        }
      } catch (error) {
        console.error("[v0] Error getting initial user:", error)
      } finally {
        setIsLoading(false)
      }
    }

    getUser()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("[v0] Auth state changed:", event)

      setUser(session?.user ?? null)

      if (session?.user) {
        const userProfile = await fetchUserProfile(session.user.id)
        setProfile(userProfile)
      } else {
        setProfile(null)
      }

      setIsLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  return {
    user,
    profile,
    isLoading,
    isAuthenticated: !!user,
    isPremium: profile?.is_premium || false,
    isAdmin: profile?.is_admin || false,
    signOut,
    refreshProfile,
  }
}
