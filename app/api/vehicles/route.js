import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { authDb } from "@/lib/firebase/admin-database"
import { vehiclesDb } from "@/lib/firebase/admin-database"
import { initAdmin } from "@/lib/firebase/firebase-admin"

initAdmin()

async function getUserFromSession() {
  const cookiesStore = await cookies()
  const sessionCookie = cookiesStore.get("session")?.value

  if (!sessionCookie) return null

  const verifyResult = await authDb.verifySessionCookie(sessionCookie)
  if (!verifyResult.success) return null

  return verifyResult.data
}

export async function GET(request) {
  try {
    const user = await getUserFromSession()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const result = await vehiclesDb.getUserVehicles(user.uid)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({ success: true, data: result.data })
  } catch (error) {
    console.error("Error fetching vehicles:", error)
    return NextResponse.json({ error: "Failed to fetch vehicles" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const user = await getUserFromSession()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const vehicleData = await request.json()
    const result = await vehiclesDb.addVehicle(user.uid, vehicleData)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({ success: true, data: result.data })
  } catch (error) {
    console.error("Error adding vehicle:", error)
    return NextResponse.json({ error: "Failed to add vehicle" }, { status: 500 })
  }
}
