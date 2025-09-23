"use client"

import { MobileLayout } from "@/components/layout/mobile-layout"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AvatarUploadEnhanced } from "@/components/profile/avatar-upload-enhanced"
import { useRouter } from "next/navigation"
import { useProfile } from "@/contexts/profile-context"
import { useAuth } from "@/hooks/use-auth"
import { User, Settings, LogOut, Heart, BarChart3, Trophy, RefreshCw } from "lucide-react"
import Link from "next/link"
import { Toaster } from "sonner"

export default function ProfilePage() {
  const { user } = useAuth()
  const { profile, isLoading, error, refreshProfile, updateProfile } = useProfile()
  const router = useRouter()
  const supabase = createClient()

  const handleRetry = () => {
    refreshProfile()
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  const handleAvatarChange = (newAvatarUrl: string | null) => {
    updateProfile({ avatar_url: newAvatarUrl || undefined })
  }

  if (isLoading) {
    return (
      <MobileLayout title="Profile" showSearch={false} showNotifications={true}>
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading profile...</p>
            <Button variant="outline" size="sm" onClick={handleRetry} className="mt-4 bg-transparent">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </div>
      </MobileLayout>
    )
  }

  if (error) {
    return (
      <MobileLayout title="Profile" showSearch={false} showNotifications={false}>
        <div className="text-center py-12 space-y-4">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
            <User className="h-8 w-8 text-destructive" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground mb-2">Error Loading Profile</h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            <div className="space-y-2">
              <Button onClick={handleRetry} className="bg-primary hover:bg-primary/90">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              <Button variant="outline" onClick={() => router.push("/auth/login")}>
                Back to Login
              </Button>
            </div>
          </div>
        </div>
      </MobileLayout>
    )
  }

  if (!user) {
    return (
      <MobileLayout title="Profile" showSearch={false} showNotifications={false}>
        <div className="text-center py-12 space-y-4">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
            <User className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground mb-2">Sign in to continue</h2>
            <p className="text-muted-foreground mb-6">Access your personalized sports statistics and favorites</p>
            <div className="space-y-2">
              <Link href="/auth/login">
                <Button className="w-full bg-primary hover:bg-primary/90">Sign In</Button>
              </Link>
              <Link href="/auth/signup">
                <Button variant="outline" className="w-full bg-transparent">
                  Create Account
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </MobileLayout>
    )
  }

  return (
    <MobileLayout title="Profile" showSearch={false} showNotifications={true}>
      <div className="space-y-6">
        {/* Profile Header */}
        <Card className="bg-card border">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <AvatarUploadEnhanced
                currentAvatarUrl={profile?.avatar_url}
                userInitial={profile?.username?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || "U"}
                onAvatarChange={handleAvatarChange}
              />
              <div className="flex-1">
                <h2 className="text-xl font-bold text-foreground">
                  {profile?.first_name && profile?.last_name
                    ? `${profile.first_name} ${profile.last_name}`
                    : profile?.username || "User"}
                </h2>
                <p className="text-muted-foreground">{user.email}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {profile?.favorite_sports?.map((sport) => (
                    <Badge key={sport} variant="secondary" className="text-xs">
                      {sport}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="bg-card border">
            <CardContent className="p-4 text-center">
              <Heart className="h-5 w-5 text-primary mx-auto mb-2" />
              <div className="text-lg font-bold text-foreground">12</div>
              <div className="text-xs text-muted-foreground">Favorites</div>
            </CardContent>
          </Card>
          <Card className="bg-card border">
            <CardContent className="p-4 text-center">
              <BarChart3 className="h-5 w-5 text-secondary mx-auto mb-2" />
              <div className="text-lg font-bold text-foreground">89</div>
              <div className="text-xs text-muted-foreground">Matches Viewed</div>
            </CardContent>
          </Card>
          <Card className="bg-card border">
            <CardContent className="p-4 text-center">
              <Trophy className="h-5 w-5 text-accent mx-auto mb-2" />
              <div className="text-lg font-bold text-foreground">5</div>
              <div className="text-xs text-muted-foreground">Predictions</div>
            </CardContent>
          </Card>
        </div>

        {/* Menu Options */}
        <div className="space-y-2">
          <Card className="bg-card border">
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                <button className="w-full flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors">
                  <Settings className="h-5 w-5 text-muted-foreground" />
                  <span className="text-foreground">Account Settings</span>
                </button>
                <button className="w-full flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors">
                  <Heart className="h-5 w-5 text-muted-foreground" />
                  <span className="text-foreground">Manage Favorites</span>
                </button>
                <button className="w-full flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors">
                  <BarChart3 className="h-5 w-5 text-muted-foreground" />
                  <span className="text-foreground">View Statistics</span>
                </button>
              </div>
            </CardContent>
          </Card>

          <Button
            variant="outline"
            className="w-full justify-start text-destructive border-destructive/20 hover:bg-destructive/10 bg-transparent"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>

      <Toaster />
    </MobileLayout>
  )
}
