import { NextResponse } from "next/server"

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const ownerId = searchParams.get("ownerId")

    // In a real app, you would fetch plots from Firestore
    // For demo purposes, we'll return mock data
    const plots = [
      {
        id: "plot1",
        name: "Downtown Parking",
        address: "123 Main St, Downtown",
        description: "Conveniently located parking in the heart of downtown.",
        price: 5,
        availableSlots: 8,
        totalSlots: 15,
        ownerId: "owner123",
        ownerName: "John Owner",
        images: ["/placeholder.svg?height=300&width=500"],
        features: ["24/7 Access", "Security Cameras"],
        createdAt: "2023-01-01T00:00:00.000Z",
        totalBookings: 45,
      },
      {
        id: "plot2",
        name: "Central Mall Parking",
        address: "456 Market Ave, Central",
        description: "Parking near the central mall with easy access.",
        price: 7,
        availableSlots: 12,
        totalSlots: 30,
        ownerId: "owner123",
        ownerName: "John Owner",
        images: ["/placeholder.svg?height=300&width=500"],
        features: ["24/7 Access", "Covered Parking"],
        createdAt: "2023-01-15T00:00:00.000Z",
        totalBookings: 32,
      },
    ]

    // Filter by owner if ownerId is provided
    const filteredPlots = ownerId ? plots.filter((plot) => plot.ownerId === ownerId) : plots

    return NextResponse.json(filteredPlots)
  } catch (error) {
    console.error("Error fetching plots:", error)
    return NextResponse.json({ error: "Failed to fetch plots" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const plotData = await request.json()

    // In a real app, you would add the plot to Firestore
    // For demo purposes, we'll just return the data with an ID
    const newPlot = {
      id: `plot${Date.now()}`,
      ...plotData,
      createdAt: new Date().toISOString(),
    }

    return NextResponse.json(newPlot, { status: 201 })
  } catch (error) {
    console.error("Error creating plot:", error)
    return NextResponse.json({ error: "Failed to create plot" }, { status: 500 })
  }
}
