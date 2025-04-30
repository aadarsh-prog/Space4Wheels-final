import { getAdminFirestore } from "../firebase-admin"
import { FieldValue } from "firebase-admin/firestore"

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
      throw new Error("Firestore instance is undefined")
    }

    console.log("Creating plot with Firestore instance:", !!db)

    const newPlot = {
      ...plotData,
      availableSlots: plotData.totalSlots,
      rating: 0,
      reviewCount: 0,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    // Use the Firestore instance directly
    const docRef = await db.collection(plotsCollection).add(newPlot)
    console.log("Plot created with ID:", docRef.id)

    return {
      success: true,
      data: {
        id: docRef.id,
        ...newPlot,
      },
    }
  } catch (error) {
    console.error("Error in createPlot:", error)
    return { success: false, error: error.message || "Failed to create plot" }
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
      throw new Error("Firestore instance is undefined")
    }

    const plotRef = db.collection(plotsCollection).doc(plotId)
    const plotSnap = await plotRef.get()

    if (plotSnap.exists) {
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
    return { success: false, error: error.message || "Failed to get plot" }
  }
}

/**
 * Update plot data
 * @param {string} plotId - Plot ID
 * @param {object} plotData - Updated plot data
 * @returns {Promise<object>}
 */
export const updatePlot = async (plotId, plotData) => {
  try {
    const db = getAdminFirestore()

    if (!db) {
      throw new Error("Firestore instance is undefined")
    }

    const plotRef = db.collection(plotsCollection).doc(plotId)

    await plotRef.update({
      ...plotData,
      updatedAt: new Date(),
    })

    return { success: true }
  } catch (error) {
    console.error("Error updating plot:", error)
    return { success: false, error: error.message || "Failed to update plot" }
  }
}

/**
 * Delete plot
 * @param {string} plotId - Plot ID
 * @returns {Promise<object>}
 */
export const deletePlot = async (plotId) => {
  try {
    const db = getAdminFirestore()

    if (!db) {
      throw new Error("Firestore instance is undefined")
    }

    const plotRef = db.collection(plotsCollection).doc(plotId)
    await plotRef.delete()

    return { success: true }
  } catch (error) {
    console.error("Error deleting plot:", error)
    return { success: false, error: error.message || "Failed to delete plot" }
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
      throw new Error("Firestore instance is undefined")
    }

    const plotsRef = db.collection(plotsCollection).where("ownerId", "==", ownerId)
    const snapshot = await plotsRef.get()

    const plots = []
    snapshot.forEach((doc) => {
      plots.push({
        id: doc.id,
        ...doc.data(),
      })
    })

    return { success: true, data: plots }
  } catch (error) {
    console.error("Error getting plots by owner:", error)
    return { success: false, error: error.message || "Failed to get plots" }
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
      throw new Error("Firestore instance is undefined")
    }

    const plotsRef = db.collection(plotsCollection).where("isActive", "==", true)
    const snapshot = await plotsRef.get()

    const plots = []
    snapshot.forEach((doc) => {
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
    return { success: false, error: error.message || "Failed to get nearby plots" }
  }
}

/**
 * Update plot availability
 * @param {string} plotId - Plot ID
 * @param {number} slotsChange - Number of slots to add (positive) or remove (negative)
 * @returns {Promise<object>}
 */
export const updatePlotAvailability = async (plotId, slotsChange) => {
  try {
    const db = getAdminFirestore()

    if (!db) {
      throw new Error("Firestore instance is undefined")
    }

    const plotRef = db.collection(plotsCollection).doc(plotId)

    await plotRef.update({
      availableSlots: FieldValue.increment(slotsChange),
      updatedAt: new Date(),
    })

    return { success: true }
  } catch (error) {
    console.error("Error updating plot availability:", error)
    return { success: false, error: error.message || "Failed to update plot availability" }
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
