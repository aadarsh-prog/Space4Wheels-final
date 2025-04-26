import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    // In a real app, you would fetch user data from Firestore
    // For demo purposes, we'll return mock data
    const userId = params.id;

    // Mock user data
    const userData = {
      uid: userId,
      name: "John Doe",
      email: "john@example.com",
      role: "owner", // or "owner"
      createdAt: "2023-01-01T00:00:00.000Z",
    };

    return NextResponse.json(userData);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json({ error: "Failed to fetch user data" }, { status: 500 });
  }
}