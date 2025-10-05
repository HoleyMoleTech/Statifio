import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  console.log("[v0] Middleware - Processing request:", request.nextUrl.pathname)
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
      error: userError,
    } = await supabase.auth.getUser()

    console.log("[v0] Middleware - User check:", user?.id || "no user", "Error:", userError?.message || "none")

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

    if (isAdminRoute) {
      console.log("[v0] Middleware - Admin route accessed:", request.nextUrl.pathname)

      if (!user) {
        console.log("[v0] Middleware - No user found for admin route, redirecting to login")
        const url = request.nextUrl.clone()
        url.pathname = "/auth/login"
        url.searchParams.set("redirectTo", request.nextUrl.pathname)
        return NextResponse.redirect(url)
      }

      try {
        console.log("[v0] Middleware - Checking admin status for user:", user.id)
        const { data: userData, error: adminError } = await supabase
          .from("users")
          .select("is_admin")
          .eq("id", user.id)
          .single()

        console.log("[v0] Middleware - Admin check result:", {
          userId: user.id,
          isAdmin: userData?.is_admin,
          error: adminError?.message,
        })

        if (adminError) {
          console.error("[v0] Middleware - Admin check database error:", adminError)
          // On database error, allow through and let the layout handle it
          return supabaseResponse
        }

        if (!userData?.is_admin) {
          console.log("[v0] Middleware - User is not admin, redirecting to dashboard")
          const url = request.nextUrl.clone()
          url.pathname = "/dashboard"
          return NextResponse.redirect(url)
        }

        console.log("[v0] Middleware - Admin access granted for user:", user.id)
      } catch (adminCheckError) {
        console.error("[v0] Middleware - Admin check exception:", adminCheckError)
        // On exception, allow through and let the layout handle it
        return supabaseResponse
      }
    }

    if (!user && !isPublicRoute) {
      console.log("[v0] Middleware - Unauthenticated access to protected route, redirecting to login")
      const url = request.nextUrl.clone()
      url.pathname = "/auth/login"
      url.searchParams.set("redirectTo", request.nextUrl.pathname)
      return NextResponse.redirect(url)
    }
  } catch (error) {
    console.error("[v0] Middleware - Auth check failed:", error)
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
