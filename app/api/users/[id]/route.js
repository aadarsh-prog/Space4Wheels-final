import { NextResponse } from "next/server"
import { getUserById } from "@/lib/firebase/database/users" // <-- correct import

export async function GET(request, { params }) {
  try {
    const { id } = await params
    const result = await getUserById(id)

    console.log("getting request ")

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 404 })
    }

    return NextResponse.json(result.data)
  } catch (error) {
    console.error("Unhandled error fetching user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}