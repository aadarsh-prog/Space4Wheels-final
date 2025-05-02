import { NextResponse } from "next/server"
import adminDbService from "@/lib/firebase/admin-database"
import { initAdmin } from "@/lib/firebase/firebase-admin"

// Initialize Firebase Admin
initAdmin()

export async function GET(request) {
  try {
    // Get pending plots
    const result = await adminDbService.plots.getPlotsByStatus("pending")

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json(result.data)
  } catch (error) {
    console.error("Error fetching pending plots:", error)
    return NextResponse.json({ error: "Failed to fetch pending plots" }, { status: 500 })
  }
}
