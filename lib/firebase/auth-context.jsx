"use client"

import { createContext, useContext, useEffect, useState } from "react"
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
} from "firebase/auth"
import { doc, setDoc, getDoc } from "firebase/firestore"
import { useFirebase } from "./firebase-provider"
import { useToast } from "@/components/ui/use-toast"

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const { app, db } = useFirebase()
  const { toast } = useToast()

  useEffect(() => {
    if (!app) return

    const auth = getAuth(app)

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Get user role from Firestore
        try {
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid))
          const userData = userDoc.data()

          const authUser = {
            ...firebaseUser,
            role: userData?.role || "user",
          }

          setUser(authUser)
        } catch (error) {
          console.error("Error fetching user data:", error)
          setUser(firebaseUser)
        }
      } else {
        setUser(null)
      }

      setLoading(false)
    })

    return () => unsubscribe()
  }, [app, db])

  const signIn = async (email, password) => {
    try {
      setLoading(true)
      const auth = getAuth(app)
      await signInWithEmailAndPassword(auth, email, password)
      toast({
        title: "Signed in successfully",
        description: "Welcome back to ParkEase!",
      })
    } catch (error) {
      console.error("Sign in error:", error)
      toast({
        variant: "destructive",
        title: "Sign in failed",
        description: error.message || "Please check your credentials and try again",
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email, password, name, role) => {
    try {
      setLoading(true)
      const auth = getAuth(app)
      const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password)

      // Update profile with display name
      await updateProfile(firebaseUser, { displayName: name })

      // Store additional user data in Firestore
      await setDoc(doc(db, "users", firebaseUser.uid), {
        uid: firebaseUser.uid,
        email,
        name,
        role,
        createdAt: new Date().toISOString(),
      })

      toast({
        title: "Account created successfully",
        description: "Welcome to ParkEase!",
      })
    } catch (error) {
      console.error("Sign up error:", error)
      toast({
        variant: "destructive",
        title: "Sign up failed",
        description: error.message || "An error occurred during sign up",
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      const auth = getAuth(app)
      await firebaseSignOut(auth)
      toast({
        title: "Signed out successfully",
      })
    } catch (error) {
      console.error("Sign out error:", error)
      toast({
        variant: "destructive",
        title: "Sign out failed",
        description: error.message || "An error occurred during sign out",
      })
      throw error
    }
  }

  const getUserRole = async () => {
    if (!user) return null

    try {
      const userDoc = await getDoc(doc(db, "users", user.uid))
      const userData = userDoc.data()
      return userData?.role || null
    } catch (error) {
      console.error("Error fetching user role:", error)
      return null
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signOut,
        getUserRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
