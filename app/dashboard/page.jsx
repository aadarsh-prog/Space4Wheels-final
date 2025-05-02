"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/firebase/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Calendar, Clock, Car, MapPin } from "lucide-react"

export default function UserDashboard() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [nearbyPlots, setNearbyPlots] = useState([])
  const [recentBookings, setRecentBookings] = useState([])
  const [userLocation, setUserLocation] = useState({ lat: 40.7128, lng: -74.006 }) // Default to NYC
  useEffect(() => {
    if (user) {
      if (user.role !== "user") {
        router.push(user.role === "admin" ? "/admin" : "/owner-dashboard")
      }
    }
  }, [user, router])
  useEffect(() => {
    // Redirect if not a regular user
    console.log(user.role);
    if (user && user.role !== "user") {
      if (user.role === "owner") {
        router.push("/dashboard/owner-dashboard")
      } else if (user.role === "admin") {
        router.push("/admin")
      }
      return
    }

    // Get user's location if available
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
        },
        (error) => {
          console.error("Error getting location:", error)
        },
      )
    }

    const fetchDashboardData = async () => {
      try {
        setLoading(true)

        // Fetch nearby plots
        const nearbyResponse = await fetch(
          `/api/plots/nearby?lat=${userLocation.lat}&lng=${userLocation.lng}&radius=10`,
        )
        if (nearbyResponse.ok) {
          const nearbyData = await nearbyResponse.json()
          setNearbyPlots(nearbyData)
        }

        // Fetch user's bookings
        if (user) {
          const bookingsResponse = await fetch(`/api/bookings?userId=${user.uid}`)
          if (bookingsResponse.ok) {
            const bookingsData = await bookingsResponse.json()
            setRecentBookings(bookingsData)
          }
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchDashboardData()
    } else {
      setLoading(false)
    }
  }, [user, router, userLocation.lat, userLocation.lng])

  if (loading) {
    return (
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-6">User Dashboard</h1>
        <div className="grid gap-6">
          <div className="grid gap-4">
            <Skeleton className="h-8 w-48" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Skeleton className="h-48" />
              <Skeleton className="h-48" />
              <Skeleton className="h-48" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-6">User Dashboard</h1>

      <div className="grid gap-6">
        <Tabs defaultValue="nearby">
          <TabsList>
            <TabsTrigger value="nearby">Nearby Parking</TabsTrigger>
            <TabsTrigger value="bookings">My Bookings</TabsTrigger>
          </TabsList>

          <TabsContent value="nearby" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {nearbyPlots.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center">
                    <p>No nearby parking spots found.</p>
                    <div className="mt-4">
                      <Link href="/dashboard/find">
                        <Button>Find Parking</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                nearbyPlots.map((plot) => (
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
                          <span className="text-muted-foreground">Distance:</span>
                          <span className="font-medium">{plot.distance?.toFixed(1) || "N/A"} miles</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Link href={`/dashboard/plots/${plot.id}`} className="w-full">
                        <Button className="w-full">Book Now</Button>
                      </Link>
                    </CardFooter>
                  </Card>
                ))
              )}
            </div>

            <div className="mt-4 text-center">
              <Link href="/dashboard/find">
                <Button variant="outline">View All Parking Spots</Button>
              </Link>
            </div>
          </TabsContent>

          <TabsContent value="bookings" className="mt-4">
            {recentBookings.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="mb-4">You don't have any bookings yet.</p>
                  <Link href="/dashboard/find">
                    <Button>Find Parking</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recentBookings.map((booking) => (
                  <Card key={booking.id} className={booking.status === "confirmed" ? "border-primary" : ""}>
                    <CardHeader>
                      <CardTitle>{booking.plotName}</CardTitle>
                      <CardDescription>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{booking.date}</span>
                        </div>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-2">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {booking.startTime} - {booking.endTime}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{booking.plotAddress}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Car className="h-4 w-4 text-muted-foreground" />
                          <span>
                            Status:{" "}
                            <span
                              className={`capitalize font-medium ${
                                booking.status === "confirmed"
                                  ? "text-green-500"
                                  : booking.status === "cancelled"
                                    ? "text-red-500"
                                    : "text-yellow-500"
                              }`}
                            >
                              {booking.status}
                            </span>
                          </span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Link href={`/dashboard/bookings/${booking.id}`} className="w-full">
                        <Button variant="outline" className="w-full">
                          View Details
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}

            <div className="mt-4 text-center">
              <Link href="/dashboard/bookings">
                <Button variant="outline">View All Bookings</Button>
              </Link>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
