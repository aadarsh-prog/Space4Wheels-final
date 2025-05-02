import { getAdminFirestore } from "../firebase-admin"
import {
  collection,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  orderBy,
  serverTimestamp,
  increment,
} from "firebase/firestore"

const plotsCollection = "plots"

/**
 * Create a new parking plot
 * @param {object} plotData - Plot data
 * @returns {Promise<object>} Created plot data with ID
 */
export const createPlot = async (plotData) => {
  try {
    const db = getAdminFirestore()
    if (!db) {
      console.error("Firestore instance not available")
      return { success: false, error: "Database connection failed" }
    }

    const plotsRef = collection(db, plotsCollection)

    const newPlot = {
      ...plotData,
      availableSlots: plotData.totalSlots,
      rating: 0,
      reviewCount: 0,
      isActive: true,
      approvalStatus: "pending", // Add approval status
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }

    const docRef = await addDoc(plotsRef, newPlot)

    return {
      success: true,
      data: {
        id: docRef.id,
        ...newPlot,
      },
    }
  } catch (error) {
    console.error("Error creating plot:", error)
    return { success: false, error: error.message }
  }
}

/**
 * Get plot by ID
 * @param {string} plotId - Plot ID
 * @returns {Promise<object|null>} Plot data or null if not found
 */
export const getPlotById = async (plotId) => {
  try {
    const db = getAdminFirestore()
    if (!db) {
      console.error("Firestore instance not available")
      return { success: false, error: "Database connection failed" }
    }

    const plotRef = doc(db, plotsCollection, plotId)
    const plotSnap = await getDoc(plotRef)

    if (plotSnap.exists()) {
      return {
        success: true,
        data: {
          id: plotSnap.id,
          ...plotSnap.data(),
        },
      }
    } else {
      return { success: false, error: "Plot not found" }
    }
  } catch (error) {
    console.error("Error getting plot:", error)
    return { success: false, error: error.message }
  }
}

/**
 * Update plot data
 * @param {string} plotId - Plot ID
 * @param {object} plotData - Updated plot data
 * @returns {Promise<void>}
 */
export const updatePlot = async (plotId, plotData) => {
  try {
    const db = getAdminFirestore()
    if (!db) {
      console.error("Firestore instance not available")
      return { success: false, error: "Database connection failed" }
    }

    const plotRef = doc(db, plotsCollection, plotId)

    await updateDoc(plotRef, {
      ...plotData,
      updatedAt: serverTimestamp(),
    })

    return { success: true }
  } catch (error) {
    console.error("Error updating plot:", error)
    return { success: false, error: error.message }
  }
}

/**
 * Delete plot
 * @param {string} plotId - Plot ID
 * @returns {Promise<void>}
 */
export const deletePlot = async (plotId) => {
  try {
    const db = getAdminFirestore()
    if (!db) {
      console.error("Firestore instance not available")
      return { success: false, error: "Database connection failed" }
    }

    const plotRef = doc(db, plotsCollection, plotId)
    await deleteDoc(plotRef)

    return { success: true }
  } catch (error) {
    console.error("Error deleting plot:", error)
    return { success: false, error: error.message }
  }
}

/**
 * Get plots by owner ID
 * @param {string} ownerId - Owner ID
 * @returns {Promise<Array>} Array of plots
 */
export const getPlotsByOwnerId = async (ownerId) => {
  try {
    const db = getAdminFirestore()
    if (!db) {
      console.error("Firestore instance not available")
      return { success: false, error: "Database connection failed" }
    }

    const plotsRef = collection(db, plotsCollection)
    const q = query(plotsRef, where("ownerId", "==", ownerId), orderBy("createdAt", "desc"))

    const querySnapshot = await getDocs(q)

    const plots = []
    querySnapshot.forEach((doc) => {
      plots.push({
        id: doc.id,
        ...doc.data(),
      })
    })

    return { success: true, data: plots }
  } catch (error) {
    console.error("Error getting plots by owner:", error)
    return { success: false, error: error.message }
  }
}

/**
 * Get nearby plots based on coordinates
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {number} radiusKm - Radius in kilometers
 * @returns {Promise<Array>} Array of nearby plots
 */
export const getNearbyPlots = async (lat, lng, radiusKm = 5) => {
  try {
    const db = getAdminFirestore()
    if (!db) {
      console.error("Firestore instance not available")
      return { success: false, error: "Database connection failed" }
    }

    // Note: For a production app, you would use Firestore's geoqueries
    // or a specialized geospatial database/service
    // This is a simplified version that fetches all plots and filters them

    const plotsRef = collection(db, plotsCollection)
    // Only get approved plots
    const q = query(plotsRef, where("isActive", "==", true), where("approvalStatus", "==", "approved"))

    const querySnapshot = await getDocs(q)

    const plots = []
    querySnapshot.forEach((doc) => {
      const plotData = doc.data()

      // Calculate distance (simplified version using Haversine formula)
      const distance = calculateDistance(lat, lng, plotData.lat, plotData.lng)

      // Only include plots within the radius
      if (distance <= radiusKm) {
        plots.push({
          id: doc.id,
          ...plotData,
          distance: Number.parseFloat(distance.toFixed(1)),
        })
      }
    })

    // Sort by distance
    plots.sort((a, b) => a.distance - b.distance)

    return { success: true, data: plots }
  } catch (error) {
    console.error("Error getting nearby plots:", error)
    return { success: false, error: error.message }
  }
}

