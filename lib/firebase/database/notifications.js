import { db } from "../firebase-admin"

const notificationsCollection = "notifications"
const FieldValue = (await import("firebase-admin")).default.firestore.FieldValue

/**
 * Create a new notification
 * @param {object} notificationData - Notification data
 * @returns {Promise<object>} Created notification data with ID
 */
export const createNotification = async (notificationData) => {
  try {
    const notificationsRef = db.collection(notificationsCollection)

    const newNotification = {
      ...notificationData,
      read: false,
      createdAt: FieldValue.serverTimestamp(),
    }

    const docRef = await notificationsRef.add(newNotification)

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
 * @param {number} limitCount - Maximum number of notifications to retrieve
 * @returns {Promise<Array>} Array of notifications
 */
export const getNotificationsByUserId = async (userId, limitCount = 20) => {
  try {
    const notificationsRef = db.collection(notificationsCollection)
    const q = notificationsRef
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .limit(limitCount)

    const querySnapshot = await q.get()

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
    const notificationRef = db.collection(notificationsCollection).doc(notificationId)

    await notificationRef.update({
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
    const notificationsRef = db.collection(notificationsCollection)
    const q = notificationsRef.where("userId", "==", userId).where("read", "==", false)

    const querySnapshot = await q.get()

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
