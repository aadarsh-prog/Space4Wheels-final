"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MapComponent } from "@/components/map-component"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/firebase/auth-context"
import {
  Clock,
  MapPin,
  Star,
  DollarSign,
  Car,
  Loader2,
  Info,
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Calendar,
  CreditCard,
} from "lucide-react"
import { format } from "date-fns"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { PaymentForm } from "@/components/payment/payment-form"

// Add this new component after the imports and before the generateTimeSlots function
function ImageGallery({ images }) {
  const [currentIndex, setCurrentIndex] = useState(0)

  // If no images are provided, show a placeholder
  if (!images || images.length === 0) {
    return (
      <div className="h-[300px] w-full bg-muted flex items-center justify-center rounded-t-md">
        <Car className="h-16 w-16 text-muted-foreground opacity-30" />
      </div>
    )
  }

  const nextImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length)
  }

  return (
    <div className="relative h-[300px] w-full">
      <img
        src={images[currentIndex] || "/placeholder.svg"}
        alt={`Parking spot image ${currentIndex + 1}`}
        className="h-full w-full object-cover rounded-t-md"
      />

      {images.length > 1 && (
        <>
          <button
            onClick={prevImage}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70 transition-colors"
            aria-label="Previous image"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={nextImage}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70 transition-colors"
            aria-label="Next image"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-2 w-2 rounded-full transition-colors ${index === currentIndex ? "bg-white" : "bg-white/50"}`}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// Generate time slots from 6 AM to 10 PM
const generateTimeSlots = () => {
  const slots = []
  for (let hour = 6; hour <= 22; hour++) {
    const hourFormatted = hour % 12 === 0 ? 12 : hour % 12
    const period = hour < 12 ? "AM" : "PM"
    slots.push(`${hourFormatted}:00 ${period}`)
    slots.push(`${hourFormatted}:30 ${period}`)
  }
  return slots
}

const timeSlots = generateTimeSlots()

// Generate duration options from 1 to 8 hours
const durationOptions = Array.from({ length: 8 }, (_, i) => i + 1)

export default function PlotDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()

  const [plot, setPlot] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [bookingDate, setBookingDate] = useState(new Date())
  const [startTime, setStartTime] = useState(timeSlots[8]) // Default to 10:00 AM
  const [duration, setDuration] = useState(2) // Default to 2 hours
  const [bookingStep, setBookingStep] = useState(1)
  const [bookingDetails, setBookingDetails] = useState(null)
  const [processingBooking, setProcessingBooking] = useState(false)
  const [bookingError, setBookingError] = useState(null)
  const [bookingSuccess, setBookingSuccess] = useState(false)

  // Fetch plot details and reviews
  useEffect(() => {
    const fetchPlotData = async () => {
      try {
        setLoading(true)

        if (!params.id) {
          throw new Error("Plot ID is missing")
        }

        // Fetch plot details
        const plotResponse = await fetch(`/api/plots/${params.id}`)

        if (!plotResponse.ok) {
          const errorData = await plotResponse.json()
          throw new Error(errorData.error || "Failed to fetch plot details")
        }

        const plotData = await plotResponse.json()

        if (!plotData.success || !plotData.data) {
          throw new Error("Invalid plot data received")
        }

        console.log("Plot data received:", plotData.data)
        setPlot(plotData.data)

        // Fetch reviews
        try {
          const reviewsResponse = await fetch(`/api/reviews?plotId=${params.id}`)
          if (reviewsResponse.ok) {
            const reviewsData = await reviewsResponse.json()
            setReviews(reviewsData.data || [])
          }
        } catch (reviewError) {
          console.error("Error fetching reviews:", reviewError)
          // Don't fail the whole page if reviews can't be loaded
          setReviews([])
        }
      } catch (error) {
        console.error("Error fetching plot data:", error)
        toast({
          title: "Error",
          description: `Failed to load parking plot details: ${error.message}`,
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchPlotData()
  }, [params.id, toast])

  // Calculate booking details
  const calculateBookingDetails = () => {
    if (!plot) return null

    // Parse start time
    const [time, period] = startTime.split(" ")
    const [hour, minute] = time.split(":")
    let startHour = Number.parseInt(hour)

    // Convert to 24-hour format
    if (period === "PM" && startHour !== 12) {
      startHour += 12
    } else if (period === "AM" && startHour === 12) {
      startHour = 0
    }

    // Create start and end date objects
    const startDate = new Date(bookingDate)
    startDate.setHours(startHour, Number.parseInt(minute), 0, 0)

    const endDate = new Date(startDate)
    endDate.setHours(startDate.getHours() + duration)

    // Calculate total price
    const totalPrice = plot.price * duration

    return {
      plotId: plot.id,
      plotName: plot.name,
      plotAddress: plot.address,
      startTime: startDate,
      endTime: endDate,
      duration,
      pricePerHour: plot.price,
      totalPrice,
      userId: user?.uid,
      userName: user?.displayName || user?.email,
    }
  }

  // Handle booking submission
  const handleBookingSubmit = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to book a parking spot",
        variant: "destructive",
      })
      router.push("/auth/login")
      return
    }

    try {
      setProcessingBooking(true)
      setBookingError(null)

      const details = calculateBookingDetails()
      setBookingDetails(details)

      // Move to payment step
      setBookingStep(2)
    } catch (error) {
      console.error("Error preparing booking:", error)
      setBookingError("Failed to prepare booking. Please try again.")
    } finally {
      setProcessingBooking(false)
    }
  }

  // Handle payment submission
  const handlePaymentSubmit = async (paymentDetails) => {
    try {
      setProcessingBooking(true)
      setBookingError(null)

      // Create booking
      const bookingResponse = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingDetails),
      })

      if (!bookingResponse.ok) {
        const errorData = await bookingResponse.json()
        throw new Error(errorData.error || "Failed to create booking")
      }

      const bookingResult = await bookingResponse.json()

      // Process payment
      const paymentResponse = await fetch("/api/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookingId: bookingResult.data.id,
          amount: bookingDetails.totalPrice,
          ...paymentDetails,
        }),
      })

      if (!paymentResponse.ok) {
        const errorData = await paymentResponse.json()
        throw new Error(errorData.error || "Payment processing failed")
      }

      // Show success message
      setBookingSuccess(true)
      setBookingStep(3)

      toast({
        title: "Booking Successful",
        description: "Your parking spot has been booked successfully!",
      })
    } catch (error) {
      console.error("Error processing booking:", error)
      setBookingError(`Booking failed: ${error.message}`)
    } finally {
      setProcessingBooking(false)
    }
  }

  // Handle booking cancellation
  const handleCancelBooking = () => {
    setBookingStep(1)
    setBookingDetails(null)
    setBookingError(null)
  }

  // View booking details
  const viewBookingDetails = () => {
    router.push("/dashboard/bookings")
  }

  // Find another spot
  const findAnotherSpot = () => {
    router.push("/dashboard/find")
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-lg font-medium">Loading parking details...</p>
        </div>
      </div>
    )
  }

  if (!plot) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load parking details. The parking spot may not exist or has been removed.
          </AlertDescription>
        </Alert>
        <div className="mt-4 flex justify-center">
          <Button onClick={() => router.push("/dashboard/find")} className="btn-hover-effect">
            Find Another Spot
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Button
          variant="ghost"
          className="mb-2 hover:bg-transparent hover:text-primary"
          onClick={() => router.push("/dashboard/find")}
        >
          &larr; Back to Search
        </Button>
        <h1 className="text-3xl font-bold">{plot.name}</h1>
        <div className="flex items-center gap-2 mt-1 text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>{plot.address}</span>
        </div>
      </div>

      {bookingError && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{bookingError}</AlertDescription>
        </Alert>
      )}

      {bookingSuccess && (
        <Alert className="mb-6 bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <AlertTitle>Booking Successful!</AlertTitle>
          <AlertDescription>
            Your parking spot has been booked successfully. You can view your booking details in your dashboard.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="overflow-hidden card-hover">
            <CardContent className="p-0">
              <ImageGallery images={plot.images || []} />
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader>
              <CardTitle>Location Map</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-[300px] w-full rounded-b-md overflow-hidden">
                <MapComponent plots={[plot]} selectedPlotId={plot.id} userLocation={null} />
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="details">
            <TabsList className="mb-4 bg-muted/50 p-1">
              <TabsTrigger value="details" className="text-base py-2 px-4">
                Details
              </TabsTrigger>
              <TabsTrigger value="reviews" className="text-base py-2 px-4">
                Reviews ({reviews.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details">
              <Card className="card-hover">
                <CardHeader>
                  <CardTitle>Parking Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-start gap-2">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <DollarSign className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">Price</h3>
                        <p className="text-lg font-semibold">₹{plot.price}/hour</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <Car className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">Availability</h3>
                        <p className="text-lg font-semibold">
                          {plot.availableSlots}/{plot.totalSlots} spots
                        </p>
                      </div>
                    </div>
                    {plot.rating && (
                      <div className="flex items-start gap-2">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <Star className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium">Rating</h3>
                          <p className="text-lg font-semibold">
                            {plot.rating.toFixed(1)}/5{" "}
                            <span className="text-sm font-normal text-muted-foreground">
                              ({plot.reviewCount} reviews)
                            </span>
                          </p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-start gap-2">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <Clock className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">Hours</h3>
                        <p className="text-lg font-semibold">Open 24/7</p>
                      </div>
                    </div>
                  </div>

                  {plot.description && (
                    <div className="mt-6 p-4 bg-muted/30 rounded-lg">
                      <h3 className="font-medium mb-2">Description</h3>
                      <p className="text-muted-foreground">{plot.description}</p>
                    </div>
                  )}

                  {plot.features && plot.features.length > 0 && (
                    <div className="mt-6">
                      <h3 className="font-medium mb-3">Features</h3>
                      <ul className="grid grid-cols-2 gap-3">
                        {plot.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-2 bg-muted/30 p-2 rounded-md">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews">
              <Card className="card-hover">
                <CardHeader>
                  <CardTitle>Customer Reviews</CardTitle>
                  {plot.rating && (
                    <CardDescription>
                      {plot.rating.toFixed(1)}/5 ({plot.reviewCount} reviews)
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  {reviews.length === 0 ? (
                    <div className="text-center py-8 bg-muted/30 rounded-lg">
                      <Star className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-lg mb-2">No reviews yet.</p>
                      <p className="text-sm text-muted-foreground">Be the first to leave a review!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {reviews.map((review) => (
                        <div key={review.id} className="border-b pb-4 last:border-0">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">{review.userName}</p>
                              <div className="flex items-center gap-1 text-amber-500">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${i < review.rating ? "fill-current" : "text-gray-300"}`}
                                  />
                                ))}
                              </div>
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {review.createdAt
                                ? format(new Date(review.createdAt.seconds * 1000), "MMM d, yyyy")
                                : "Recent"}
                            </span>
                          </div>
                          <p className="mt-2 text-muted-foreground">{review.comment}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          {bookingStep === 1 && (
            <Card className="card-hover animate-pulse-shadow">
              <CardHeader className="bg-primary/5 border-b">
                <CardTitle>Book This Spot</CardTitle>
                <CardDescription>Select your parking date and time</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date</label>
                  <CalendarComponent
                    mode="single"
                    selected={bookingDate}
                    onSelect={setBookingDate}
                    disabled={(date) => date < new Date()}
                    className="rounded-md border mx-auto"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Start Time</label>
                  <Select value={startTime} onValueChange={setStartTime}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select start time" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Duration (hours)</label>
                  <Select value={duration.toString()} onValueChange={(value) => setDuration(Number.parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      {durationOptions.map((hours) => (
                        <SelectItem key={hours} value={hours.toString()}>
                          {hours} hour{hours > 1 ? "s" : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="pt-2 mt-4 bg-muted/30 p-3 rounded-lg">
                  <div className="flex justify-between text-sm">
                    <span>Price per hour:</span>
                    <span className="font-medium">₹{plot.price}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Duration:</span>
                    <span className="font-medium">
                      {duration} hour{duration > 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="flex justify-between font-medium mt-2 pt-2 border-t">
                    <span>Total:</span>
                    <span className="text-lg">₹{(plot.price * duration).toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full btn-hover-effect"
                  onClick={handleBookingSubmit}
                  disabled={processingBooking || plot.availableSlots < 1}
                >
                  {processingBooking ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : plot.availableSlots < 1 ? (
                    "No Spots Available"
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Continue to Payment
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          )}

          {bookingStep === 2 && bookingDetails && (
            <Card className="card-hover animate-pulse-shadow">
              <CardHeader className="bg-primary/5 border-b">
                <CardTitle>Payment</CardTitle>
                <CardDescription>Complete your booking by making a payment</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="bg-muted/30 p-4 rounded-lg space-y-3">
                  <h3 className="font-medium">Booking Summary</h3>
                  {plot.images && plot.images.length > 0 && (
                    <div className="mb-3">
                      <img
                        src={plot.images[0] || "/placeholder.svg"}
                        alt="Parking spot"
                        className="w-full h-32 object-cover rounded-md"
                      />
                    </div>
                  )}
                  <div className="text-sm space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <MapPin className="h-3 w-3" /> Location:
                      </span>
                      <span className="font-medium">{bookingDetails.plotName}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Calendar className="h-3 w-3" /> Date:
                      </span>
                      <span className="font-medium">{format(bookingDetails.startTime, "MMM d, yyyy")}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-3 w-3" /> Time:
                      </span>
                      <span className="font-medium">
                        {format(bookingDetails.startTime, "h:mm a")} - {format(bookingDetails.endTime, "h:mm a")}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-3 w-3" /> Duration:
                      </span>
                      <span className="font-medium">
                        {bookingDetails.duration} hour{bookingDetails.duration > 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className="flex justify-between font-medium pt-2 mt-1 border-t">
                      <span>Total:</span>
                      <span className="text-lg">₹{bookingDetails.totalPrice.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <PaymentForm
                  amount={bookingDetails.totalPrice}
                  onSubmit={handlePaymentSubmit}
                  onCancel={handleCancelBooking}
                  processing={processingBooking}
                />
              </CardContent>
            </Card>
          )}

          {bookingStep === 3 && bookingSuccess && (
            <Card className="card-hover animate-pulse-shadow">
              <CardHeader className="text-center pb-3 bg-green-50 dark:bg-green-900/20">
                <div className="mx-auto bg-green-100 dark:bg-green-800/30 w-16 h-16 rounded-full flex items-center justify-center mb-3 animate-bounce-slight">
                  <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle>Booking Confirmed!</CardTitle>
                <CardDescription>Your parking spot has been successfully booked</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="bg-muted/30 p-4 rounded-lg space-y-3">
                  <h3 className="font-medium">Booking Details</h3>
                  {plot.images && plot.images.length > 0 && (
                    <div className="mb-3">
                      <img
                        src={plot.images[0] || "/placeholder.svg"}
                        alt="Parking spot"
                        className="w-full h-32 object-cover rounded-md"
                      />
                    </div>
                  )}
                  <div className="text-sm space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <MapPin className="h-3 w-3" /> Location:
                      </span>
                      <span className="font-medium">{bookingDetails.plotName}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Calendar className="h-3 w-3" /> Date:
                      </span>
                      <span className="font-medium">{format(bookingDetails.startTime, "MMM d, yyyy")}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-3 w-3" /> Time:
                      </span>
                      <span className="font-medium">
                        {format(bookingDetails.startTime, "h:mm a")} - {format(bookingDetails.endTime, "h:mm a")}
                      </span>
                    </div>
                    <div className="flex justify-between font-medium pt-1 mt-1 border-t">
                      <span>Total Paid:</span>
                      <span className="text-lg">₹{bookingDetails.totalPrice.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
                  <Info className="h-4 w-4 text-blue-500" />
                  <AlertTitle>Important Information</AlertTitle>
                  <AlertDescription>
                    Please arrive on time. Your booking confirmation has been sent to your email.
                  </AlertDescription>
                </Alert>
              </CardContent>
              <CardFooter className="flex flex-col space-y-2">
                <Button className="w-full btn-hover-effect" onClick={viewBookingDetails}>
                  View All Bookings
                </Button>
                <Button variant="outline" className="w-full btn-hover-effect" onClick={findAnotherSpot}>
                  Find Another Spot
                </Button>
              </CardFooter>
            </Card>
          )}

          <Card className="card-hover">
            <CardHeader>
              <CardTitle>Location</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{plot.address}</p>
                    {plot.distance && (
                      <p className="text-sm text-muted-foreground">
                        {plot.distance.toFixed(1)} Kilometers from your location
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {plot.features && plot.features.includes("EV Charging") && (
            <Card className="card-hover">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">EV Charging Available</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  This parking location offers electric vehicle charging stations. Additional fees may apply.
                </p>
                
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
