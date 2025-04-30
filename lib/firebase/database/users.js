import { db } from "../firebaseAdmin"

const usersCollection = "users"

/**
 * Create a new user in Firestore
 * @param {string} uid - User ID from Firebase Auth
 * @param {object} userData - User data
 * @returns {Promise<void>}
 */
export const createUser = async (uid, userData) => {
  try {
    const userRef = db.collection(usersCollection).doc(uid)

    await userRef.set({
      uid,
      ...userData,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      notificationPreferences: {
        email: true,
        push: true,
        sms: false,
      },
    })

    return { success: true }
  } catch (error) {
    console.error("Error creating user:", error)
    return { success: false, error }
  }
}

/**
 * Get user by ID
 * @param {string} uid - User ID
 * @returns {Promise<object|null>} User data or null if not found
 */
export const getUserById = async (uid) => {
  try {
    const userRef = db.collection(usersCollection).doc(uid)
    const userSnap = await userRef.get()

    if (userSnap.exists) {
      return { success: true, data: userSnap.data() }
    } else {
      return { success: false, error: "User not found" }
    }
  } catch (error) {
    console.error("Error getting user:", error)
    return { success: false, error }
  }
}

/**
 * Update user data
 * @param {string} uid - User ID
 * @param {object} userData - Updated user data
 * @returns {Promise<void>}
 */
export const updateUser = async (uid, userData) => {
  try {
    const userRef = db.collection(usersCollection).doc(uid)

    await userRef.update({
      ...userData,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    })

    return { success: true }
  } catch (error) {
    console.error("Error updating user:", error)
    return { success: false, error }
  }
}

/**
 * Update user notification preferences
 * @param {string} uid - User ID
 * @param {object} preferences - Notification preferences
 * @returns {Promise<void>}
 */
export const updateNotificationPreferences = async (uid, preferences) => {
  try {
    const userRef = db.collection(usersCollection).doc(uid)

    await userRef.update({
      notificationPreferences: preferences,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    })

    return { success: true }
  } catch (error) {
    console.error("Error updating notification preferences:", error)
    return { success: false, error }
  }
}

/**
 * Get users by role
 * @param {string} role - User role ('user' or 'owner')
 * @returns {Promise<Array>} Array of users
 */
export const getUsersByRole = async (role) => {
  try {
    const usersRef = db.collection(usersCollection)
    const querySnapshot = await usersRef.where("role", "==", role).get()

    const users = []
    querySnapshot.forEach((doc) => {
      users.push(doc.data())
    })

    return { success: true, data: users }
  } catch (error) {
    console.error("Error getting users by role:", error)
    return { success: false, error }
  }
}
