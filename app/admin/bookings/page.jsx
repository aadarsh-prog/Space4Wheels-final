"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/firebase/auth-context"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { MoreHorizontal, Search, Calendar, Clock, Car, User, CreditCard } from "lucide-react"

export default function AdminBookingsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [bookings, setBookings] = useState([])
  const [filteredBookings, setFilteredBookings] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Redirect if not an admin
    if (user && user.role !== "admin") {
      if (user.role === "owner") {
        router.push("/owner")
      } else {
        router.push("/dashboard")
      }
      return
    }

    const fetchBookings = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("/api/admin/bookings")

        if (!response.ok) {
          throw new Error("Failed to fetch bookings")
        }

        const data = await response.json()
        setBookings(data)
        setFilteredBookings(data)
      } catch (error) {
        console.error("Error fetching bookings:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load bookings. Please try again.",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      fetchBookings()
    }
  }, [user, router, toast])

  useEffect(() => {
    let filtered = bookings

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((booking) => booking.status === statusFilter)
    }

    // Apply search filter
    if (searchQuery.trim() !== "") {
      const lowercasedQuery = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (booking) =>
          booking.userName?.toLowerCase().includes(lowercasedQuery) ||
          booking.plotName?.toLowerCase().includes(lowercasedQuery) ||
          booking.id.toLowerCase().includes(lowercasedQuery),
      )
    }

    setFilteredBookings(filtered)
  }, [searchQuery, statusFilter, bookings])

  const handleViewBooking = (bookingId) => {
    router.push(`/admin/bookings/${bookingId}`)
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  // For demo purposes, let's create some dummy bookings
  const dummyBookings = [
    {
      id: "booking1",
      userId: "user1",
      userName: "John Doe",
      plotId: "plot1",
      plotName: "Downtown Parking",
      startTime: "2023-05-15T10:00:00Z",
      endTime: "2023-05-15T12:00:00Z",
      duration: 2,
      amount: 15,
      status: "completed",
      paymentStatus: "paid",
      createdAt: "2023-05-14T09:30:00Z",
    },
    {
      id: "booking2",
      userId: "user2",
      userName: "Jane Smith",
      plotId: "plot2",
      plotName: "Central Mall Parking",
      startTime: "2023-05-16T14:00:00Z",
      endTime: "2023-05-16T16:00:00Z",
      duration: 2,
      amount: 22,
      status: "confirmed",
      paymentStatus: "paid",
      createdAt: "2023-05-15T13:20:00Z",
    },
    {
      id: "booking3",
      userId: "user3",
      userName: "Mike Johnson",
      plotId: "plot3",
      plotName: "City Center Parking",
      startTime: "2023-05-17T09:00:00Z",
      endTime: "2023-05-17T11:00:00Z",
      duration: 2,
      amount: 18,
      status: "cancelled",
      paymentStatus: "refunded",
      createdAt: "2023-05-16T08:15:00Z",
    },
    {
      id: "booking4",
      userId: "user1",
      userName: "John Doe",
      plotId: "plot4",
      plotName: "Riverside Parking",
      startTime: "2023-05-18T12:00:00Z",
      endTime: "2023-05-18T15:00:00Z",
      duration: 3,
      amount: 12,
      status: "pending",
      paymentStatus: "pending",
      createdAt: "2023-05-17T11:45:00Z",
    },
    {
      id: "booking5",
      userId: "user4",
      userName: "Sarah Williams",
      plotId: "plot5",
      plotName: "Stadium Parking",
      startTime: "2023-05-19T18:00:00Z",
      endTime: "2023-05-19T22:00:00Z",
      duration: 4,
      amount: 32,
      status: "confirmed",
      paymentStatus: "paid",
      createdAt: "2023-05-18T16:30:00Z",
    },
  ]

  // Use dummy data if no real data is available
  const displayBookings = filteredBookings.length > 0 ? filteredBookings : dummyBookings

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">Booking Management</h1>
        <Card>
          <CardHeader>
            <CardTitle>Bookings</CardTitle>
            <CardDescription>Manage all bookings in the system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-96 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Booking Management</h1>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Bookings</CardTitle>
              <CardDescription>Manage all bookings in the system</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search bookings..."
                  className="pl-8 w-full md:w-[250px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <select
                className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Parking Plot</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayBookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell className="font-medium">{booking.id.slice(0, 8)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{booking.userName}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Car className="h-4 w-4 text-muted-foreground" />
                      <span>{booking.plotName}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground">
                        <Calendar className="inline h-3 w-3 mr-1" />
                        {formatDate(booking.startTime)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        <Clock className="inline h-3 w-3 mr-1" />
                        {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{booking.duration} hrs</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                      <span>${booking.amount}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        booking.status === "completed"
                          ? "success"
                          : booking.status === "confirmed"
                            ? "default"
                            : booking.status === "pending"
                              ? "outline"
                              : "destructive"
                      }
                    >
                      {booking.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleViewBooking(booking.id)}>View Details</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Total: {displayBookings.length} bookings</span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled>
              Next
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
