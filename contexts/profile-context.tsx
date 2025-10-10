"use client"

import { createContext, useContext, useEffect, useState, useCallback, useMemo, type ReactNode } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/hooks/use-auth"

interface UserProfile {
  id: string
  email: string
  username: string
  first_name?: string
  last_name?: string
  avatar_url?: string
  favorite_sports: string[]
  is_admin?: boolean
  is_premium?: boolean
}

interface ProfileContextType {
  profile: UserProfile | null
  isLoading: boolean
  error: string | null
  refreshProfile: () => Promise<void>
  updateProfile: (updates: Partial<UserProfile>) => void
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined)

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { user, isLoading: authLoading } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastFetchedUserId, setLastFetchedUserId] = useState<string | null>(null)

  const supabase = createClient()

  const fetchProfile = useCallback(
    async (userId: string) => {
      if (lastFetchedUserId === userId) {
        console.log("[v0] ProfileContext - Using cached profile for user:", userId)
        setIsLoading(false)
        return
      }

      try {
        console.log("[v0] ProfileContext - Fetching profile for user:", userId)
        setError(null)

        const { data: profileData, error: profileError } = await supabase
          .from("users")
          .select("*")
          .eq("id", userId)
          .single()

        if (profileError) {
          console.error("[v0] ProfileContext - Profile fetch error:", profileError.message)
          if (profileError.code !== "PGRST116") {
            setError("Failed to load profile")
          }
        } else {
          console.log("[v0] ProfileContext - Profile loaded successfully")
          setProfile(profileData)
          setLastFetchedUserId(userId)
        }
      } catch (error) {
        console.error("[v0] ProfileContext - Unexpected error:", error)
        setError("An unexpected error occurred")
      } finally {
        setIsLoading(false)
      }
    },
    [lastFetchedUserId, supabase],
  )

  const refreshProfile = useCallback(async () => {
    if (!user?.id) return
    setIsLoading(true)
    setLastFetchedUserId(null)
    await fetchProfile(user.id)
  }, [user?.id, fetchProfile])

  const updateProfile = useCallback((updates: Partial<UserProfile>) => {
    setProfile((prev) => (prev ? { ...prev, ...updates } : null))
  }, [])

  useEffect(() => {
    if (!authLoading && user) {
      fetchProfile(user.id)
    } else if (!authLoading && !user) {
      setProfile(null)
      setLastFetchedUserId(null)
      setIsLoading(false)
    }
  }, [user, authLoading, fetchProfile])

  const contextValue = useMemo(
    () => ({
      profile,
      isLoading,
      error,
      refreshProfile,
      updateProfile,
    }),
    [profile, isLoading, error, refreshProfile, updateProfile],
  )

  return <ProfileContext.Provider value={contextValue}>{children}</ProfileContext.Provider>
}

export function useProfile() {
  const context = useContext(ProfileContext)
  if (context === undefined) {
    throw new Error("useProfile must be used within a ProfileProvider")
  }
  return context
}
