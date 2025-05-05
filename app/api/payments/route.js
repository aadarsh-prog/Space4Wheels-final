import { NextResponse } from "next/server"
import adminDbService from "@/lib/firebase/admin-database"
import { initAdmin } from "@/lib/firebase/firebase-admin"

export async function POST(request) {
  try {
    // Initialize Firebase Admin
    initAdmin()

    const data = await request.json()
    const { bookingId, method, status, transactionId, amount } = data

    console.log("Processing payment:", { bookingId, method, status, transactionId, amount })

    // Validate required fields
    if (!bookingId || !method || !status || !amount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Process payment
    const paymentData = {
      bookingId,
      method,
      status,
      transactionId: transactionId || `tx_${Date.now()}`,
      amount,
      createdAt: new Date().toISOString(),
    }

    // In a real app, you would process the payment with a payment gateway
    // For demo purposes, we'll simulate a successful payment

    // Update booking payment status
    const updateResult = await adminDbService.bookings.updateBookingPayment(
      bookingId,
      status === "completed" ? "paid" : "failed",
      method,
      paymentData.transactionId,
    )

    if (!updateResult.success) {
      console.error("Failed to update booking payment:", updateResult.error)
      return NextResponse.json({ error: updateResult.error }, { status: 400 })
    }

    // If payment is successful, update booking status to confirmed
    if (status === "completed") {
      await adminDbService.bookings.updateBookingStatus(bookingId, "confirmed")
    }

    return NextResponse.json({
      success: true,
      message: "Payment processed successfully",
      paymentId: `pay_${Date.now()}`,
      ...paymentData,
    })
  } catch (error) {
    console.error("Error processing payment:", error)
    return NextResponse.json({ error: "Failed to process payment" }, { status: 500 })
  }
}
