import { NextResponse } from "next/server"
import { getPlotById } from "@/lib/firebase/admin-database/plots"
import {updatePlot } from "@/lib/firebase/admin-database/plots"

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


// update plot data
export async function PUT(request ,{ params }) {
  try {
    // Initialize Firebase Admin
   const resolveparams=await params;
    const plotId = resolveparams.id


    const data = await request.json()
    //console.log("Received plot data:", data)

    // Validate required fields
    if (!data.name || !data.address || !data.price ||!data.description || !data.totalSlots || !data.ownerId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const result = await adminDbService.plots.updatePlot(plotId,data);
    console.log("update plot result:", result)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json(result.data, { status: 201 })
  } catch (error) {
    console.error("Error updating plot:", error)
    return NextResponse.json({ error: "Failed to pdate plot: " + error.message }, { status: 500 })
  }
}
