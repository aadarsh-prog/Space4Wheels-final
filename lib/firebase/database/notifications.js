import { db } from "../firebase-provider"
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  serverTimestamp,
} from "firebase/firestore"

const notificationsCollection = "notifications"

/**
 * Create a new notification
 * @param {object} notificationData - Notification data
 * @returns {Promise<object>} Created notification data with ID
 */
export const createNotification = async (notificationData) => {
  try {
    const notificationsRef = collection(db, notificationsCollection)

    const newNotification = {
      ...notificationData,
      read: false,
      createdAt: serverTimestamp(),
    }

    const docRef = await addDoc(notificationsRef, newNotification)

    return {
      success: true,
      data: {
        id: docRef.id,
        ...newNotification,
      },
    }
  } catch (error) {
    console.error("Error creating notification:", error)
    return { success: false, error }
  }
}

/**
 * Get notifications by user ID
 * @param {string} userId - User ID
 * @param {number} limit - Maximum number of notifications to retrieve
 * @returns {Promise<Array>} Array of notifications
 */
export const getNotificationsByUserId = async (userId, limitCount = 20) => {
  try {
    const notificationsRef = collection(db, notificationsCollection)
    const q = query(notificationsRef, where("userId", "==", userId), orderBy("createdAt", "desc"), limit(limitCount))

    const querySnapshot = await getDocs(q)

    const notifications = []
    querySnapshot.forEach((doc) => {
      notifications.push({
        id: doc.id,
        ...doc.data(),
      })
    })

    return { success: true, data: notifications }
  } catch (error) {
    console.error("Error getting notifications:", error)
    return { success: false, error }
  }
}

/**
 * Mark notification as read
 * @param {string} notificationId - Notification ID
 * @returns {Promise<void>}
 */
export const markNotificationAsRead = async (notificationId) => {
  try {
    const notificationRef = doc(db, notificationsCollection, notificationId)

    await updateDoc(notificationRef, {
      read: true,
    })

    return { success: true }
  } catch (error) {
    console.error("Error marking notification as read:", error)
    return { success: false, error }
  }
}

/**
 * Mark all notifications as read for a user
 * @param {string} userId - User ID
 * @returns {Promise<void>}
 */
export const markAllNotificationsAsRead = async (userId) => {
  try {
    const notificationsRef = collection(db, notificationsCollection)
    const q = query(notificationsRef, where("userId", "==", userId), where("read", "==", false))

    const querySnapshot = await getDocs(q)

    const batch = db.batch()
    querySnapshot.forEach((doc) => {
      const notificationRef = doc.ref
      batch.update(notificationRef, { read: true })
    })

    await batch.commit()

    return { success: true }
  } catch (error) {
    console.error("Error marking all notifications as read:", error)
    return { success: false, error }
  }
}
