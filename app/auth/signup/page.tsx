"use client"

import type React from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { SocialLoginButtons } from "@/components/auth/social-login-buttons"
import { MobileLayout } from "@/components/layout/mobile-layout"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useRef } from "react"
import { Shield, Eye, EyeOff, ChevronDown, ChevronUp } from "lucide-react"

export default function SignUpPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [username, setUsername] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [acceptPrivacy, setAcceptPrivacy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [showEmailForm, setShowEmailForm] = useState(false)
  const emailFormRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const toggleEmailForm = () => {
    setShowEmailForm(!showEmailForm)
  }

  const validateField = (field: string, value: string) => {
    const errors = { ...fieldErrors }

    switch (field) {
      case "username":
        if (value.length < 3) {
          errors.username = "Username must be at least 3 characters"
        } else if (!/^[a-zA-Z0-9_]+$/.test(value)) {
          errors.username = "Username can only contain letters, numbers, and underscores"
        } else {
          delete errors.username
        }
        break
      case "email":
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errors.email = "Please enter a valid email address"
        } else {
          delete errors.email
        }
        break
      case "password":
        if (value.length < 8) {
          errors.password = "Password must be at least 8 characters"
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
          errors.password = "Password must contain uppercase, lowercase, and number"
        } else {
          delete errors.password
        }
        break
      case "confirmPassword":
        if (value !== password) {
          errors.confirmPassword = "Passwords do not match"
        } else {
          delete errors.confirmPassword
        }
        break
    }

    setFieldErrors(errors)
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    // Validate all fields
    validateField("username", username)
    validateField("email", email)
    validateField("password", password)
    validateField("confirmPassword", confirmPassword)

    if (Object.keys(fieldErrors).length > 0) {
      setError("Please fix the errors above")
      setIsLoading(false)
      return
    }

    if (!acceptTerms || !acceptPrivacy) {
      setError("Please accept the Terms of Service and Privacy Policy")
      setIsLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/profile`,
          data: {
            username: username,
          },
        },
      })
      if (error) throw error
      router.push("/auth/signup-success")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <MobileLayout title="Join Statifio" showBack={true} showBottomNav={true}>
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-lg">
          <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-xl">
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <div>
                <CardTitle className="text-3xl font-bold text-balance">Join the sports Revolution</CardTitle>
                <CardDescription className="text-muted-foreground mt-2 text-pretty">
                  Get exclusive access to live stats, match insights, and connect with the gaming community
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Social Login */}
              <div>
                <SocialLoginButtons mode="signup" onError={setError} />
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={toggleEmailForm}
                    className="bg-card px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200 flex items-center gap-2"
                  >
                    Or continue with email
                    {showEmailForm ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div
                className={`transition-all duration-300 ease-in-out overflow-hidden ${
                  showEmailForm ? "max-h-[1200px] opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <form onSubmit={handleSignUp} className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-foreground font-medium">
                      Username
                    </Label>
                    <Input
                      id="username"
                      type="text"
                      placeholder="your_username"
                      required
                      value={username}
                      onChange={(e) => {
                        setUsername(e.target.value)
                        validateField("username", e.target.value)
                      }}
                      className={`bg-input border-2 h-12 transition-colors ${
                        fieldErrors.username ? "border-destructive" : "border-border focus:border-primary"
                      }`}
                    />
                    {fieldErrors.username && <p className="text-sm text-destructive">{fieldErrors.username}</p>}
                  </div>

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
                        validateField("email", e.target.value)
                      }}
                      className={`bg-input border-2 h-12 transition-colors ${
                        fieldErrors.email ? "border-destructive" : "border-border focus:border-primary"
                      }`}
                    />
                    {fieldErrors.email && <p className="text-sm text-destructive">{fieldErrors.email}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-foreground font-medium">
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a strong password"
                        required
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value)
                          validateField("password", e.target.value)
                        }}
                        className={`bg-input border-2 h-12 pr-12 transition-colors ${
                          fieldErrors.password ? "border-destructive" : "border-border focus:border-primary"
                        }`}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-12 px-3 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    {fieldErrors.password && <p className="text-sm text-destructive">{fieldErrors.password}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-foreground font-medium">
                      Confirm Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Repeat your password"
                        required
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value)
                          validateField("confirmPassword", e.target.value)
                        }}
                        className={`bg-input border-2 h-12 pr-12 transition-colors ${
                          fieldErrors.confirmPassword ? "border-destructive" : "border-border focus:border-primary"
                        }`}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-12 px-3 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    {fieldErrors.confirmPassword && (
                      <p className="text-sm text-destructive">{fieldErrors.confirmPassword}</p>
                    )}
                  </div>

                  {/* GDPR Compliance */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="terms"
                        checked={acceptTerms}
                        onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                        className="mt-1"
                      />
                      <Label htmlFor="terms" className="text-sm text-muted-foreground leading-relaxed">
                        I agree to the{" "}
                        <Link href="/terms" className="text-primary hover:underline font-medium">
                          Terms of Service
                        </Link>
                      </Label>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="privacy"
                        checked={acceptPrivacy}
                        onCheckedChange={(checked) => setAcceptPrivacy(checked as boolean)}
                        className="mt-1"
                      />
                      <Label htmlFor="privacy" className="text-sm text-muted-foreground leading-relaxed">
                        I acknowledge the{" "}
                        <Link href="/privacy" className="text-primary hover:underline font-medium">
                          Privacy Policy
                        </Link>{" "}
                        and consent to data processing
                      </Label>
                    </div>
                  </div>

                  {error && (
                    <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                      <p className="text-sm text-destructive font-medium">{error}</p>
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-semibold text-base shadow-lg transition-all duration-200"
                    disabled={isLoading || !acceptTerms || !acceptPrivacy}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Creating your account...
                      </div>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </form>

                {/* Trust Elements */}
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground bg-muted/30 rounded-lg p-3 mt-4">
                  <Shield className="h-4 w-4 text-primary" />
                  <span>GDPR compliant • Secure encryption • Your data is protected</span>
                </div>
              </div>

              <div className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/auth/login" className="text-primary hover:underline font-semibold">
                  Sign in here
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MobileLayout>
  )
}
