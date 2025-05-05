"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { MapPin, Clock, Car, Info, Star, Loader2 } from "lucide-react"
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api"
import { useAuth } from "@/lib/firebase/auth-context"
import { useDatabase } from "@/lib/hooks/use-database"
import { PaymentForm } from "@/components/payment/payment-form"
import { motion, AnimatePresence } from "framer-motion"

const mapContainerStyle = {
  width: "100%",
  height: "100%",
  borderRadius: "0.375rem",
}

export default function PlotDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const { getPlotById, getReviewsByPlotId, createBooking, processPayment, loading } = useDatabase()

  const [plot, setPlot] = useState(null)
  const [reviews, setReviews] = useState([])
  const [date, setDate] = useState(new Date())
  const [startTime, setStartTime] = useState("09:00")
  const [endTime, setEndTime] = useState("11:00")
  const [isLoading, setIsLoading] = useState(true)
  const [isBooking, setIsBooking] = useState(false)
  const [showPayment, setShowPayment] = useState(false)
  const [bookingDetails, setBookingDetails] = useState(null)
  const [bookingStep, setBookingStep] = useState("details") // details, payment, confirmation

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    libraries: ["places"],
  })

  useEffect(() => {
    const fetchPlotDetails = async () => {
      if (!params.id) return

      try {
        setIsLoading(true)

        // Fetch plot details
        const plotData = await getPlotById(params.id)
        if (plotData) {
          setPlot(plotData)

          // Fetch reviews
          const reviewsData = await getReviewsByPlotId(params.id)
          if (reviewsData) {
            setReviews(reviewsData)
          }
        }
      } catch (error) {
        console.error("Error fetching plot details:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load plot details.",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchPlotDetails()
  }, [params.id, getPlotById, getReviewsByPlotId, toast])

  // Generate time slots for selection
  const timeSlots = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, "0")
    return `${hour}:00`
  })

  const calculateDuration = () => {
    const start = Number.parseInt(startTime.split(":")[0])
    const end = Number.parseInt(endTime.split(":")[0])
    return end > start ? end - start : 24 - start + end
  }

  const calculatePrice = () => {
    if (!plot) return 0
    const duration = calculateDuration()
    return plot.price * duration
  }

  const handleBookNow = () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "Please log in to book a parking spot.",
      })
      router.push("/auth/login")
      return
    }

    if (!date) {
      toast({
        variant: "destructive",
        title: "Date Required",
        description: "Please select a date for your booking.",
      })
      return
    }

    const duration = calculateDuration()
    if (duration <= 0) {
      toast({
        variant: "destructive",
        title: "Invalid Time Selection",
        description: "End time must be after start time.",
      })
      return
    }

    // Create booking details
    const bookingData = {
      userId: user.uid,
      userName: user.displayName || user.email,
      plotId: plot.id,
      plotName: plot.name,
      plotAddress: plot.address,
      date: date.toISOString().split("T")[0],
      startTime,
      endTime,
      duration,
      price: calculatePrice(),
    }

    setBookingDetails(bookingData)
    setBookingStep("payment")
  }

  const handlePaymentComplete = async (paymentDetails) => {
    setIsBooking(true)

    try {
      // Create booking
      const bookingResult = await createBooking({
        ...bookingDetails,
        paymentStatus: "pending",
      })

      if (!bookingResult) {
        throw new Error("Failed to create booking")
      }

      // Process payment
      const paymentResult = await processPayment(bookingResult.id, paymentDetails)

      if (!paymentResult) {
        throw new Error("Failed to process payment")
      }

      setBookingStep("confirmation")

      toast({
        title: "Booking Confirmed!",
        description: `You have successfully booked a parking spot at ${plot.name}.`,
      })

      // Wait a moment before redirecting
      setTimeout(() => {
        router.push("/dashboard/bookings")
      }, 3000)
    } catch (error) {
      console.error("Error completing booking:", error)
      toast({
        variant: "destructive",
        title: "Booking Failed",
        description: "There was an error processing your booking. Please try again.",
      })
      setBookingStep("details")
    } finally {
      setIsBooking(false)
    }
  }

  const handleCancelPayment = () => {
    setBookingStep("details")
    setBookingDetails(null)
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  if (!plot) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-red-500">Parking plot not found.</p>
            <Button className="mt-4" onClick={() => router.push("/dashboard/find")}>
              Back to Find Parking
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // For demo purposes, use dummy data if needed
  const displayPlot = {
    ...plot,
    images:
      plot.images && plot.images.length > 0
        ? plot.images
        : ["/placeholder.svg?height=300&width=500", "/placeholder.svg?height=300&width=500"],
    features: plot.features || ["24/7 Access", "Security Cameras", "Covered Parking", "Well Lit"],
  }

  const displayReviews =
    reviews.length > 0
      ? reviews
      : [
          {
            id: "review1",
            userId: "user1",
            userName: "John D.",
            rating: 4,
            comment: "Great location, easy to find and use.",
            createdAt: "2023-04-15T00:00:00.000Z",
          },
          {
            id: "review2",
            userId: "user2",
            userName: "Sarah M.",
            rating: 5,
            comment: "Very convenient and safe. Will use again!",
            createdAt: "2023-04-10T00:00:00.000Z",
          },
        ]

  return (
    <div className="container mx-auto">
      <div className="grid gap-6">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
          <div>
            <h1 className="text-3xl font-bold">{displayPlot.name}</h1>
            <p className="text-muted-foreground flex items-center gap-1 mt-1">
              <MapPin className="h-4 w-4" />
              {displayPlot.address}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">${displayPlot.price}</span>
            <span className="text-muted-foreground">/hour</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-0">
                <Carousel className="w-full">
                  <CarouselContent>
                    {displayPlot.images.map((image, index) => (
                      <CarouselItem key={index}>
                        <div className="p-1">
                          <div className="overflow-hidden rounded-lg">
                            <Image
                              src={image || "/placeholder.svg"}
                              alt={`${displayPlot.name} - Image ${index + 1}`}
                              width={800}
                              height={400}
                              className="aspect-[2/1] w-full object-cover"
                            />
                          </div>
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="left-4" />
                  <CarouselNext className="right-4" />
                </Carousel>
              </CardContent>
            </Card>

            <Tabs defaultValue="details">
              <TabsList>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="features">Features</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="mt-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <p>{displayPlot.description}</p>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2">
                          <Car className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">Available Slots</p>
                            <p className="text-sm text-muted-foreground">
                              {displayPlot.availableSlots} of {displayPlot.totalSlots}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">Operating Hours</p>
                            <p className="text-sm text-muted-foreground">24/7</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="features" className="mt-4">
                <Card>
                  <CardContent className="pt-6">
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {displayPlot.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-primary" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews" className="mt-4">
                <Card>
                  <CardContent className="pt-6">
                    {displayReviews.length === 0 ? (
                      <p className="text-center text-muted-foreground">No reviews yet.</p>
                    ) : (
                      <div className="space-y-4">
                        {displayReviews.map((review) => (
                          <div key={review.id} className="border-b pb-4 last:border-0 last:pb-0">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium">{review.userName}</p>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(review.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="flex">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            <p className="mt-2">{review.comment}</p>
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
            <AnimatePresence mode="wait">
              {bookingStep === "details" && (
                <motion.div
                  key="booking-details"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="text-lg font-semibold mb-4">Book a Parking Spot</h3>

                      <div className="space-y-4">
                        <div>
                          <p className="text-sm font-medium mb-2">Select Date</p>
                          <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            className="border rounded-md"
                            disabled={(date) => date < new Date()}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium mb-2">Start Time</p>
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

                          <div>
                            <p className="text-sm font-medium mb-2">End Time</p>
                            <Select value={endTime} onValueChange={setEndTime}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select end time" />
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
                        </div>

                        <div className="border-t pt-4 mt-4">
                          <div className="flex justify-between mb-2">
                            <span>Parking Fee</span>
                            <span>
                              ${displayPlot.price} x {calculateDuration()} hours
                            </span>
                          </div>
                          <div className="flex justify-between font-bold text-lg">
                            <span>Total</span>
                            <span>${calculatePrice()}</span>
                          </div>
                        </div>

                        <Button className="w-full" onClick={handleBookNow} disabled={isBooking || !date}>
                          {isBooking ? "Processing..." : "Book Now"}
                        </Button>

                        <div className="flex items-start gap-2 text-sm text-muted-foreground">
                          <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <p>You won't be charged until you confirm your booking.</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {bookingStep === "payment" && (
                <motion.div
                  key="payment-form"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <PaymentForm
                    amount={calculatePrice()}
                    onPaymentComplete={handlePaymentComplete}
                    onCancel={handleCancelPayment}
                    bookingDetails={bookingDetails}
                  />
                </motion.div>
              )}

              {bookingStep === "confirmation" && (
                <motion.div
                  key="booking-confirmation"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <div className="flex flex-col items-center justify-center py-6">
                        <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                          <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <h3 className="text-xl font-bold mb-2">Booking Confirmed!</h3>
                        <p className="text-muted-foreground mb-4">Your parking spot has been successfully booked.</p>
                        <div className="bg-muted p-4 rounded-md text-left w-full mb-4">
                          <h4 className="font-medium mb-2">Booking Details</h4>
                          <div className="space-y-1 text-sm">
                            <p>
                              <span className="text-muted-foreground">Location:</span> {bookingDetails?.plotName}
                            </p>
                            <p>
                              <span className="text-muted-foreground">Date:</span> {bookingDetails?.date}
                            </p>
                            <p>
                              <span className="text-muted-foreground">Time:</span> {bookingDetails?.startTime} -{" "}
                              {bookingDetails?.endTime}
                            </p>
                            <p>
                              <span className="text-muted-foreground">Total:</span> ${calculatePrice()}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">Redirecting to your bookings...</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-4">Location</h3>
                <div className="aspect-video bg-muted rounded-md overflow-hidden">
                  {isLoaded ? (
                    <GoogleMap
                      mapContainerStyle={mapContainerStyle}
                      center={{ lat: displayPlot.lat, lng: displayPlot.lng }}
                      zoom={15}
                      options={{
                        fullscreenControl: false,
                        streetViewControl: false,
                        mapTypeControl: false,
                      }}
                    >
                      <Marker
                        position={{ lat: displayPlot.lat, lng: displayPlot.lng }}
                        icon={{
                          url: "/marker-selected.svg",
                          scaledSize: new window.google.maps.Size(40, 40),
                        }}
                      />
                    </GoogleMap>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center p-4">
                        <p className="text-sm text-muted-foreground">Loading map...</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
