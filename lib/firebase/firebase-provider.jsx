"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { initializeApp, getApps, getApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"
import { firebaseConfig } from "./firebase-config"

const FirebaseContext = createContext(null)

export function FirebaseProvider({ children }) {
  const [firebaseApp, setFirebaseApp] = useState(null)
  const [firestoreDb, setFirestoreDb] = useState(null)
  const [firebaseStorage, setFirebaseStorage] = useState(null)

  useEffect(() => {
    let app
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig)
    } else {
      app = getApp()
    }

    const db = getFirestore(app)
    const storage = getStorage(app)

    setFirebaseApp(app)
    setFirestoreDb(db)
    setFirebaseStorage(storage)
  }, [])

  return (
    <FirebaseContext.Provider
      value={{
        app: firebaseApp,
        db: firestoreDb,
        storage: firebaseStorage,
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

export const db = () => {
  const { db } = useFirebase()
  return db
}
