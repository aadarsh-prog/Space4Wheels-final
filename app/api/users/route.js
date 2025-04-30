import { NextResponse } from "next/server"
import adminDbService from "@/lib/firebase/admin-database"
import { initAdmin } from "@/lib/firebase/firebase-admin"

// Initialize Firebase Admin
initAdmin()

export async function POST(request) {
  try {
    const userData = await request.json()

    // Validate required fields
    if (!userData.uid || !userData.email || !userData.name || !userData.role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Create user in Firestore
    const result = await adminDbService.users.createUser(userData.uid, userData)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const role = searchParams.get("role")

    if (role) {
      const result = await adminDbService.users.getUsersByRole(role)

      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 })
      }

      return NextResponse.json(result.data)
    }

    // Return error if no filters provided
    return NextResponse.json({ error: "Missing query parameters" }, { status: 400 })
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}
