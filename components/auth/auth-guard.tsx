"use client"

import type React from "react"

import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { LoadingStates } from "@/components/ui/loading-states"

interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
  requireAdmin?: boolean
  redirectTo?: string
  fallback?: React.ReactNode
}

export function AuthGuard({
  children,
  requireAuth = true,
  requireAdmin = false,
  redirectTo = "/auth/login",
  fallback,
}: AuthGuardProps) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (requireAuth && !user) {
        console.log("[v0] AuthGuard: User not authenticated, redirecting to", redirectTo)
        router.push(redirectTo)
        return
      }

      if (requireAdmin && user) {
        // Check if user is admin (we'll need to fetch this from the database)
        // For now, we'll assume admin status is in user metadata
        const isAdmin = user.user_metadata?.is_admin || false
        if (!isAdmin) {
          console.log("[v0] AuthGuard: User not admin, redirecting to /")
          router.push("/")
          return
        }
      }
    }
  }, [user, isLoading, requireAuth, requireAdmin, redirectTo, router])

  if (isLoading) {
    return fallback || <LoadingStates.FullPage message="Checking authentication..." />
  }

  if (requireAuth && !user) {
    return fallback || <LoadingStates.FullPage message="Redirecting to login..." />
  }

  if (requireAdmin && user) {
    const isAdmin = user.user_metadata?.is_admin || false
    if (!isAdmin) {
      return fallback || <LoadingStates.FullPage message="Access denied. Redirecting..." />
    }
  }

  return <>{children}</>
}
