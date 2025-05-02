"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useFirebase } from "./firebase-provider"

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const { auth } = useFirebase()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        // Get the ID token
        const idToken = await firebaseUser.getIdToken()

        try {
          // Verify the session on the server
          const response = await fetch("/api/auth/session", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ idToken }),
          })

          if (response.ok) {
            // Get user data including role from the server
            const userResponse = await fetch(`/api/users/${firebaseUser.uid}`)
            const userData = await userResponse.json()

            // Set the user with additional data from the server
            setUser({
              ...firebaseUser,
              role: userData.role || "user",
              profile: userData,
            })
          } else {
            // If session verification fails, sign out
            await auth.signOut()
            setUser(null)
          }
        } catch (error) {
          console.error("Error verifying session:", error)
          setUser(null)
        }
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [auth, router])

  const signIn = async (email, password) => {
    try {
      setLoading(true)
      const userCredential = await auth.signInWithEmailAndPassword(email, password)
      const idToken = await userCredential.user.getIdToken()

      // Create session cookie on the server
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ idToken }),
      })

      if (!response.ok) {
        throw new Error("Failed to create session")
      }

      return { success: true }
    } catch (error) {
      console.error("Error signing in:", error)
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email, password, name, role = "user") => {
    try {
      setLoading(true)
      const userCredential = await auth.createUserWithEmailAndPassword(email, password)
      const user = userCredential.user

      // Update display name
      await user.updateProfile({ displayName: name })

      // Get the ID token
      const idToken = await user.getIdToken(true)

      // Create user in the database via API
      const createUserResponse = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uid: user.uid,
          email: user.email,
          name: name,
          role: role,
        }),
      })

      if (!createUserResponse.ok) {
        throw new Error("Failed to create user profile")
      }

      // Create session cookie on the server
      const sessionResponse = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ idToken }),
      })

      if (!sessionResponse.ok) {
        throw new Error("Failed to create session")
      }

      return { success: true }
    } catch (error) {
      console.error("Error signing up:", error)
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)

      // Clear session on the server
      await fetch("/api/auth/logout", {
        method: "POST",
      })

      // Sign out from Firebase
      await auth.signOut()

      // Redirect to home page
      router.push("/")

      return { success: true }
    } catch (error) {
      console.error("Error signing out:", error)
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
