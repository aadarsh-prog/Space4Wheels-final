import { initializeApp, getApps, cert } from "firebase-admin/app"
import { getFirestore } from "firebase-admin/firestore"
import { getStorage } from "firebase-admin/storage"
import { getAuth } from "firebase-admin/auth"

// Singleton pattern for Firebase Admin
let adminApp
let adminDb
let adminStorage
let adminAuth

export function initAdmin() {
  if (!adminApp) {
    try {
      // Parse the service account key from environment variable
      const serviceAccount = JSON.parse(
        process.env.FIREBASE_SERVICE_ACCOUNT_KEY || 
        JSON.stringify({
          type: "service_account",
          project_id: process.env.FIREBASE_PROJECT_ID,
          private_key_id: "eddbd731cffcd2c4c19db5eea10acf71147b532a",
          private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
          client_email: process.env.FIREBASE_CLIENT_EMAIL,
          client_id: "107290614323071517475",
          auth_uri: "https://accounts.google.com/o/oauth2/auth",
          token_uri: "https://oauth2.googleapis.com/token",
          auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
          client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${encodeURIComponent(process.env.FIREBASE_CLIENT_EMAIL || '')}`
        })
      )

      // Check if we already have initialized apps
      if (getApps().length === 0) {
        adminApp = initializeApp({
          credential: cert(serviceAccount),
          databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
          storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        })
        
        console.log("Firebase Admin initialized successfully")
      } else {
        adminApp = getApps()[0]
        console.log("Using existing Firebase Admin app")
      }

      // Initialize Firestore, Storage, and Auth
      adminDb = getFirestore(adminApp)
      adminStorage = getStorage(adminApp)
      adminAuth = getAuth(adminApp)
    } catch (error) {
      console.error("Error initializing Firebase Admin:", error)
      throw new Error(`Failed to initialize Firebase Admin: ${error.message}`)
    }
  }

  return { adminApp, adminDb, adminStorage, adminAuth }
}

// Export individual services
export function getAdminFirestore() {
  if (!adminDb) {
    const { adminDb: db } = initAdmin()
    adminDb = db
  }
  return adminDb
}

export function getAdminStorage() {
  if (!adminStorage) {
    const { adminStorage: storage } = initAdmin()
    adminStorage = storage
  }
  return adminStorage
}

export function getAdminAuth() {
  if (!adminAuth) {
    const { adminAuth: auth } = initAdmin()
    adminAuth = auth
  }
  return adminAuth
}
