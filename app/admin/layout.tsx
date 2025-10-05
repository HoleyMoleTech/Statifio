import type React from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { MobileLayout } from "@/components/layout/mobile-layout"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  // Check if user is admin
  const { data: userData, error: adminError } = await supabase
    .from("users")
    .select("is_admin")
    .eq("id", user.id)
    .single()

  if (!userData?.is_admin) {
    redirect("/dashboard")
  }

  return (
    <MobileLayout title="Admin Dashboard" showBack={true} showBottomNav={true}>
      {children}
    </MobileLayout>
  )
}
