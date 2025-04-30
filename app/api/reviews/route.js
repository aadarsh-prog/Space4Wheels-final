import { NextResponse } from "next/server"
import adminDbService from "@/lib/firebase/admin-database"
import { initAdmin } from "@/lib/firebase/firebase-admin"

// Initialize Firebase Admin
initAdmin()

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const plotId = searchParams.get("plotId")
    const userId = searchParams.get("userId")

    let result

    if (plotId) {
      result = await adminDbService.reviews.getReviewsByPlotId(plotId)
    } else if (userId) {
      result = await adminDbService.reviews.getReviewsByUserId(userId)
    } else {
      return NextResponse.json({ error: "Missing query parameters" }, { status: 400 })
    }

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json(result.data)
  } catch (error) {
    console.error("Error fetching reviews:", error)
    return NextResponse.json({ error: "Failed to fetch reviews: " + error.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    // Initialize Firebase Admin
    initAdmin()

    const data = await request.json()

    // Validate required fields
    if (!data.userId || !data.plotId || !data.rating) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const result = await adminDbService.reviews.createReview(data)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json(result.data, { status: 201 })
  } catch (error) {
    console.error("Error creating review:", error)
    return NextResponse.json({ error: "Failed to create review: " + error.message }, { status: 500 })
  }
}
