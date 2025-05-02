"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"
import { firebaseConfig } from "./firebase-config"

const FirebaseContext = createContext(null)

export function FirebaseProvider({ children }) {
  const [initialized, setInitialized] = useState(false)
  const [firebaseApp, setFirebaseApp] = useState(null)
  const [auth, setAuth] = useState(null)
  const [db, setDb] = useState(null)
  const [storage, setStorage] = useState(null)

  useEffect(() => {
    try {
      const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()
      setFirebaseApp(app)
      setAuth(getAuth(app))
      setDb(getFirestore(app))
      setStorage(getStorage(app))
      setInitialized(true)
    } catch (error) {
      console.error("Firebase initialization error:", error)
    }
  }, [])

  return (
    <FirebaseContext.Provider value={{ app: firebaseApp, auth, db, storage, initialized }}>
      {children}
    </FirebaseContext.Provider>
  )
}

export const useFirebase = () => {
  const context = useContext(FirebaseContext)
  if (!context) throw new Error("useFirebase must be used within a FirebaseProvider")
  return context
}

export const useFirebaseApp = () => useFirebase().app
export const useFirestore = () => useFirebase().db
export const useStorage = () => useFirebase().storage
export const useFirebaseAuth = () => useFirebase().auth
