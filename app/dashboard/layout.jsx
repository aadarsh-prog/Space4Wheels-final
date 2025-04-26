"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AuthProvider } from "@/lib/firebase/auth-context"
import { useAuth } from "@/lib/firebase/auth-context"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { Loader2 } from "lucide-react"

export default function DashboardLayout({ children }) {
  return (
    <AuthProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </AuthProvider>
  )
}

function DashboardLayoutContent({ children }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [userRole, setUserRole] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/auth/login")
      } else {
        // Get user role from Firestore
        const fetchUserRole = async () => {
          try {
            const userDoc = await fetch(`/api/users/${user.uid}`)
            const userData = await userDoc.json()
            setUserRole(userData.role || "user")
          } catch (error) {
            console.error("Error fetching user role:", error)
            setUserRole("user") // Default to user role
          } finally {
            setIsLoading(false)
          }
        }

        fetchUserRole()
      }
    }
  }, [user, loading, router])

  if (loading || isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardNav userRole={userRole} />
      <main className="flex-1 p-4 md:p-6">{children}</main>
    </div>
  )
}
