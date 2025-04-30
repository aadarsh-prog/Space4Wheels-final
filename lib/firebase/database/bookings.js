import { db } from "../firebase-provider"
import {
  collection,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  query,
  where,
  getDocs,
  orderBy,
  serverTimestamp,
} from "firebase/firestore"
import { updatePlotAvailability } from "./plots"

const bookingsCollection = "bookings"

/**
 * Create a new booking
 * @param {object} bookingData - Booking data
 * @returns {Promise<object>} Created booking data with ID
 */
export const createBooking = async (bookingData) => {
  try {
    const bookingsRef = collection(db, bookingsCollection)

    const newBooking = {
      ...bookingData,
      status: "pending",
      paymentStatus: "pending",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }

    const docRef = await addDoc(bookingsRef, newBooking)

    // Update plot availability (decrease available slots)
    await updatePlotAvailability(bookingData.plotId, -1)

    return {
      success: true,
      data: {
        id: docRef.id,
        ...newBooking,
      },
    }
  } catch (error) {
    console.error("Error creating booking:", error)
    return { success: false, error }
  }
}

/**
 * Get booking by ID
 * @param {string} bookingId - Booking ID
 * @returns {Promise<object|null>} Booking data or null if not found
 */
export const getBookingById = async (bookingId) => {
  try {
    const bookingRef = doc(db, bookingsCollection, bookingId)
    const bookingSnap = await getDoc(bookingRef)

    if (bookingSnap.exists()) {
      return {
        success: true,
        data: {
          id: bookingSnap.id,
          ...bookingSnap.data(),
        },
      }
    } else {
      return { success: false, error: "Booking not found" }
    }
  } catch (error) {
    console.error("Error getting booking:", error)
    return { success: false, error }
  }
}

/**
 * Update booking status
 * @param {string} bookingId - Booking ID
 * @param {string} status - New status
 * @returns {Promise<void>}
 */
export const updateBookingStatus = async (bookingId, status) => {
  try {
    const bookingRef = doc(db, bookingsCollection, bookingId)
    const bookingSnap = await getDoc(bookingRef)

    if (!bookingSnap.exists()) {
      return { success: false, error: "Booking not found" }
    }

    const bookingData = bookingSnap.data()
    const oldStatus = bookingData.status

    await updateDoc(bookingRef, {
      status,
      updatedAt: serverTimestamp(),
    })

    // If cancelling a booking, increase available slots
    if (oldStatus !== "cancelled" && status === "cancelled") {
      await updatePlotAvailability(bookingData.plotId, 1)
    }

    return { success: true }
  } catch (error) {
    console.error("Error updating booking status:", error)
    return { success: false, error }
  }
}

/**
 * Update booking payment status
 * @param {string} bookingId - Booking ID
 * @param {string} paymentStatus - New payment status
 * @param {string} paymentMethod - Payment method
 * @param {string} paymentId - Payment ID
 * @returns {Promise<void>}
 */
export const updateBookingPayment = async (bookingId, paymentStatus, paymentMethod, paymentId) => {
  try {
    const bookingRef = doc(db, bookingsCollection, bookingId)

    await updateDoc(bookingRef, {
      paymentStatus,
      paymentMethod,
      paymentId,
      updatedAt: serverTimestamp(),
    })

    return { success: true }
  } catch (error) {
    console.error("Error updating booking payment:", error)
    return { success: false, error }
  }
}

/**
 * Get bookings by user ID
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of bookings
 */
export const getBookingsByUserId = async (userId) => {
  try {
    const bookingsRef = collection(db, bookingsCollection)
    const q = query(bookingsRef, where("userId", "==", userId), orderBy("createdAt", "desc"))

    const querySnapshot = await getDocs(q)

    const bookings = []
    querySnapshot.forEach((doc) => {
      bookings.push({
        id: doc.id,
        ...doc.data(),
      })
    })

    return { success: true, data: bookings }
  } catch (error) {
    console.error("Error getting bookings by user:", error)
    return { success: false, error }
  }
}

/**
 * Get bookings by plot ID
 * @param {string} plotId - Plot ID
 * @returns {Promise<Array>} Array of bookings
 */
export const getBookingsByPlotId = async (plotId) => {
  try {
    const bookingsRef = collection(db, bookingsCollection)
    const q = query(bookingsRef, where("plotId", "==", plotId), orderBy("createdAt", "desc"))

    const querySnapshot = await getDocs(q)

    const bookings = []
    querySnapshot.forEach((doc) => {
      bookings.push({
        id: doc.id,
        ...doc.data(),
      })
    })

    return { success: true, data: bookings }
  } catch (error) {
    console.error("Error getting bookings by plot:", error)
    return { success: false, error }
  }
}

/**
 * Get upcoming bookings by user ID
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of upcoming bookings
 */
export const getUpcomingBookingsByUserId = async (userId) => {
  try {
    const bookingsRef = collection(db, bookingsCollection)
    const today = new Date().toISOString().split("T")[0] // YYYY-MM-DD

    const q = query(
      bookingsRef,
      where("userId", "==", userId),
      where("date", ">=", today),
      where("status", "==", "confirmed"),
      orderBy("date", "asc"),
    )

    const querySnapshot = await getDocs(q)

    const bookings = []
    querySnapshot.forEach((doc) => {
      bookings.push({
        id: doc.id,
        ...doc.data(),
      })
    })

    return { success: true, data: bookings }
  } catch (error) {
    console.error("Error getting upcoming bookings:", error)
    return { success: false, error }
  }
}