/**
 * Get pending approval plots
 * @returns {Promise<Array>} Array of pending plots
 */
export const getPendingPlots = async () => {
  try {
    const db = getAdminFirestore()
    if (!db) {
      console.error("Firestore instance not available")
      return { success: false, error: "Database connection failed" }
    }

    const plotsRef = collection(db, plotsCollection)
    const q = query(plotsRef, where("approvalStatus", "==", "pending"), orderBy("createdAt", "desc"))

    const querySnapshot = await getDocs(q)

    const plots = []
    querySnapshot.forEach((doc) => {
      plots.push({
        id: doc.id,
        ...doc.data(),
      })
    })

    return { success: true, data: plots }
  } catch (error) {
    console.error("Error getting pending plots:", error)
    return { success: false, error: error.message }
  }
}

/**
 * Approve a plot
 * @param {string} plotId - Plot ID
 * @returns {Promise<object>} Result
 */
export const approvePlot = async (plotId) => {
  try {
    const db = getAdminFirestore()
    if (!db) {
      console.error("Firestore instance not available")
      return { success: false, error: "Database connection failed" }
    }

    const plotRef = doc(db, plotsCollection, plotId)

    await updateDoc(plotRef, {
      approvalStatus: "approved",
      approvedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })

    return { success: true }
  } catch (error) {
    console.error("Error approving plot:", error)
    return { success: false, error: error.message }
  }
}

/**
 * Reject a plot
 * @param {string} plotId - Plot ID
 * @param {string} reason - Rejection reason
 * @returns {Promise<object>} Result
 */
export const rejectPlot = async (plotId, reason) => {
  try {
    const db = getAdminFirestore()
    if (!db) {
      console.error("Firestore instance not available")
      return { success: false, error: "Database connection failed" }
    }

    const plotRef = doc(db, plotsCollection, plotId)

    await updateDoc(plotRef, {
      approvalStatus: "rejected",
      rejectionReason: reason,
      rejectedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })

    return { success: true }
  } catch (error) {
    console.error("Error rejecting plot:", error)
    return { success: false, error: error.message }
  }
}

/**
 * Update plot availability
 * @param {string} plotId - Plot ID
 * @param {number} slotsChange - Number of slots to add (positive) or remove (negative)
 * @returns {Promise<void>}
 */
export const updatePlotAvailability = async (plotId, slotsChange) => {
  try {
    const db = getAdminFirestore()
    if (!db) {
      console.error("Firestore instance not available")
      return { success: false, error: "Database connection failed" }
    }

    const plotRef = doc(db, plotsCollection, plotId)

    await updateDoc(plotRef, {
      availableSlots: increment(slotsChange),
      updatedAt: serverTimestamp(),
    })

    return { success: true }
  } catch (error) {
    console.error("Error updating plot availability:", error)
    return { success: false, error: error.message }
  }
}

/**
 * Update plot rating when a new review is added
 * @param {string} plotId - Plot ID
 * @param {number} newRating - New rating value
 * @returns {Promise<void>}
 */
export const updatePlotRating = async (plotId, newRating) => {
  try {
    const db = getAdminFirestore()
    if (!db) {
      console.error("Firestore instance not available")
      return { success: false, error: "Database connection failed" }
    }

    const plotRef = doc(db, plotsCollection, plotId)
    const plotSnap = await getDoc(plotRef)

    if (!plotSnap.exists()) {
      return { success: false, error: "Plot not found" }
    }

    const plotData = plotSnap.data()
    const currentReviewCount = plotData.reviewCount || 0
    const currentRating = plotData.rating || 0

    // Calculate new average rating
    const newReviewCount = currentReviewCount + 1
    const newAverageRating = (currentRating * currentReviewCount + newRating) / newReviewCount

    await updateDoc(plotRef, {
      rating: Number.parseFloat(newAverageRating.toFixed(1)),
      reviewCount: newReviewCount,
      updatedAt: serverTimestamp(),
    })

    return { success: true }
  } catch (error) {
    console.error("Error updating plot rating:", error)
    return { success: false, error: error.message }
  }
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - Latitude of point 1
 * @param {number} lon1 - Longitude of point 1
 * @param {number} lat2 - Latitude of point 2
 * @param {number} lon2 - Longitude of point 2
 * @returns {number} Distance in kilometers
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371 // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1)
  const dLon = deg2rad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c // Distance in km
  return distance
}

function deg2rad(deg) {
  return deg * (Math.PI / 180)
}
