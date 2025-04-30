"use client";
import { useEffect, useState } from "react";
import Link from "next/link"; // Use Next.js Link instead of react-router-dom
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Clock, Car, Plus } from "lucide-react";
import { useAuth } from "@/lib/firebase/auth-context"; // Replace with your auth hook or logic

export default function DashboardPage() {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentBookings, setRecentBookings] = useState([]);
  const [nearbyPlots, setNearbyPlots] = useState([]);
  const [userPlots, setUserPlots] = useState([]);

  useEffect(() => {
    if (user) {
      const fetchUserData = async () => {
        try {
         
          const userDoc = await fetch(`/api/users/${user.uid}`);
          const userData = await userDoc.json();
          setUserRole(userData.role || "user");

          if (userData.role === "owner") {
            const plotsResponse = await fetch(`/api/plots?ownerId=${user.uid}`);
            const plotsData = await plotsResponse.json();
            setUserPlots(plotsData);
          } else {
            const nearbyResponse = await fetch(`/api/plots/nearby`);
            const nearbyData = await nearbyResponse.json();
            setNearbyPlots(nearbyData);

            const bookingsResponse = await fetch(`/api/bookings?userId=${user.uid}`);
            const bookingsData = await bookingsResponse.json();
            setRecentBookings(bookingsData);
          }
        } catch (error) {
          console.error("Error fetching dashboard data:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchUserData();
    }
  }, [user]);

  const dummyNearbyPlots = [
    {
      id: "plot1",
      name: "Downtown Parking",
      address: "123 Main St, Downtown",
      price: 5,
      availableSlots: 8,
      totalSlots: 15,
      distance: 0.5,
    },
    {
      id: "plot2",
      name: "Central Mall Parking",
      address: "456 Market Ave, Central",
      price: 7,
      availableSlots: 12,
      totalSlots: 30,
      distance: 1.2,
    },
    {
      id: "plot3",
      name: "City Center Parking",
      address: "789 Center Blvd, Midtown",
      price: 6,
      availableSlots: 5,
      totalSlots: 20,
      distance: 1.8,
    },
  ];

  const dummyBookings = [
    {
      id: "booking1",
      plotName: "Downtown Parking",
      date: "2023-05-15",
      startTime: "10:00 AM",
      endTime: "12:00 PM",
      status: "upcoming",
    },
    {
      id: "booking2",
      plotName: "Central Mall Parking",
      date: "2023-05-10",
      startTime: "2:00 PM",
      endTime: "4:00 PM",
      status: "completed",
    },
  ];

  const dummyOwnerPlots = [
    {
      id: "plot1",
      name: "My Downtown Lot",
      address: "123 Owner St, Downtown",
      price: 5,
      availableSlots: 8,
      totalSlots: 15,
      totalBookings: 45,
    },
    {
      id: "plot2",
      name: "My Suburban Lot",
      address: "456 Owner Ave, Suburbs",
      price: 4,
      availableSlots: 20,
      totalSlots: 25,
      totalBookings: 32,
    },
  ];

  if (loading) {
    return (
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
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
    );
  }

  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      {userRole === "owner" ? (
        <div className="grid gap-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">My Parking Plots</h2>
            <Link href="/dashboard/plots/add">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add New Plot
              </Button>
            </Link>
          </div>

          {dummyOwnerPlots.length === 0 ? (
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
              {dummyOwnerPlots.map((plot) => (
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
                        <span className="text-muted-foreground">Total Bookings:</span>
                        <span className="font-medium">{plot.totalBookings}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Link href={`/dashboard/plots/${plot.id}`} className="w-full">
                      <Button variant="outline" className="w-full">
                        View Details
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}

          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
            <Card>
              <CardContent className="pt-6">
                <p>You have received 5 new bookings in the last 7 days.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <div className="grid gap-6">
          <Tabs defaultValue="nearby">
            <TabsList>
              <TabsTrigger value="nearby">Nearby Parking</TabsTrigger>
              <TabsTrigger value="bookings">My Bookings</TabsTrigger>
            </TabsList>

            <TabsContent value="nearby" className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {dummyNearbyPlots.map((plot) => (
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
                          <span className="font-medium">{plot.distance} miles</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Link href={`/dashboard/plots/${plot.id}`} className="w-full">
                        <Button className="w-full">Book Now</Button>
                      </Link>
                    </CardFooter>
                  </Card>
                ))}
              </div>

              <div className="mt-4 text-center">
                <Link href="/dashboard/find">
                  <Button variant="outline">View All Parking Spots</Button>
                </Link>
              </div>
            </TabsContent>

            <TabsContent value="bookings" className="mt-4">
              {dummyBookings.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center">
                    <p className="mb-4">You don't have any bookings yet.</p>
                    <Link href="/dashboard/find">
                      <Button>Find Parking</Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {dummyBookings.map((booking) => (
                    <Card key={booking.id}>
                      <CardHeader>
                        <CardTitle>{booking.plotName}</CardTitle>
                        <CardDescription>
                          {booking.date} | {booking.startTime} - {booking.endTime}
                        </CardDescription>
                      </CardHeader>
                      <CardFooter>
                        <Button className="w-full">
                          {booking.status === "upcoming" ? "View Booking" : "View Details"}
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}
