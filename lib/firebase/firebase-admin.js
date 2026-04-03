import { initializeApp, getApps, cert } from "firebase-admin/app"
import { getFirestore } from "firebase-admin/firestore"
import { getStorage } from "firebase-admin/storage"
import { getAuth } from "firebase-admin/auth"
import serviceAccount from "./serviceAccountKey.json"

let adminApp
let adminDb
let adminStorage
let adminAuth

export function initAdmin() {
  if (adminApp) {
    return { adminApp, adminDb, adminStorage, adminAuth }
  }

  try {
    if (getApps().length === 0) {
      adminApp = initializeApp({
        credential: cert(serviceAccount),
        databaseURL: "https://park-it-rent-it-default-rtdb.firebaseio.com",
        storageBucket: "park-it-rent-it.appspot.com",
      })
      console.log("Firebase Admin initialized successfully")
    } else {
      adminApp = getApps()[0]
      console.log("Using existing Firebase Admin app")
    }

    adminDb = getFirestore(adminApp)
    adminStorage = getStorage(adminApp)
    adminAuth = getAuth(adminApp)
  } catch (error) {
    console.error("Error initializing Firebase Admin:", error)
    throw new Error(`Failed to initialize Firebase Admin: ${error.message}`)
  }

  return { adminApp, adminDb, adminStorage, adminAuth }
}

export function getAdminFirestore() {
  if (!adminDb) {
    initAdmin()
  }
  return adminDb
}

export function getAdminStorage() {
  if (!adminStorage) {
    initAdmin()
  }
  return adminStorage
}

export function getAdminAuth() {
  if (!adminAuth) {
    initAdmin()
  }
  return adminAuth
}