import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    // In a real app, you would fetch nearby plots based on user location
    // For demo purposes, we'll return mock data
    const nearbyPlots = [
      {
        id: "plot1",
        name: "Downtown Parking",
        address: "123 Main St, Downtown",
        price: 5,
        availableSlots: 8,
        totalSlots: 15,
        distance: 0.5,
        lat: 40.7128,
        lng: -74.006,
      },
      {
        id: "plot2",
        name: "Central Mall Parking",
        address: "456 Market Ave, Central",
        price: 7,
        availableSlots: 12,
        totalSlots: 30,
        distance: 1.2,
        lat: 40.7138,
        lng: -74.013,
      },
      {
        id: "plot3",
        name: "City Center Parking",
        address: "789 Center Blvd, Midtown",
        price: 6,
        availableSlots: 5,
        totalSlots: 20,
        distance: 1.8,
        lat: 40.7148,
        lng: -74.001,
      },
    ];

    return NextResponse.json(nearbyPlots);
  } catch (error) {
    console.error("Error fetching nearby plots:", error);
    return NextResponse.json({ error: "Failed to fetch nearby plots" }, { status: 500 });
  }
}
