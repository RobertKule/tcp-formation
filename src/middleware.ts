import { NextRequest, NextResponse } from "next/server"
import { decrypt } from "@/lib/auth"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const session = request.cookies.get("session")?.value

  // Protéger toutes les routes commençant par /admin sauf /admin/login
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    if (!session) {
      return NextResponse.redirect(new URL("/admin/login", request.url))
    }

    try {
      await decrypt(session)
      return NextResponse.next()
    } catch (e) {
      return NextResponse.redirect(new URL("/admin/login", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*"],
}
