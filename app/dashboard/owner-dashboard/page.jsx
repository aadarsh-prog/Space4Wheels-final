"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/firebase/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus, Car, Clock, CreditCard, AlertCircle } from "lucide-react"

export default function OwnerDashboard() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [userPlots, setUserPlots] = useState([])
  const [recentBookings, setRecentBookings] = useState([])
  const [stats, setStats] = useState({
    totalPlots: 0,
    pendingPlots: 0,
    totalBookings: 0,
    totalRevenue: 0,
  })

  useEffect(() => {
    // Redirect if not an owner
    if (user && user.role !== "owner") {
      if (user.role === "admin") {
        router.push("/admin")
      } else {
        router.push("/dashboard")
      }
      return
    }

    const fetchOwnerData = async () => {
      try {
        setLoading(true)

        if (user) {
          // Fetch owner's plots
          const plotsResponse = await fetch(`/api/plots?ownerId=${user.uid}`)
          if (plotsResponse.ok) {
            const plotsData = await plotsResponse.json()
            setUserPlots(plotsData)

            // Calculate stats
            const pendingPlots = plotsData.filter((plot) => plot.approvalStatus === "pending").length
            setStats((prev) => ({
              ...prev,
              totalPlots: plotsData.length,
              pendingPlots: pendingPlots,
            }))

            // Fetch bookings for all plots
            const plotIds = plotsData.map((plot) => plot.id)
            if (plotIds.length > 0) {
              const bookingsPromises = plotIds.map((plotId) =>
                fetch(`/api/bookings?plotId=${plotId}`).then((res) => (res.ok ? res.json() : [])),
              )

              const allBookingsArrays = await Promise.all(bookingsPromises)
              const allBookings = allBookingsArrays.flat()

              // Sort by date (most recent first)
              allBookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
              setRecentBookings(allBookings.slice(0, 5)) // Get 5 most recent bookings

              // Calculate total revenue and bookings
              const totalRevenue = allBookings.reduce((sum, booking) => {
                return booking.status !== "cancelled" ? sum + (booking.amount || 0) : sum
              }, 0)

              setStats((prev) => ({
                ...prev,
                totalBookings: allBookings.length,
                totalRevenue: totalRevenue,
              }))
            }
          }
        }
      } catch (error) {
        console.error("Error fetching owner data:", error)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchOwnerData()
    } else {
      setLoading(false)
    }
  }, [user, router])

  if (loading) {
    return (
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-6">Owner Dashboard</h1>
        <div className="grid gap-6">
          <div className="grid gap-4">
            <Skeleton className="h-8 w-48" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
            </div>
            <Skeleton className="h-64" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Owner Dashboard</h1>
        <Link href="/dashboard/plots/add">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add New Plot
          </Button>
        </Link>
      </div>

      <div className="grid gap-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center space-y-2">
                <Car className="h-10 w-10 text-primary" />
                <h2 className="text-3xl font-bold">{stats.totalPlots}</h2>
                <p className="text-sm text-muted-foreground">Total Plots</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center space-y-2">
                <AlertCircle className="h-10 w-10 text-yellow-500" />
                <h2 className="text-3xl font-bold">{stats.pendingPlots}</h2>
                <p className="text-sm text-muted-foreground">Pending Approval</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center space-y-2">
                <Clock className="h-10 w-10 text-primary" />
                <h2 className="text-3xl font-bold">{stats.totalBookings}</h2>
                <p className="text-sm text-muted-foreground">Total Bookings</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center space-y-2">
                <CreditCard className="h-10 w-10 text-green-500" />
                <h2 className="text-3xl font-bold">${stats.totalRevenue.toFixed(2)}</h2>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* My Parking Plots */}
        <div>
          <h2 className="text-xl font-semibold mb-4">My Parking Plots</h2>
          {userPlots.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="mb-4">You haven't added any parking plots yet.</p>
                <Link href="/dashboard/plots/add">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Your First Plot
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userPlots.map((plot) => (
                <Card key={plot.id}>
                  <CardHeader>
                    <CardTitle>{plot.name}</CardTitle>
                    <CardDescription>{plot.address}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Price:</span>
                        <span className="font-medium">${plot.price}/hour</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Available:</span>
                        <span className="font-medium">
                          {plot.availableSlots}/{plot.totalSlots} slots
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status:</span>
                        <span
                          className={`font-medium ${
                            plot.approvalStatus === "approved"
                              ? "text-green-500"
                              : plot.approvalStatus === "rejected"
                                ? "text-red-500"
                                : "text-yellow-500"
                          }`}
                        >
                          {plot.approvalStatus?.charAt(0).toUpperCase() + plot.approvalStatus?.slice(1) || "Pending"}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Link href={`/owner/plots/${plot.id}`} className="w-full">
                      <Button variant="outline" className="w-full">
                        View Details
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Recent Bookings */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Recent Bookings</h2>
          {recentBookings.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p>No bookings yet for your parking plots.</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {recentBookings.map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                      <div>
                        <p className="font-medium">{booking.plotName}</p>
                        <p className="text-sm text-muted-foreground">
                          {booking.date} • {booking.startTime} - {booking.endTime}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${booking.amount?.toFixed(2) || "0.00"}</p>
                        <p
                          className={`text-sm ${
                            booking.status === "confirmed"
                              ? "text-green-500"
                              : booking.status === "cancelled"
                                ? "text-red-500"
                                : "text-yellow-500"
                          }`}
                        >
                          {booking.status?.charAt(0).toUpperCase() + booking.status?.slice(1)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Link href="/owner/bookings" className="w-full">
                  <Button variant="outline" className="w-full">
                    View All Bookings
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
