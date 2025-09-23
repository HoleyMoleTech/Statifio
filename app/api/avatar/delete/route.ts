import { del } from "@vercel/blob"
import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function DELETE(request: NextRequest) {
  try {
    console.log("[v0] Avatar delete API called")

    const supabase = await createClient()

    // Check if user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    console.log("[v0] Auth check - User exists:", !!user, "Auth error:", authError)

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get current avatar URL
    const { data: currentProfile } = await supabase.from("users").select("avatar_url").eq("id", user.id).single()
    console.log("[v0] Current avatar URL:", currentProfile?.avatar_url)

    if (!currentProfile?.avatar_url) {
      return NextResponse.json({ error: "No avatar to delete" }, { status: 400 })
    }

    // Update user profile to remove avatar URL
    const { error: updateError } = await supabase.from("users").update({ avatar_url: null }).eq("id", user.id)

    if (updateError) {
      console.error("[v0] Database update failed:", updateError)
      return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
    }

    console.log("[v0] Database updated successfully")

    // Delete avatar from blob storage if it's a blob URL
    if (currentProfile.avatar_url.includes("blob.vercel-storage.com")) {
      try {
        await del(currentProfile.avatar_url)
        console.log("[v0] Avatar deleted from blob storage")
      } catch (error) {
        // Log but don't fail the request if blob deletion fails
        console.warn("[v0] Failed to delete avatar from blob storage:", error)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Avatar delete error:", error)
    return NextResponse.json({ error: "Delete failed" }, { status: 500 })
  }
}
