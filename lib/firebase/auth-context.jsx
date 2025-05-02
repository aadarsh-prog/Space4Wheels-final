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
import { useFirebase } from "./firebase-provider"
import { useToast } from "@/components/ui/use-toast"

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const { app } = useFirebase()
  const { toast } = useToast()

  useEffect(() => {
    if (!app) return

    const auth = getAuth(app)

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Get the ID token
          const idToken = await firebaseUser.getIdToken()

          // Send the ID token to the server to create a session
          const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ idToken }),
          })

          if (!response.ok) {
            console.error("Failed to create session")
          }

          // Get user data from the server
          const userResponse = await fetch(`/api/users/${firebaseUser.uid}`)
          if (userResponse.ok) {
            const userData = await userResponse.json()

            const authUser = {
              ...firebaseUser,
              role: userData?.role || "user",
            }

            setUser(authUser)
          } else {
            setUser(firebaseUser)
          }
        } catch (error) {
          console.error("Error setting up user session:", error)
          setUser(firebaseUser)
        }
      } else {
        setUser(null)
      }

      setLoading(false)
    })

    return () => unsubscribe()
  }, [app])

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

      // Create user in the database via API
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uid: firebaseUser.uid,
          email,
          name,
          role,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create user profile")
      }

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

      // Clear the session cookie
      await fetch("/api/auth/logout", {
        method: "POST",
      })

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

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signOut,
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
