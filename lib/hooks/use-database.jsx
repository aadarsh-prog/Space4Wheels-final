"use client"

import { useState } from "react"
import { useAuth } from "@/lib/firebase/auth-context"

export function useDatabase() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // User-related functions
  const getUserById = async (userId) => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`/api/users/${userId}`)
      if (!response.ok) {
        throw new Error(`Error fetching user: ${response.statusText}`)
      }
      const data = await response.json()
      return data
    } catch (err) {
      setError(err.message)
      console.error("Error in getUserById:", err)
      return null
    } finally {
      setLoading(false)
    }
  }

  // Plot-related functions
  const getPlots = async (filters = {}) => {
    try {
      setLoading(true)
      setError(null)

      // Build query string from filters
      const queryParams = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value)
        }
      })

      const response = await fetch(`/api/plots?${queryParams.toString()}`)
      if (!response.ok) {
        throw new Error(`Error fetching plots: ${response.statusText}`)
      }
      const data = await response.json()
      return data
    } catch (err) {
      setError(err.message)
      console.error("Error in getPlots:", err)
      return []
    } finally {
      setLoading(false)
    }
  }

  const getPlotById = async (plotId) => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`/api/plots/${plotId}`)
      if (!response.ok) {
        throw new Error(`Error fetching plot: ${response.statusText}`)
      }
      const data = await response.json()
      return data
    } catch (err) {
      setError(err.message)
      console.error("Error in getPlotById:", err)
      return null
    } finally {
      setLoading(false)
    }
  }

  const createPlot = async (plotData) => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch("/api/plots", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(plotData),
      })
      if (!response.ok) {
        throw new Error(`Error creating plot: ${response.statusText}`)
      }
      const data = await response.json()
      return data
    } catch (err) {
      setError(err.message)
      console.error("Error in createPlot:", err)
      return null
    } finally {
      setLoading(false)
    }
  }

  const updatePlot = async (plotId, plotData) => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`/api/plots/${plotId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(plotData),
      })
      if (!response.ok) {
        throw new Error(`Error updating plot: ${response.statusText}`)
      }
      const data = await response.json()
      return data
    } catch (err) {
      setError(err.message)
      console.error("Error in updatePlot:", err)
      return null
    } finally {
      setLoading(false)
    }
  }

  const deletePlot = async (plotId) => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`/api/plots/${plotId}`, {
        method: "DELETE",
      })
      if (!response.ok) {
        throw new Error(`Error deleting plot: ${response.statusText}`)
      }
      return true
    } catch (err) {
      setError(err.message)
      console.error("Error in deletePlot:", err)
      return false
    } finally {
      setLoading(false)
    }
  }

  const getNearbyPlots = async (lat, lng, radius = 5) => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`/api/plots/nearby?lat=${lat}&lng=${lng}&radius=${radius}`)
      if (!response.ok) {
        throw new Error(`Error fetching nearby plots: ${response.statusText}`)
      }
      const data = await response.json()
      return data
    } catch (err) {
      setError(err.message)
      console.error("Error in getNearbyPlots:", err)
      return []
    } finally {
      setLoading(false)
    }
  }

  // Booking-related functions
  const getBookings = async (filters = {}) => {
    try {
      setLoading(true)
      setError(null)

      // Build query string from filters
      const queryParams = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value)
        }
      })

      const response = await fetch(`/api/bookings?${queryParams.toString()}`)
      if (!response.ok) {
        throw new Error(`Error fetching bookings: ${response.statusText}`)
      }
      const data = await response.json()
      return data
    } catch (err) {
      setError(err.message)
      console.error("Error in getBookings:", err)
      return []
    } finally {
      setLoading(false)
    }
  }

  const getBookingById = async (bookingId) => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`/api/bookings/${bookingId}`)
      if (!response.ok) {
        throw new Error(`Error fetching booking: ${response.statusText}`)
      }
      const data = await response.json()
      return data
    } catch (err) {
      setError(err.message)
      console.error("Error in getBookingById:", err)
      return null
    } finally {
      setLoading(false)
    }
  }

  const createBooking = async (bookingData) => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingData),
      })
      if (!response.ok) {
        throw new Error(`Error creating booking: ${response.statusText}`)
      }
      const data = await response.json()
      return data
    } catch (err) {
      setError(err.message)
      console.error("Error in createBooking:", err)
      return null
    } finally {
      setLoading(false)
    }
  }

  const updateBookingStatus = async (bookingId, status) => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`/api/bookings/${bookingId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      })
      if (!response.ok) {
        throw new Error(`Error updating booking status: ${response.statusText}`)
      }
      const data = await response.json()
      return data
    } catch (err) {
      setError(err.message)
      console.error("Error in updateBookingStatus:", err)
      return null
    } finally {
      setLoading(false)
    }
  }

  const cancelBooking = async (bookingId) => {
    return updateBookingStatus(bookingId, "cancelled")
  }

  // Review-related functions
  const addReview = async (plotId, rating, comment) => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          plotId,
          userId: user.uid,
          userName: user.displayName || "Anonymous",
          rating,
          comment,
        }),
      })
      if (!response.ok) {
        throw new Error(`Error adding review: ${response.statusText}`)
      }
      const data = await response.json()
      return data
    } catch (err) {
      setError(err.message)
      console.error("Error in addReview:", err)
      return null
    } finally {
      setLoading(false)
    }
  }

  const getReviewsByPlotId = async (plotId) => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`/api/reviews?plotId=${plotId}`)
      if (!response.ok) {
        throw new Error(`Error fetching reviews: ${response.statusText}`)
      }
      const data = await response.json()
      return data
    } catch (err) {
      setError(err.message)
      console.error("Error in getReviewsByPlotId:", err)
      return []
    } finally {
      setLoading(false)
    }
  }

  // Admin-specific functions
  const getAdminStats = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch("/api/admin/stats")
      if (!response.ok) {
        throw new Error(`Error fetching admin stats: ${response.statusText}`)
      }
      const data = await response.json()
      return data
    } catch (err) {
      setError(err.message)
      console.error("Error in getAdminStats:", err)
      return null
    } finally {
      setLoading(false)
    }
  }

  const approvePlot = async (plotId) => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`/api/admin/plots/${plotId}/approve`, {
        method: "PUT",
      })
      if (!response.ok) {
        throw new Error(`Error approving plot: ${response.statusText}`)
      }
      const data = await response.json()
      return data
    } catch (err) {
      setError(err.message)
      console.error("Error in approvePlot:", err)
      return null
    } finally {
      setLoading(false)
    }
  }

  const rejectPlot = async (plotId, reason) => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`/api/admin/plots/${plotId}/reject`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason }),
      })
      if (!response.ok) {
        throw new Error(`Error rejecting plot: ${response.statusText}`)
      }
      const data = await response.json()
      return data
    } catch (err) {
      setError(err.message)
      console.error("Error in rejectPlot:", err)
      return null
    } finally {
      setLoading(false)
    }
  }

  // Payment-related functions
  const processPayment = async (bookingId, paymentDetails) => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`/api/payments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookingId,
          ...paymentDetails,
        }),
      })
      if (!response.ok) {
        throw new Error(`Error processing payment: ${response.statusText}`)
      }
      const data = await response.json()
      return data
    } catch (err) {
      setError(err.message)
      console.error("Error in processPayment:", err)
      return null
    } finally {
      setLoading(false)
    }
  }

  return {
    // State
    loading,
    error,

    // User functions
    getUserById,

    // Plot functions
    getPlots,
    getPlotById,
    createPlot,
    updatePlot,
    deletePlot,
    getNearbyPlots,

    // Booking functions
    getBookings,
    getBookingById,
    createBooking,
    updateBookingStatus,
    cancelBooking,

    // Review functions
    addReview,
    getReviewsByPlotId,

    // Admin functions
    getAdminStats,
    approvePlot,
    rejectPlot,

    // Payment functions
    processPayment,
  }
}
