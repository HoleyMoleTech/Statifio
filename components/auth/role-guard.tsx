"use client"

import type React from "react"

import { useAuth } from "@/hooks/use-auth"
import { UserRole, hasRole } from "@/lib/auth/permissions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Shield, Lock, Crown } from "lucide-react"
import Link from "next/link"

interface RoleGuardProps {
  children: React.ReactNode
  requiredRole: UserRole
  fallback?: React.ReactNode
  showFallback?: boolean
}

export function RoleGuard({ children, requiredRole, fallback, showFallback = true }: RoleGuardProps) {
  const { user, profile, isLoading } = useAuth()

  if (isLoading) {
    return <div className="animate-pulse bg-muted h-32 rounded-lg" />
  }

  const userHasRole = hasRole(user, profile, requiredRole)

  if (!userHasRole) {
    if (fallback) {
      return <>{fallback}</>
    }

    if (!showFallback) {
      return null
    }

    // Default fallback based on required role
    const getFallbackContent = () => {
      switch (requiredRole) {
        case UserRole.ADMIN:
          return {
            icon: <Shield className="h-8 w-8 text-destructive" />,
            title: "Admin Access Required",
            description: "This feature is restricted to administrators only.",
            action: null,
          }
        case UserRole.PREMIUM:
          return {
            icon: <Crown className="h-8 w-8 text-primary" />,
            title: "Premium Feature",
            description: "Upgrade to premium to access this feature.",
            action: (
              <Button asChild>
                <Link href="/premium">Upgrade Now</Link>
              </Button>
            ),
          }
        case UserRole.USER:
          return {
            icon: <Lock className="h-8 w-8 text-muted-foreground" />,
            title: "Sign In Required",
            description: "You need to sign in to access this feature.",
            action: (
              <Button asChild>
                <Link href="/auth/login">Sign In</Link>
              </Button>
            ),
          }
        default:
          return {
            icon: <Lock className="h-8 w-8 text-muted-foreground" />,
            title: "Access Restricted",
            description: "You don't have permission to access this feature.",
            action: null,
          }
      }
    }

    const { icon, title, description, action } = getFallbackContent()

    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-4">{icon}</div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        {action && <CardContent className="text-center">{action}</CardContent>}
      </Card>
    )
  }

  return <>{children}</>
}
