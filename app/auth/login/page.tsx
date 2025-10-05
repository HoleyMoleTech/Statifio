"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Logo } from "@/components/ui/logo"
import { MobileLayout } from "@/components/layout/mobile-layout"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { TrendingUp, BarChart3, Users, Eye, Target, Calendar } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      console.log("[v0] Login - Starting authentication")
      console.log("[v0] Login - Email:", email)

      const supabase = createClient()

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      console.log("[v0] Login - Auth response:", { data: !!data, error: authError })

      if (authError) {
        console.error("[v0] Login - Auth error:", authError)
        throw authError
      }

      if (!data.session) {
        console.error("[v0] Login - No session returned")
        throw new Error("No session returned from authentication")
      }

      console.log("[v0] Login - Success, session created")

      // Small delay to ensure session is set
      await new Promise((resolve) => setTimeout(resolve, 500))

      console.log("[v0] Login - Redirecting to profile")
      router.push("/profile")
      router.refresh()
    } catch (error: unknown) {
      console.error("[v0] Login - Error:", error)
      setError(error instanceof Error ? error.message : "An error occurred during login")
      setIsLoading(false)
    }
  }

  const analyticsData = {
    totalMatches: 45672,
    activeUsers: 12890,
    predictions: 8930,
    accuracy: 73,
  }

  const weeklyData = [
    { day: "Mon", value: 120 },
    { day: "Tue", value: 150 },
    { day: "Wed", value: 180 },
    { day: "Thu", value: 140 },
    { day: "Fri", value: 200 },
    { day: "Sat", value: 250 },
    { day: "Sun", value: 220 },
  ]

  const maxValue = Math.max(...weeklyData.map((d) => d.value))

  return (
    <MobileLayout title="Sign In" showBack={true} showBottomNav={true}>
      {/* Mobile Layout */}
      <div className="lg:hidden">
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-sm">
            <Card className="bg-card border">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <Logo size="lg" showText={true} href={null} />
                </div>
                <CardTitle className="text-2xl font-bold text-foreground">Welcome Back</CardTitle>
                <CardDescription className="text-muted-foreground">Sign in to access your account</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-foreground">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-input border"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-foreground">
                      Password
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-input border"
                    />
                  </div>

                  {error && <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{error}</p>}

                  <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isLoading}>
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>

                <div className="mt-6 text-center text-sm text-muted-foreground">
                  Don't have an account?{" "}
                  <Link href="/auth/signup" className="text-primary hover:underline font-medium">
                    Sign up
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Desktop Split-Screen Layout */}
      <div className="hidden lg:flex min-h-screen">
        {/* Left Side - Visual Content */}
        <div className="flex-1 bg-primary/5 p-12 flex flex-col justify-center relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23000000' fillOpacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2H6zM6 34v-4H4v4H0v2h4v4h2V6h4V4H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}
            />
          </div>

          <div className="relative z-10 max-w-2xl">
            <div className="mb-8 pt-12">
              <Logo size="xl" showText={true} href={null} />
            </div>

            <h1 className="text-5xl font-bold text-foreground mb-6 text-balance">
              Your gateway to <span className="text-primary">advanced sports analytics</span>
            </h1>

            <p className="text-xl text-muted-foreground mb-12 text-pretty">
              Join thousands of sports enthusiasts tracking real-time match data, team performance, and making winning
              predictions across esports and traditional sports.
            </p>

            {/* Analytics Preview */}
            <div className="space-y-8">
              {/* Key Metrics */}
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-card/50 backdrop-blur-sm rounded-lg p-6 border">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Live Matches</p>
                      <p className="text-3xl font-bold text-foreground">
                        {analyticsData.totalMatches.toLocaleString()}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <BarChart3 className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-600">+12.5% this week</span>
                  </div>
                </div>

                <div className="bg-card/50 backdrop-blur-sm rounded-lg p-6 border">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Active Users</p>
                      <p className="text-3xl font-bold text-foreground">{analyticsData.activeUsers.toLocaleString()}</p>
                    </div>
                    <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center">
                      <Users className="h-6 w-6 text-secondary" />
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-600">+8.3% this month</span>
                  </div>
                </div>
              </div>

              {/* Weekly Activity Chart */}
              <div className="bg-card/50 backdrop-blur-sm rounded-lg p-6 border">
                <div className="flex items-center gap-2 mb-6">
                  <Calendar className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold text-foreground">Weekly Activity</h3>
                </div>
                <div className="grid grid-cols-7 gap-3">
                  {weeklyData.map((data, index) => (
                    <div key={index} className="text-center space-y-2">
                      <div className="text-xs text-muted-foreground font-medium">{data.day}</div>
                      <div className="flex flex-col items-center">
                        <div
                          className="w-6 bg-primary rounded-t transition-all duration-500"
                          style={{ height: `${(data.value / maxValue) * 60}px` }}
                        />
                        <div className="text-xs text-primary font-semibold mt-1">{data.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Features */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Eye className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-sm font-medium text-foreground">Real-time Data</p>
                </div>
                <div className="text-center">
                  <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Target className="h-5 w-5 text-secondary" />
                  </div>
                  <p className="text-sm font-medium text-foreground">Smart Predictions</p>
                </div>
                <div className="text-center">
                  <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-2">
                    <BarChart3 className="h-5 w-5 text-accent" />
                  </div>
                  <p className="text-sm font-medium text-foreground">Advanced Analytics</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-[480px] bg-background p-12 sticky top-0 h-screen overflow-y-auto flex items-start justify-center">
          <div className="w-full max-w-sm pt-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-2">Welcome Back</h2>
              <p className="text-muted-foreground">Sign in to access your analytics dashboard</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="desktop-email" className="text-foreground font-medium">
                  Email Address
                </Label>
                <Input
                  id="desktop-email"
                  type="email"
                  placeholder="your@email.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-input border h-12 text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="desktop-password" className="text-foreground font-medium">
                  Password
                </Label>
                <Input
                  id="desktop-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-input border h-12 text-base"
                />
              </div>

              {error && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 h-12 text-base font-medium"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link href="/auth/signup" className="text-primary hover:underline font-medium">
                  Create one now
                </Link>
              </p>
            </div>

            {/* Trust Indicators */}
            <div className="mt-8 pt-8 border-t border-border">
              <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span>Secure Login</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <span>24/7 Support</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MobileLayout>
  )
}
