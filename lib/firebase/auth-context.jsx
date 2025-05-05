"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from "firebase/auth"
import { useFirebase } from "./firebase-provider"

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const { auth, isInitialized } = useFirebase()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Only run this effect when Firebase is initialized
    if (!isInitialized || !auth) {
      console.log("Firebase auth not initialized yet")
      return
    }

    console.log("Firebase auth initialized, setting up auth state listener")
    setLoading(true) // Ensure loading is true when starting auth check

    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser) => {
        console.log("Auth state changed:", firebaseUser ? "User logged in" : "No user")

        if (firebaseUser) {
          try {
            // Get the ID token
            const idToken = await firebaseUser.getIdToken()

            // Create or verify session on the server
            const sessionResponse = await fetch("/api/auth/session", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ idToken }),
            })

            if (!sessionResponse.ok) {
              console.error("Session verification failed")
              await firebaseSignOut(auth)
              setUser(null)
              setLoading(false)
              return
            }

            // Get user data including role from Firestore
            try {
              const userDoc = await fetch(`/api/users/${firebaseUser.uid}`)

              if (!userDoc.ok) {
                console.error("Failed to fetch user data")
                setUser({
                  ...firebaseUser,
                  uid: firebaseUser.uid,
                  email: firebaseUser.email,
                  displayName: firebaseUser.displayName,
                  role: "user", // Default role
                })
              } else {
                const userData = await userDoc.json()
                console.log("User data fetched:", userData)

                // Set the user with additional data from Firestore
                setUser({
                  ...firebaseUser,
                  uid: firebaseUser.uid,
                  email: firebaseUser.email,
                  displayName: firebaseUser.displayName,
                  role: userData.role || "user",
                  profile: userData,
                })
              }
            } catch (error) {
              console.error("Error fetching user data:", error)
              // Set default user data if Firestore fetch fails
              setUser({
                ...firebaseUser,
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: firebaseUser.displayName,
                role: "user", // Default role
              })
            }
          } catch (error) {
            console.error("Auth error:", error)
            setUser(null)
          }
        } else {
          setUser(null)
        }

        setLoading(false)
      },
      (error) => {
        console.error("Auth state observer error:", error)
        setUser(null)
        setLoading(false)
      },
    )

    return () => unsubscribe()
  }, [auth, isInitialized, router])

  const signIn = async (email, password) => {
    if (!auth) {
      console.error("Firebase auth not initialized")
      return { success: false, error: "Authentication service not available" }
    }

    try {
      setLoading(true)
      // Use the imported signInWithEmailAndPassword function
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
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

      // Get user data to determine role for redirection
      const userDoc = await fetch(`/api/users/${userCredential.user.uid}`)

      if (!userDoc.ok) {
        // Default to user dashboard if can't fetch role
        router.push("/dashboard")
        return { success: true }
      }

      const userData = await userDoc.json()

      // Redirect based on role
      if (userData.role === "admin") {
        router.push("/admin")
      } else if (userData.role === "owner") {
        router.push("/owner")
      } else {
        router.push("/dashboard")
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
    if (!auth) {
      console.error("Firebase auth not initialized")
      return { success: false, error: "Authentication service not available" }
    }

    try {
      setLoading(true)
      // Use the imported createUserWithEmailAndPassword function
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      // Update display name using the imported updateProfile function
      await updateProfile(user, { displayName: name })

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
          createdAt: new Date().toISOString(),
        }),
      })

      if (!createUserResponse.ok) {
        throw new Error("Failed to create user profile")
      }

      // Create session cookie on the server
      // const sessionResponse = await fetch("/api/auth/login", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify({ idToken }),
      // })

      // if (!sessionResponse.ok) {
      //   throw new Error("Failed to create session")
      // }

      // Redirect to login
      router.push("/auth/login")

      return { success: true }
    } catch (error) {
      console.error("Error signing up:", error)
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    if (!auth) {
      console.error("Firebase auth not initialized")
      return { success: false, error: "Authentication service not available" }
    }

    try {
      setLoading(true)

      // Clear session on the server
      await fetch("/api/auth/logout", {
        method: "POST",
      })

      // Sign out from Firebase using the imported firebaseSignOut function
      await firebaseSignOut(auth)

      // Redirect to home page
      router.push("/auth/login")

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
    isInitialized,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
