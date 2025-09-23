import { put, del } from "@vercel/blob"
import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Avatar upload API called")

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

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    console.log("[v0] File received:", file.name, file.type, file.size)

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "File must be an image" }, { status: 400 })
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File size must be less than 5MB" }, { status: 400 })
    }

    // Get current avatar URL to delete old one
    const { data: currentProfile } = await supabase.from("users").select("avatar_url").eq("id", user.id).single()
    console.log("[v0] Current profile avatar:", currentProfile?.avatar_url)

    // Upload new avatar to Vercel Blob
    const filename = `avatar-${user.id}-${Date.now()}.${file.type.split("/")[1]}`
    console.log("[v0] Uploading to blob with filename:", filename)

    const blob = await put(filename, file, {
      access: "public",
    })

    console.log("[v0] Blob upload successful:", blob.url)

    // Update user profile with new avatar URL
    const { error: updateError } = await supabase.from("users").update({ avatar_url: blob.url }).eq("id", user.id)

    if (updateError) {
      console.error("[v0] Database update failed:", updateError)
      // If database update fails, delete the uploaded file
      await del(blob.url)
      return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
    }

    console.log("[v0] Database updated successfully")

    // Delete old avatar if it exists and is a blob URL
    if (currentProfile?.avatar_url && currentProfile.avatar_url.includes("blob.vercel-storage.com")) {
      try {
        await del(currentProfile.avatar_url)
        console.log("[v0] Old avatar deleted")
      } catch (error) {
        // Log but don't fail the request if old avatar deletion fails
        console.warn("[v0] Failed to delete old avatar:", error)
      }
    }

    return NextResponse.json({
      url: blob.url,
      filename: filename,
      size: file.size,
      type: file.type,
    })
  } catch (error) {
    console.error("[v0] Avatar upload error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
