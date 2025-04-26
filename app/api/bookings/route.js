import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    // In a real app, you would fetch bookings from Firestore
    // For demo purposes, we'll return mock data
    const bookings = [
      {
        id: "booking1",
        userId: "user123",
        plotId: "plot1",
        plotName: "Downtown Parking",
        address: "123 Main St, Downtown",
        date: "2023-05-15",
        startTime: "10:00 AM",
        endTime: "12:00 PM",
        price: 10,
        status: "upcoming",
        createdAt: "2023-05-01T00:00:00.000Z",
      },
      {
        id: "booking2",
        userId: "user123",
        plotId: "plot2",
        plotName: "Central Mall Parking",
        address: "456 Market Ave, Central",
        date: "2023-05-10",
        startTime: "2:00 PM",
        endTime: "4:00 PM",
        price: 14,
        status: "completed",
        createdAt: "2023-04-25T00:00:00.000Z",
      },
    ];

    // Filter by user if userId is provided
    const filteredBookings = userId
      ? bookings.filter((booking) => booking.userId === userId)
      : bookings;

    return NextResponse.json(filteredBookings);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const bookingData = await request.json();

    // In a real app, you would add the booking to Firestore
    // For demo purposes, we'll just return the data with an ID
    const newBooking = {
      id: `booking${Date.now()}`,
      ...bookingData,
      status: "upcoming",
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json(newBooking, { status: 201 });
  } catch (error) {
    console.error("Error creating booking:", error);
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 }
    );
  }
}
