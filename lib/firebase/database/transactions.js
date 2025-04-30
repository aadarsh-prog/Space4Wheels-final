import { db } from "../firebase-provider"
import { collection, doc, addDoc, updateDoc, query, where, getDocs, orderBy, serverTimestamp } from "firebase/firestore"

const transactionsCollection = "transactions"

/**
 * Create a new transaction
 * @param {object} transactionData - Transaction data
 * @returns {Promise<object>} Created transaction data with ID
 */
export const createTransaction = async (transactionData) => {
  try {
    const transactionsRef = collection(db, transactionsCollection)

    const newTransaction = {
      ...transactionData,
      createdAt: serverTimestamp(),
    }

    const docRef = await addDoc(transactionsRef, newTransaction)

    return {
      success: true,
      data: {
        id: docRef.id,
        ...newTransaction,
      },
    }
  } catch (error) {
    console.error("Error creating transaction:", error)
    return { success: false, error }
  }
}

/**
 * Update transaction status
 * @param {string} transactionId - Transaction ID
 * @param {string} status - New status
 * @returns {Promise<void>}
 */
export const updateTransactionStatus = async (transactionId, status) => {
  try {
    const transactionRef = doc(db, transactionsCollection, transactionId)

    await updateDoc(transactionRef, {
      status,
      updatedAt: serverTimestamp(),
    })

    return { success: true }
  } catch (error) {
    console.error("Error updating transaction status:", error)
    return { success: false, error }
  }
}

/**
 * Get transactions by user ID
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of transactions
 */
export const getTransactionsByUserId = async (userId) => {
  try {
    const transactionsRef = collection(db, transactionsCollection)
    const q = query(transactionsRef, where("userId", "==", userId), orderBy("createdAt", "desc"))

    const querySnapshot = await getDocs(q)

    const transactions = []
    querySnapshot.forEach((doc) => {
      transactions.push({
        id: doc.id,
        ...doc.data(),
      })
    })

    return { success: true, data: transactions }
  } catch (error) {
    console.error("Error getting transactions by user:", error)
    return { success: false, error }
  }
}

/**
 * Get transactions by booking ID
 * @param {string} bookingId - Booking ID
 * @returns {Promise<Array>} Array of transactions
 */
export const getTransactionsByBookingId = async (bookingId) => {
  try {
    const transactionsRef = collection(db, transactionsCollection)
    const q = query(transactionsRef, where("bookingId", "==", bookingId), orderBy("createdAt", "desc"))

    const querySnapshot = await getDocs(q)

    const transactions = []
    querySnapshot.forEach((doc) => {
      transactions.push({
        id: doc.id,
        ...doc.data(),
      })
    })

    return { success: true, data: transactions }
  } catch (error) {
    console.error("Error getting transactions by booking:", error)
    return { success: false, error }
  }
}
