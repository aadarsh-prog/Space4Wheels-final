"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/lib/firebase/auth-context"
import { useFirebase } from "@/lib/firebase/firebase-provider"
import { MapPin, Plus, Car, Clock } from "lucide-react"

export default function MyPlotsPage() {
  const { user } = useAuth()
  const { db } = useFirebase()
  const [plots, setPlots] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPlots = async () => {
      if (!user || !db) return

      try {
        // For demo purposes, we'll use dummy data
        // In a real app, you would fetch from Firestore
        // const plotsRef = collection(db, "plots")
        // const q = query(plotsRef, where("ownerId", "==", user.uid))
        // const querySnapshot = await getDocs(q)
        // const plotsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        // setPlots(plotsData)

        // Dummy data
        const dummyPlots = [
          {
            id: "plot1",
            name: "My Downtown Lot",
            address: "123 Owner St, Downtown",
            price: 5,
            availableSlots: 8,
            totalSlots: 15,
            totalBookings: 45,
            lat: 40.7128,
            lng: -74.006,
            createdAt: "2023-01-01T00:00:00.000Z",
          },
          {
            id: "plot2",
            name: "My Suburban Lot", 
            address: "456 Owner Ave, Suburbs",
            price: 4,
            availableSlots: 20,
            totalSlots: 25,
            totalBookings: 32,
            lat: 40.7138,
            lng: -74.013,
            createdAt: "2023-01-15T00:00:00.000Z",
          },
        ]

        setPlots(dummyPlots)
      } catch (error) {
        console.error("Error fetching plots:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPlots()
  }, [user, db])

  if (loading) {
    return (
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-6">My Parking Plots</h1>
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-muted rounded w-48"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="h-48 bg-muted rounded"></div>
            <div className="h-48 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Parking Plots</h1>
        <Link href="/dashboard/plots/add">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add New Plot
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">Active Plots</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-6">
          {plots.length === 0 ? (
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
              {plots.map((plot) => (
                <Card key={plot.id}>
                  <CardHeader>
                    <CardTitle>{plot.name}</CardTitle>
                    <CardDescription className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {plot.address}
                    </CardDescription>
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
                        <span className="text-muted-foreground">Total Bookings:</span>
                        <span className="font-medium">{plot.totalBookings}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex gap-2">
                    <Link href={`/dashboard/plots/${plot.id}`} className="flex-1">
                      <Button variant="outline" className="w-full">
                        View Details
                      </Button>
                    </Link>
                    <Link href={`/dashboard/plots/${plot.id}/edit`} className="flex-1">
                      <Button variant="outline" className="w-full">
                        Edit
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Booking Analytics</CardTitle>
              <CardDescription>Overview of your parking plot performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <Car className="h-8 w-8 text-primary mx-auto mb-2" />
                        <p className="text-2xl font-bold">77</p>
                        <p className="text-sm text-muted-foreground">Total Bookings</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <Clock className="h-8 w-8 text-primary mx-auto mb-2" />
                        <p className="text-2xl font-bold">156</p>
                        <p className="text-sm text-muted-foreground">Hours Booked</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <MapPin className="h-8 w-8 text-primary mx-auto mb-2" />
                        <p className="text-2xl font-bold">${725}</p>
                        <p className="text-sm text-muted-foreground">Total Revenue</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="h-64 bg-muted rounded-md flex items-center justify-center">
                  <p className="text-muted-foreground">Booking trends chart would appear here</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
