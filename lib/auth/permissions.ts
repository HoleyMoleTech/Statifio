import type { User } from "@supabase/supabase-js"

export interface UserPermissions {
  canViewAnalytics: boolean
  canManageTeams: boolean
  canAccessPremiumFeatures: boolean
  canModerateContent: boolean
  canManageUsers: boolean
  canAccessAdminPanel: boolean
  canMakePredictions: boolean
  canExportData: boolean
}

export function getUserPermissions(user: User | null, profile: any): UserPermissions {
  if (!user || !profile) {
    return {
      canViewAnalytics: false,
      canManageTeams: false,
      canAccessPremiumFeatures: false,
      canModerateContent: false,
      canManageUsers: false,
      canAccessAdminPanel: false,
      canMakePredictions: false,
      canExportData: false,
    }
  }

  const isAdmin = profile.is_admin || false
  const isPremium = profile.is_premium || false
  const isAuthenticated = !!user

  return {
    canViewAnalytics: isAuthenticated,
    canManageTeams: isAdmin,
    canAccessPremiumFeatures: isPremium || isAdmin,
    canModerateContent: isAdmin,
    canManageUsers: isAdmin,
    canAccessAdminPanel: isAdmin,
    canMakePredictions: isAuthenticated,
    canExportData: isPremium || isAdmin,
  }
}

export function hasPermission(user: User | null, profile: any, permission: keyof UserPermissions): boolean {
  const permissions = getUserPermissions(user, profile)
  return permissions[permission]
}

// Role-based access control
export enum UserRole {
  GUEST = "guest",
  USER = "user",
  PREMIUM = "premium",
  MODERATOR = "moderator",
  ADMIN = "admin",
}

export function getUserRole(user: User | null, profile: any): UserRole {
  if (!user || !profile) return UserRole.GUEST

  if (profile.is_admin) return UserRole.ADMIN
  if (profile.is_moderator) return UserRole.MODERATOR
  if (profile.is_premium) return UserRole.PREMIUM

  return UserRole.USER
}

export function hasRole(user: User | null, profile: any, requiredRole: UserRole): boolean {
  const userRole = getUserRole(user, profile)

  const roleHierarchy = {
    [UserRole.GUEST]: 0,
    [UserRole.USER]: 1,
    [UserRole.PREMIUM]: 2,
    [UserRole.MODERATOR]: 3,
    [UserRole.ADMIN]: 4,
  }

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole]
}
