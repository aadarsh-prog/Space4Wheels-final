import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { createSessionCookie } from "@/lib/firebase/admin-database/auth"

export async function POST(request) {
  try {
    const { idToken } = await request.json()

    // Create a session cookie
    const sessionCookieResult = await createSessionCookie(idToken)

    if (!sessionCookieResult.success) {
      return NextResponse.json({ error: "Failed to create session" }, { status: 401 })
    }
    const resolveCookie= await cookies;
    // Set the session cookie
   resolveCookie().set({
      name: "session",
      value: sessionCookieResult.sessionCookie,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 5, // 5 days
      path: "/",
    })

    return NextResponse.json({ status: "success" })
  } catch (error) {
    console.error("Error creating session:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
