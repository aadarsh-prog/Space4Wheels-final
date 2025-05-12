import { NextResponse } from "next/server"
import { getPlotById } from "@/lib/firebase/admin-database/plots"

export async function GET(request, { params }) {
  try {
    const resolveparams=await params;
    const plotId = resolveparams.id

    if (!plotId) {
      return NextResponse.json({ success: false, error: "Plot ID is required", data: null }, { status: 400 })
    }

    console.log(`Fetching plot with ID: ${plotId}`)

    const result = await getPlotById(plotId)

    if (!result.success) {
      console.error(`Error fetching plot ${plotId}:`, result.error)
      return NextResponse.json({ success: false, error: result.error, data: null }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: result.data,
    })
  } catch (error) {
    console.error("Error fetching plot:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch plot details", data: null }, { status: 500 })
  }
}
