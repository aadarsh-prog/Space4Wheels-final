"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useAuth } from "@/lib/firebase/auth-context";
import { Calendar, Clock, MapPin } from "lucide-react";

const dummyBookings = [
  {
    id: "booking1",
    plotId: "plot1",
    plotName: "Downtown Parking",
    address: "123 Main St, Downtown",
    date: "2023-05-15",
    startTime: "10:00 AM",
    endTime: "12:00 PM",
    price: 10,
    status: "upcoming",
  },
  {
    id: "booking2",
    plotId: "plot2",
    plotName: "Central Mall Parking",
    address: "456 Market Ave, Central",
    date: "2023-05-10",
    startTime: "2:00 PM",
    endTime: "4:00 PM",
    price: 14,
    status: "completed",
  },
  {
    id: "booking3",
    plotId: "plot3",
    plotName: "City Center Parking",
    address: "789 Center Blvd, Midtown",
    date: "2023-04-28",
    startTime: "9:00 AM",
    endTime: "11:00 AM",
    price: 12,
    status: "completed",
  },
];

export default function BookingsPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState(dummyBookings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setBookings(dummyBookings);
      } catch (error) {
        console.error("Error fetching bookings:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchBookings();
    }
  }, [user]);

  const upcomingBookings = bookings.filter((booking) => booking.status === "upcoming");
  const pastBookings = bookings.filter((booking) => booking.status === "completed");

  if (loading) {
    return (
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-6">My Bookings</h1>
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-muted rounded w-48"></div>
          <div className="h-48 bg-muted rounded"></div>
          <div className="h-48 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-6">My Bookings</h1>

      <Tabs defaultValue="upcoming">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming ({upcomingBookings.length})</TabsTrigger>
          <TabsTrigger value="past">Past ({pastBookings.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-6">
          {upcomingBookings.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="mb-4">You don't have any upcoming bookings.</p>
                <Link href="/dashboard/find">
                  <Button>Find Parking</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcomingBookings.map((booking) => (
                <Card key={booking.id} className="border-primary">
                  <CardHeader>
                    <CardTitle>{booking.plotName}</CardTitle>
                    <CardDescription className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {booking.address}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{booking.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {booking.startTime} - {booking.endTime}
                        </span>
                      </div>
                      <div className="mt-4 pt-4 border-t">
                        <div className="flex justify-between">
                          <span className="font-medium">Total Paid:</span>
                          <span className="font-bold">${booking.price}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex gap-2">
                    <Link href={`/dashboard/bookings/${booking.id}`} className="flex-1">
                      <Button variant="outline" className="w-full">
                        View Details
                      </Button>
                    </Link>
                    <Link href={`/dashboard/plots/${booking.plotId}`} className="flex-1">
                      <Button variant="outline" className="w-full">
                        View Location
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="past" className="mt-6">
          {pastBookings.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p>You don't have any past bookings.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pastBookings.map((booking) => (
                <Card key={booking.id}>
                  <CardHeader>
                    <CardTitle>{booking.plotName}</CardTitle>
                    <CardDescription className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {booking.address}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{booking.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {booking.startTime} - {booking.endTime}
                        </span>
                      </div>
                      <div className="mt-4 pt-4 border-t">
                        <div className="flex justify-between">
                          <span className="font-medium">Total Paid:</span>
                          <span className="font-bold">${booking.price}</span>
                        </div>
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
