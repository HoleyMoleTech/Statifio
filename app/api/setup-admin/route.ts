import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { email, setupKey } = await request.json()

    // Use a secure setup key - change this to something secure
    const ADMIN_SETUP_KEY = process.env.ADMIN_SETUP_KEY || "your-secure-setup-key-here"

    if (setupKey !== ADMIN_SETUP_KEY) {
      return NextResponse.json({ error: "Invalid setup key" }, { status: 401 })
    }

    const supabase = createRouteHandlerClient({ cookies })

    // Update user to admin
    const { data, error } = await supabase.from("users").update({ is_admin: true }).eq("email", email).select()

    if (error) {
      console.error("Error setting up admin:", error)
      return NextResponse.json({ error: "Failed to setup admin" }, { status: 500 })
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      message: "Admin user created successfully",
      user: data[0],
    })
  } catch (error) {
    console.error("Setup admin error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
