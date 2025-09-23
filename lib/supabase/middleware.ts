import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  console.log("[v0] Middleware - SUPABASE_URL:", !!process.env.NEXT_PUBLIC_SUPABASE_URL)
  console.log("[v0] Middleware - SUPABASE_ANON_KEY:", !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.log("[v0] Middleware - Missing Supabase environment variables, skipping auth")
    return NextResponse.next({ request })
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
            supabaseResponse = NextResponse.next({
              request,
            })
            cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
          },
        },
      },
    )

    // IMPORTANT: Avoid writing any logic between createServerClient and
    // supabase.auth.getUser(). A simple mistake could make it very hard to debug
    // issues with users being randomly logged out.

    const {
      data: { user },
    } = await supabase.auth.getUser()

    const publicRoutes = [
      "/",
      "/stats",
      "/events",
      "/teams",
      "/auth/login",
      "/auth/signup",
      "/auth/signup-success",
      "/auth/error",
    ]

    const isPublicRoute =
      publicRoutes.includes(request.nextUrl.pathname) ||
      request.nextUrl.pathname.startsWith("/auth") ||
      request.nextUrl.pathname.startsWith("/api") ||
      request.nextUrl.pathname.startsWith("/_next")

    const isAdminRoute = request.nextUrl.pathname.startsWith("/admin")

    if (isAdminRoute && user) {
      // Check if user is admin
      const { data: userData } = await supabase.from("users").select("is_admin").eq("id", user.id).single()

      if (!userData?.is_admin) {
        console.log(
          `[v0] Security - Unauthorized admin access attempt by user ${user.id} from ${request.ip || "unknown IP"}`,
        )

        // Log security event (you could store this in a security_events table)
        await supabase
          .from("user_activity")
          .insert({
            user_id: user.id,
            activity_type: "unauthorized_admin_access",
            activity_data: {
              attempted_path: request.nextUrl.pathname,
              ip_address: request.ip || "unknown",
              user_agent: request.headers.get("user-agent") || "unknown",
            },
          })
          .catch((err) => console.error("Failed to log security event:", err))

        // User is not admin, redirect to dashboard
        const url = request.nextUrl.clone()
        url.pathname = "/dashboard"
        return NextResponse.redirect(url)
      } else {
        console.log(`[v0] Security - Admin access granted to user ${user.id} for ${request.nextUrl.pathname}`)

        await supabase
          .from("user_activity")
          .insert({
            user_id: user.id,
            activity_type: "admin_access",
            activity_data: {
              accessed_path: request.nextUrl.pathname,
              ip_address: request.ip || "unknown",
              user_agent: request.headers.get("user-agent") || "unknown",
            },
          })
          .catch((err) => console.error("Failed to log admin access:", err))
      }
    }

    if (!user && !isPublicRoute) {
      // no user, potentially respond by redirecting the user to the login page
      const url = request.nextUrl.clone()
      url.pathname = "/auth/login"
      return NextResponse.redirect(url)
    }
  } catch (error) {
    console.log("[v0] Middleware - Auth check failed:", error)
    // Continue without auth check if there's an error
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
  // creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object instead of the supabaseResponse object

  return supabaseResponse
}
