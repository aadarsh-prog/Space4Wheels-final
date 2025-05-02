// File: app/api/auth/login/route.js
import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import adminDbService from "@/lib/firebase/admin-database"
import { initAdmin } from "@/lib/firebase/firebase-admin"

// Initialize Firebase Admin
initAdmin()

export async function POST(request) {
  try {
    const { idToken } = await request.json()

    if (!idToken) {
      return NextResponse.json({ error: "ID token is required" }, { status: 400 })
    }

    // Verify the ID token
    const verifyResult = await adminDbService.auth.verifyIdToken(idToken)

    if (!verifyResult.success) {
      return NextResponse.json({ error: "Invalid ID token" }, { status: 401 })
    }

    // Create a session cookie
    const cookieResult = await adminDbService.auth.createSessionCookie(idToken)

    if (!cookieResult.success) {
      return NextResponse.json({ error: "Failed to create session" }, { status: 500 })
    }

    // Set the session cookie - fixing the sync cookies issue
    const sessionCookie = cookieResult.data.sessionCookie
    const cookieOptions = {
      maxAge: 60 * 60 * 24 * 5, // 5 days
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "strict",
    }

    // FIX: Await the cookies() call before setting the cookie
    const cookieStore = await cookies()
    cookieStore.set("session", sessionCookie, cookieOptions)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error logging in:", error)
    return NextResponse.json({ error: "Login failed" }, { status: 500 })
  }
}