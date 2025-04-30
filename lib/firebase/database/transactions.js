import { db } from "../firebase-admin"
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  orderBy,
  serverTimestamp,
} from "firebase/firestore"
import { updatePlotRating } from "./plots"

const reviewsCollection = "reviews"

/**
 * Create a new review
 * @param {object} reviewData - Review data
 * @returns {Promise<object>} Created review data with ID
 */
export const createReview = async (reviewData) => {
  try {
    const reviewsRef = collection(db, reviewsCollection)

    const newReview = {
      ...reviewData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }

    const docRef = await addDoc(reviewsRef, newReview)

    // Update plot rating
    await updatePlotRating(reviewData.plotId, reviewData.rating)

    return {
      success: true,
      data: {
        id: docRef.id,
        ...newReview,
      },
    }
  } catch (error) {
    console.error("Error creating review:", error)
    return { success: false, error }
  }
}

/**
 * Get reviews by plot ID
 * @param {string} plotId - Plot ID
 * @returns {Promise<Array>} Array of reviews
 */
export const getReviewsByPlotId = async (plotId) => {
  try {
    const reviewsRef = collection(db, reviewsCollection)
    const q = query(reviewsRef, where("plotId", "==", plotId), orderBy("createdAt", "desc"))

    const querySnapshot = await getDocs(q)

    const reviews = []
    querySnapshot.forEach((doc) => {
      reviews.push({
        id: doc.id,
        ...doc.data(),
      })
    })

    return { success: true, data: reviews }
  } catch (error) {
    console.error("Error getting reviews by plot:", error)
    return { success: false, error }
  }
}

/**
 * Get reviews by user ID
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of reviews
 */
export const getReviewsByUserId = async (userId) => {
  try {
    const reviewsRef = collection(db, reviewsCollection)
    const q = query(reviewsRef, where("userId", "==", userId), orderBy("createdAt", "desc"))

    const querySnapshot = await getDocs(q)

    const reviews = []
    querySnapshot.forEach((doc) => {
      reviews.push({
        id: doc.id,
        ...doc.data(),
      })
    })

    return { success: true, data: reviews }
  } catch (error) {
    console.error("Error getting reviews by user:", error)
    return { success: false, error }
  }
}

/**
 * Update review
 * @param {string} reviewId - Review ID
 * @param {object} reviewData - Updated review data
 * @returns {Promise<void>}
 */
export const updateReview = async (reviewId, reviewData) => {
  try {
    const reviewRef = doc(db, reviewsCollection, reviewId)

    await updateDoc(reviewRef, {
      ...reviewData,
      updatedAt: serverTimestamp(),
    })

    return { success: true }
  } catch (error) {
    console.error("Error updating review:", error)
    return { success: false, error }
  }
}

/**
 * Delete review
 * @param {string} reviewId - Review ID
 * @returns {Promise<void>}
 */
export const deleteReview = async (reviewId) => {
  try {
    const reviewRef = doc(db, reviewsCollection, reviewId)
    await deleteDoc(reviewRef)

    // Note: In a production app, you would also update the plot rating
    // This would require more complex logic to recalculate the average

    return { success: true }
  } catch (error) {
    console.error("Error deleting review:", error)
    return { success: false, error }
  }
}
