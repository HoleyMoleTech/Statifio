"use client"

import type React from "react"

import { useAuth } from "@/hooks/use-auth"
import { AuthGuard } from "./auth-guard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Shield, Lock, UserX } from "lucide-react"
import Link from "next/link"

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAuth?: boolean
  requireAdmin?: boolean
  requirePremium?: boolean
  fallbackTitle?: string
  fallbackDescription?: string
}

export function ProtectedRoute({
  children,
  requireAuth = true,
  requireAdmin = false,
  requirePremium = false,
  fallbackTitle,
  fallbackDescription,
}: ProtectedRouteProps) {
  const { user } = useAuth()

  // Custom fallback for unauthenticated users
  const UnauthenticatedFallback = () => (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
            <UserX className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle>{fallbackTitle || "Authentication Required"}</CardTitle>
          <CardDescription>{fallbackDescription || "You need to sign in to access this page"}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button asChild className="w-full">
            <Link href="/auth/login">Sign In</Link>
          </Button>
          <Button asChild variant="outline" className="w-full bg-transparent">
            <Link href="/auth/signup">Create Account</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )

  // Custom fallback for admin-only content
  const AdminFallback = () => (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-warning/10 rounded-full flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 text-warning" />
          </div>
          <CardTitle>Admin Access Required</CardTitle>
          <CardDescription>This page is restricted to administrators only</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="outline" className="w-full bg-transparent">
            <Link href="/">Return Home</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )

  // Custom fallback for premium content
  const PremiumFallback = () => (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          <CardTitle>Premium Feature</CardTitle>
          <CardDescription>Upgrade to premium to access advanced analytics and features</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button asChild className="w-full">
            <Link href="/premium">Upgrade to Premium</Link>
          </Button>
          <Button asChild variant="outline" className="w-full bg-transparent">
            <Link href="/">Return Home</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )

  // Check premium status if required
  if (requirePremium && user) {
    const isPremium = user.user_metadata?.is_premium || false
    if (!isPremium) {
      return <PremiumFallback />
    }
  }

  return (
    <AuthGuard
      requireAuth={requireAuth}
      requireAdmin={requireAdmin}
      fallback={requireAdmin ? <AdminFallback /> : <UnauthenticatedFallback />}
    >
      {children}
    </AuthGuard>
  )
}
