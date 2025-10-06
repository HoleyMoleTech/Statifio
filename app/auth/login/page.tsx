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
import {
  TrendingUp,
  BarChart3,
  Users,
  Eye,
  Target,
  Calendar,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [validationErrors, setValidationErrors] = useState<{ email?: string; password?: string }>({})
  const router = useRouter()

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validatePassword = (password: string): boolean => {
    return password.length >= 6
  }

  const handleEmailBlur = () => {
    if (email && !validateEmail(email)) {
      setValidationErrors((prev) => ({ ...prev, email: "Please enter a valid email address" }))
    } else {
      setValidationErrors((prev) => ({ ...prev, email: undefined }))
    }
  }

  const handlePasswordBlur = () => {
    if (password && !validatePassword(password)) {
      setValidationErrors((prev) => ({ ...prev, password: "Password must be at least 6 characters" }))
    } else {
      setValidationErrors((prev) => ({ ...prev, password: undefined }))
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    const errors: { email?: string; password?: string } = {}
    if (!validateEmail(email)) {
      errors.email = "Please enter a valid email address"
    }
    if (!validatePassword(password)) {
      errors.password = "Password must be at least 6 characters"
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      setIsLoading(false)
      return
    }

    try {
      const supabase = createClient()

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        let userMessage = "Unable to sign in. Please check your credentials and try again."
        if (authError.message.includes("Invalid login credentials")) {
          userMessage = "Invalid email or password. Please try again."
        } else if (authError.message.includes("Email not confirmed")) {
          userMessage = "Please verify your email address before signing in."
        } else if (authError.message.includes("Too many requests")) {
          userMessage = "Too many login attempts. Please wait a moment and try again."
        }
        setError(userMessage)
        setIsLoading(false)
        return
      }

      if (!data.session) {
        setError("Authentication failed. Please try again.")
        setIsLoading(false)
        return
      }

      router.push("/dashboard")
      router.refresh()
    } catch (err) {
      console.error("[v0] Login error:", err)
      setError("An unexpected error occurred. Please try again.")
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
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-sm">
            <Card className="bg-card border shadow-lg">
              <CardHeader className="text-center space-y-4">
                <div className="flex justify-center">
                  <Logo size="lg" showText={true} href={null} />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold text-foreground">Welcome Back</CardTitle>
                  <CardDescription className="text-muted-foreground mt-2">
                    Sign in to access your analytics dashboard
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-foreground font-medium">
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      required
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value)
                        if (validationErrors.email) {
                          setValidationErrors((prev) => ({ ...prev, email: undefined }))
                        }
                      }}
                      onBlur={handleEmailBlur}
                      className={`bg-input border h-11 ${validationErrors.email ? "border-destructive" : ""}`}
                      disabled={isLoading}
                      aria-invalid={!!validationErrors.email}
                      aria-describedby={validationErrors.email ? "email-error" : undefined}
                    />
                    {validationErrors.email && (
                      <p id="email-error" className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {validationErrors.email}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-foreground font-medium">
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value)
                          if (validationErrors.password) {
                            setValidationErrors((prev) => ({ ...prev, password: undefined }))
                          }
                        }}
                        onBlur={handlePasswordBlur}
                        className={`bg-input border h-11 pr-10 ${validationErrors.password ? "border-destructive" : ""}`}
                        disabled={isLoading}
                        aria-invalid={!!validationErrors.password}
                        aria-describedby={validationErrors.password ? "password-error" : undefined}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        disabled={isLoading}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {validationErrors.password && (
                      <p id="password-error" className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {validationErrors.password}
                      </p>
                    )}
                  </div>

                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90 h-11 font-medium"
                    disabled={isLoading || !!validationErrors.email || !!validationErrors.password}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </form>

                <div className="mt-6 text-center text-sm text-muted-foreground">
                  Don't have an account?{" "}
                  <Link href="/auth/signup" className="text-primary hover:underline font-medium">
                    Sign up
                  </Link>
                </div>

                <div className="mt-6 pt-6 border-t border-border">
                  <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3 text-green-600" />
                      <span>Secure Connection</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3 text-blue-600" />
                      <span>Privacy Protected</span>
                    </div>
                  </div>
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
          <div className="absolute inset-0 opacity-5">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23000000' fillOpacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
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
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (validationErrors.email) {
                      setValidationErrors((prev) => ({ ...prev, email: undefined }))
                    }
                  }}
                  onBlur={handleEmailBlur}
                  className={`bg-input border h-12 text-base ${validationErrors.email ? "border-destructive" : ""}`}
                  disabled={isLoading}
                  aria-invalid={!!validationErrors.email}
                  aria-describedby={validationErrors.email ? "desktop-email-error" : undefined}
                />
                {validationErrors.email && (
                  <p id="desktop-email-error" className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {validationErrors.email}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="desktop-password" className="text-foreground font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="desktop-password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      if (validationErrors.password) {
                        setValidationErrors((prev) => ({ ...prev, password: undefined }))
                      }
                    }}
                    onBlur={handlePasswordBlur}
                    className={`bg-input border h-12 text-base pr-10 ${validationErrors.password ? "border-destructive" : ""}`}
                    disabled={isLoading}
                    aria-invalid={!!validationErrors.password}
                    aria-describedby={validationErrors.password ? "desktop-password-error" : undefined}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    disabled={isLoading}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {validationErrors.password && (
                  <p id="desktop-password-error" className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {validationErrors.password}
                  </p>
                )}
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 h-12 text-base font-medium"
                disabled={isLoading || !!validationErrors.email || !!validationErrors.password}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
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

            <div className="mt-8 pt-8 border-t border-border">
              <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3 text-green-600" />
                  <span>Secure Login</span>
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3 text-blue-600" />
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
