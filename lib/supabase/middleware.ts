import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
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

    const {
      data: { user },
      error: userError,
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

    if (!user && !isPublicRoute) {
      console.log("[v0] Middleware - Unauthenticated access to protected route:", request.nextUrl.pathname)
    }

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
        const { data: userData, error: adminError } = await supabase
          .from("users")
          .select("is_admin")
          .eq("id", user.id)
          .single()

        if (adminError) {
          console.error("[v0] Middleware - Admin check database error:", adminError)
          return supabaseResponse
        }

        if (!userData?.is_admin) {
          console.log("[v0] Middleware - User is not admin, redirecting to dashboard")
          const url = request.nextUrl.clone()
          url.pathname = "/dashboard"
          return NextResponse.redirect(url)
        }

        console.log("[v0] Middleware - Admin access granted")
      } catch (adminCheckError) {
        console.error("[v0] Middleware - Admin check exception:", adminCheckError)
        return supabaseResponse
      }
    }

    if (!user && !isPublicRoute) {
      const url = request.nextUrl.clone()
      url.pathname = "/auth/login"
      url.searchParams.set("redirectTo", request.nextUrl.pathname)
      return NextResponse.redirect(url)
    }
  } catch (error) {
    console.error("[v0] Middleware - Auth check failed:", error)
  }

  return supabaseResponse
}
