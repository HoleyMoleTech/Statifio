import type React from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { MobileLayout } from "@/components/layout/mobile-layout"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  console.log("[v0] Admin layout - Starting authentication check")
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  console.log("[v0] Admin layout - User:", user?.id, "Error:", error?.message)

  if (error || !user) {
    console.log("[v0] Admin layout - No user found, redirecting to login")
    redirect("/auth/login")
  }

  // Check if user is admin
  console.log("[v0] Admin layout - Checking admin status for user:", user.id)
  const { data: userData, error: adminError } = await supabase
    .from("users")
    .select("is_admin")
    .eq("id", user.id)
    .single()

  console.log("[v0] Admin layout - Admin check result:", userData, "Error:", adminError?.message)

  if (!userData?.is_admin) {
    console.log("[v0] Admin layout - User is not admin, redirecting to dashboard")
    redirect("/dashboard")
  }

  console.log("[v0] Admin layout - Admin access granted")

  return (
    <MobileLayout title="Admin Dashboard" showBack={true} showBottomNav={true}>
      <div className="space-y-4">
        <div className="border-b bg-card rounded-lg p-4">
          <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage users and platform settings</p>
        </div>
        {children}
      </div>
    </MobileLayout>
  )
}
