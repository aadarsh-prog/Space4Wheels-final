"use client"

import { useState, useCallback } from "react"
import { useFirebase } from "@/lib/firebase/firebase-provider"
import { useAuth } from "@/lib/firebase/auth-context"
import dbService from "@/lib/firebase/database"

export function useDatabase() {
  const { db } = useFirebase()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // User functions
  const getUserProfile = useCallback(async () => {
    if (!user) return null

    setLoading(true)
    setError(null)

    try {
      const result = await dbService.users.getUserById(user.uid)
      return result.success ? result.data : null
    } catch (err) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }, [user])

  const updateUserProfile = useCallback(
    async (userData) => {
      if (!user) return false

      setLoading(true)
      setError(null)

      try {
        const result = await dbService.users.updateUser(user.uid, userData)
        return result.success
      } catch (err) {
        setError(err.message)
        return false
      } finally {
        setLoading(false)
      }
    },
    [user],
  )

  // Plot functions
  const createPlot = useCallback(
    async (plotData) => {
      if (!user) return null

      setLoading(true)
      setError(null)

      try {
        // Add owner information
        const enhancedPlotData = {
          ...plotData,
          ownerId: user.uid,
          ownerName: user.displayName || user.email,
        }

        const result = await dbService.plots.createPlot(enhancedPlotData)
        return result.success ? result.data : null
      } catch (err) {
        setError(err.message)
        return null
      } finally {
        setLoading(false)
      }
    },
    [user],
  )

  const getPlotById = useCallback(async (plotId) => {
    setLoading(true)
    setError(null)

    try {
      const result = await dbService.plots.getPlotById(plotId)
      return result.success ? result.data : null
    } catch (err) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const getMyPlots = useCallback(async () => {
    if (!user) return []

    setLoading(true)
    setError(null)

    try {
      const result = await dbService.plots.getPlotsByOwnerId(user.uid)
      return result.success ? result.data : []
    } catch (err) {
      setError(err.message)
      return []
    } finally {
      setLoading(false)
    }
  }, [user])

  const getNearbyPlots = useCallback(async (lat, lng, radius = 5) => {
    setLoading(true)
    setError(null)

    try {
      const result = await dbService.plots.getNearbyPlots(lat, lng, radius)
      return result.success ? result.data : []
    } catch (err) {
      setError(err.message)
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  // Booking functions
  const createBooking = useCallback(
    async (bookingData) => {
      if (!user) return null

      setLoading(true)
      setError(null)

      try {
        // Add user information
        const enhancedBookingData = {
          ...bookingData,
          userId: user.uid,
          userName: user.displayName || user.email,
        }

        const result = await dbService.bookings.createBooking(enhancedBookingData)
        return result.success ? result.data : null
      } catch (err) {
        setError(err.message)
        return null
      } finally {
        setLoading(false)
      }
    },
    [user],
  )

  const getMyBookings = useCallback(async () => {
    if (!user) return []

    setLoading(true)
    setError(null)

    try {
      const result = await dbService.bookings.getBookingsByUserId(user.uid)
      return result.success ? result.data : []
    } catch (err) {
      setError(err.message)
      return []
    } finally {
      setLoading(false)
    }
  }, [user])

  const getBookingById = useCallback(async (bookingId) => {
    setLoading(true)
    setError(null)

    try {
      const result = await dbService.bookings.getBookingById(bookingId)
      return result.success ? result.data : null
    } catch (err) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const cancelBooking = useCallback(
    async (bookingId) => {
      if (!user) return false

      setLoading(true)
      setError(null)

      try {
        const result = await dbService.bookings.updateBookingStatus(bookingId, "cancelled")
        return result.success
      } catch (err) {
        setError(err.message)
        return false
      } finally {
        setLoading(false)
      }
    },
    [user],
  )

  // Review functions
  const addReview = useCallback(
    async (plotId, rating, comment) => {
      if (!user) return null

      setLoading(true)
      setError(null)

      try {
        const reviewData = {
          userId: user.uid,
          userName: user.displayName || user.email,
          plotId,
          rating,
          comment,
        }

        const result = await dbService.reviews.createReview(reviewData)
        return result.success ? result.data : null
      } catch (err) {
        setError(err.message)
        return null
      } finally {
        setLoading(false)
      }
    },
    [user],
  )

  const getPlotReviews = useCallback(async (plotId) => {
    setLoading(true)
    setError(null)

    try {
      const result = await dbService.reviews.getReviewsByPlotId(plotId)
      return result.success ? result.data : []
    } catch (err) {
      setError(err.message)
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  // Notification functions
  const getMyNotifications = useCallback(async () => {
    if (!user) return []

    setLoading(true)
    setError(null)

    try {
      const result = await dbService.notifications.getNotificationsByUserId(user.uid)
      return result.success ? result.data : []
    } catch (err) {
      setError(err.message)
      return []
    } finally {
      setLoading(false)
    }
  }, [user])

  const markNotificationRead = useCallback(
    async (notificationId) => {
      if (!user) return false

      setLoading(true)
      setError(null)

      try {
        const result = await dbService.notifications.markNotificationAsRead(notificationId)
        return result.success
      } catch (err) {
        setError(err.message)
        return false
      } finally {
        setLoading(false)
      }
    },
    [user],
  )

  return {
    // State
    loading,
    error,

    // User functions
    getUserProfile,
    updateUserProfile,

    // Plot functions
    createPlot,
    getPlotById,
    getMyPlots,
    getNearbyPlots,

    // Booking functions
    createBooking,
    getMyBookings,
    getBookingById,
    cancelBooking,

    // Review functions
    addReview,
    getPlotReviews,

    // Notification functions
    getMyNotifications,
    markNotificationRead,
  }
}
