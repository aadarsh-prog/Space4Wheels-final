"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { initializeApp, getApps, getApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"
import { getAuth } from "firebase/auth"
import { firebaseConfig } from "./firebase-config"

const FirebaseContext = createContext(null)

export function FirebaseProvider({ children }) {
  const [firebaseApp, setFirebaseApp] = useState(null)
  const [firestoreDb, setFirestoreDb] = useState(null)
  const [firebaseStorage, setFirebaseStorage] = useState(null)
  const [firebaseAuth, setFirebaseAuth] = useState(null)
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    let app
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig)
    } else {
      app = getApp()
    }

    const db = getFirestore(app)
    const storage = getStorage(app)
    const auth = getAuth(app)

    setFirebaseApp(app)
    setFirestoreDb(db)
    setFirebaseStorage(storage)
    setFirebaseAuth(auth)
    setIsInitialized(true)
  }, [])

  return (
    <FirebaseContext.Provider
      value={{
        app: firebaseApp,
        db: firestoreDb,
        storage: firebaseStorage,
        auth: firebaseAuth,
        isInitialized,
      }}
    >
      {children}
    </FirebaseContext.Provider>
  )
}

export const useFirebase = () => {
  const context = useContext(FirebaseContext)
  if (!context) {
    throw new Error("useFirebase must be used within a FirebaseProvider")
  }
  return context
}

export const useFirebaseApp = () => {
  const { app } = useFirebase()
  return app
}

export const useFirestore = () => {
  const { db } = useFirebase()
  return db
}

export const useStorage = () => {
  const { storage } = useFirebase()
  return storage
}

export const useAuth = () => {
  const { auth } = useFirebase()
  return auth
}

export const db = () => {
  const { db } = useFirebase()
  return db
}
