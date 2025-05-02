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

    // Get the existing session cookie
    const sessionCookie = cookies().get("session")?.value

    // If no session cookie exists, create a new one
    if (!sessionCookie) {
      // Create a session cookie
      const cookieResult = await adminDbService.auth.createSessionCookie(idToken)

      if (!cookieResult.success) {
        return NextResponse.json({ error: "Failed to create session" }, { status: 500 })
      }

      // Set the session cookie
      const { sessionCookie } = cookieResult.data
      const cookieOptions = {
        maxAge: 60 * 60 * 24 * 5, // 5 days
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        sameSite: "strict",
      }

      cookies().set("session", sessionCookie, cookieOptions)
    }

    // Get user data including role
    const uid = verifyResult.data.uid
    const userResult = await adminDbService.users.getUserById(uid)

    if (!userResult.success) {
      return NextResponse.json({ error: "Failed to get user data" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      user: userResult.data,
    })
  } catch (error) {
    console.error("Error verifying session:", error)
    return NextResponse.json({ error: "Session verification failed" }, { status: 500 })
  }
}
