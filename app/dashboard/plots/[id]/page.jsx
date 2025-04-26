"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { MapPin, Clock, Car, Info } from "lucide-react"

// Dummy plot data
const dummyPlot = {
  id: "plot1",
  name: "Downtown Parking",
  address: "123 Main St, Downtown",
  description: "Conveniently located parking in the heart of downtown. Easy access to shops, restaurants, and offices.",
  price: 5,
  availableSlots: 8,
  totalSlots: 15,
  distance: 0.5,
  lat: 40.7128,
  lng: -74.006,
  images: [
    "/placeholder.svg?height=300&width=500",
    "/placeholder.svg?height=300&width=500",
    "/placeholder.svg?height=300&width=500",
  ],
  features: ["24/7 Access", "Security Cameras", "Covered Parking", "Well Lit", "EV Charging Available"],
  reviews: [
    {
      id: "review1",
      user: "John D.",
      rating: 4,
      comment: "Great location, easy to find and use.",
      date: "2023-04-15",
    },
    {
      id: "review2",
      user: "Sarah M.",
      rating: 5,
      comment: "Very convenient and safe. Will use again!",
      date: "2023-04-10",
    },
  ],
}

export default function PlotDetailPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [date, setDate] = useState(new Date())
  const [startTime, setStartTime] = useState("09:00")
  const [endTime, setEndTime] = useState("11:00")
  const [isBooking, setIsBooking] = useState(false)

  // Generate time slots for selection
  const timeSlots = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, "0")
    return `${hour}:00`
  })

  const handleBooking = async () => {
    setIsBooking(true)

    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Booking Confirmed!",
        description: `You have successfully booked a parking spot at ${dummyPlot.name} on ${date.toLocaleDateString()} from ${startTime} to ${endTime}.`,
      })
      setIsBooking(false)
      router.push("/dashboard/bookings")
    }, 1500)
  }

  return (
    <div className="container mx-auto">
      <div className="grid gap-6">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
          <div>
            <h1 className="text-3xl font-bold">{dummyPlot.name}</h1>
            <p className="text-muted-foreground flex items-center gap-1 mt-1">
              <MapPin className="h-4 w-4" />
              {dummyPlot.address}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">${dummyPlot.price}</span>
            <span className="text-muted-foreground">/hour</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-0">
                <Carousel className="w-full">
                  <CarouselContent>
                    {dummyPlot.images.map((image, index) => (
                      <CarouselItem key={index}>
                        <div className="p-1">
                          <div className="overflow-hidden rounded-lg">
                            <Image
                              src={image || "/placeholder.svg"}
                              alt={`${dummyPlot.name} - Image ${index + 1}`}
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
                      <p>{dummyPlot.description}</p>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2">
                          <Car className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">Available Slots</p>
                            <p className="text-sm text-muted-foreground">
                              {dummyPlot.availableSlots} of {dummyPlot.totalSlots}
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
                      {dummyPlot.features.map((feature, index) => (
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
                    {dummyPlot.reviews.length === 0 ? (
                      <p className="text-center text-muted-foreground">No reviews yet.</p>
                    ) : (
                      <div className="space-y-4">
                        {dummyPlot.reviews.map((review) => (
                          <div key={review.id} className="border-b pb-4 last:border-0 last:pb-0">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium">{review.user}</p>
                                <p className="text-sm text-muted-foreground">{review.date}</p>
                              </div>
                              <div className="flex">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <svg
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                                    }`}
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                  >
                                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                  </svg>
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
                      <span>${dummyPlot.price} x 2 hours</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>${dummyPlot.price * 2}</span>
                    </div>
                  </div>

                  <Button className="w-full" onClick={handleBooking} disabled={isBooking || !date}>
                    {isBooking ? "Processing..." : "Book Now"}
                  </Button>

                  <div className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <p>You won't be charged until you confirm your booking.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-4">Location</h3>
                <div className="aspect-video bg-muted rounded-md overflow-hidden flex items-center justify-center">
                  <div className="text-center p-4">
                    <p className="text-sm text-muted-foreground">Map showing the exact location would appear here</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
