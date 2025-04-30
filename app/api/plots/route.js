import { NextResponse } from "next/server"
import { getPlotsByOwnerId, createPlot } from "@/lib/firebase/database/plots" 

// GET: Fetch plots (optionally filtered by ownerId)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const ownerId = searchParams.get("ownerId")
       
    let plotsResult

    if (ownerId) {
      plotsResult = await getPlotsByOwnerId(ownerId)
    } else {
      // Optional: you can create another method to fetch all plots
      plotsResult = await getPlotsByOwnerId("") // Will return empty or fail if ownerId is empty
    }

    if (!plotsResult.success) {
      throw new Error(plotsResult.error || "Error fetching plots")
    }

    return NextResponse.json(plotsResult.data)
  } catch (error) {
    console.error("Error fetching plots:", error)
    return NextResponse.json({ error: "Failed to fetch plots" }, { status: 500 })
  }
}

// POST: Create a new plot
export async function POST(request) {
  try {
    const plotData = await request.json()

    const result = await createPlot(plotData)

    if (!result.success) {
      console.log(result.error)
      throw new Error(result.error || "Error creating plot")
    }

    return NextResponse.json(result.data, { status: 201 })
  } catch (error) {
    console.error("Error creating plot:", error)
    return NextResponse.json({ error: "Failed to create plot" }, { status: 500 })
  }
}
