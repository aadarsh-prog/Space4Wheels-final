"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { MapComponent } from "@/components/map-component"
import { Search, MapPin, List, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/firebase/auth-context"

export default function FindParkingPage() {
  const { toast } = useToast()
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [maxDistance, setMaxDistance] = useState(5)
  const [maxPrice, setMaxPrice] = useState(10)
  const [plots, setPlots] = useState([])
  const [filteredPlots, setFilteredPlots] = useState([])
  const [selectedPlot, setSelectedPlot] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [userLocation, setUserLocation] = useState(null)

  // Fetch all plots on component mount
  useEffect(() => {
    const fetchPlots = async () => {
      try {
        setIsLoading(true)

        // Get user's current location
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const { latitude, longitude } = position.coords
              setUserLocation({ lat: latitude, lng: longitude })
            },
            (error) => {
              console.error("Error getting location:", error)
              toast({
                title: "Location Error",
                description: "Unable to get your current location. Using default location.",
                variant: "destructive",
              })
            },
          )
        }

        // Fetch plots from API
        const response = await fetch("/api/plots")

        if (!response.ok) {
          throw new Error("Failed to fetch parking plots")
        }

        const data = await response.json()

        if (data.success && data.data) {
          // Calculate distance for each plot (this would normally be done server-side)
          // For now, we'll use dummy distances
          const plotsWithDistance = data.data.map((plot) => ({
            ...plot,
            distance: Math.random() * 5, // Random distance between 0-5 miles
          }))

          setPlots(plotsWithDistance)
          setFilteredPlots(plotsWithDistance)
        } else {
          throw new Error("No plots found")
        }
      } catch (error) {
        console.error("Error fetching plots:", error)
        toast({
          title: "Error",
          description: "Failed to load parking plots. Using demo data instead.",
          variant: "destructive",
        })

        // Use dummy data as fallback
        const dummyPlots = [
          {
            id: "plot1",
            name: "Downtown Parking",
            address: "123 Main St, Downtown",
            price: 5,
            availableSlots: 8,
            totalSlots: 15,
            distance: 0.5,
            lat: 40.7128, // New York City
            lng: -74.006,
          },
          {
            id: "plot2",
            name: "Central Mall Parking",
            address: "456 Market Ave, Central",
            price: 7,
            availableSlots: 12,
            totalSlots: 30,
            distance: 1.2,
            lat: 40.7138,
            lng: -74.013,
          },
          {
            id: "plot3",
            name: "City Center Parking",
            address: "789 Center Blvd, Midtown",
            price: 6,
            availableSlots: 5,
            totalSlots: 20,
            distance: 1.8,
            lat: 40.7148,
            lng: -74.001,
          },
          {
            id: "plot4",
            name: "Riverside Parking",
            address: "321 River Rd, Riverside",
            price: 4,
            availableSlots: 15,
            totalSlots: 25,
            distance: 2.3,
            lat: 40.7158,
            lng: -74.009,
          },
          {
            id: "plot5",
            name: "North Station Parking",
            address: "555 North Ave, Uptown",
            price: 8,
            availableSlots: 3,
            totalSlots: 10,
            distance: 3.1,
            lat: 40.7168,
            lng: -74.003,
          },
        ]

        setPlots(dummyPlots)
        setFilteredPlots(dummyPlots)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPlots()
  }, [toast])

  // Filter plots based on search query, distance, and price
  useEffect(() => {
    if (plots.length === 0) return

    const filtered = plots.filter(
      (plot) =>
        (plot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          plot.address.toLowerCase().includes(searchQuery.toLowerCase())) &&
        plot.distance <= maxDistance &&
        plot.price <= maxPrice,
    )

    setFilteredPlots(filtered)

    // If there was a selected plot that's no longer in the filtered results, clear selection
    if (selectedPlot && !filtered.some((plot) => plot.id === selectedPlot)) {
      setSelectedPlot(null)
    }
  }, [searchQuery, maxDistance, maxPrice, plots, selectedPlot])

  // Handle plot selection from map or list
  const handleSelectPlot = (plotId) => {
    setSelectedPlot(plotId)

    // Scroll to the selected plot in the list if on mobile
    if (window.innerWidth < 1024) {
      const element = document.getElementById(`plot-${plotId}`)
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" })
      }
    }
  }

  // Handle search submission
  const handleSearch = async (e) => {
    e.preventDefault()

    if (!searchQuery.trim()) return

    try {
      setIsLoading(true)

      // In a real app, you would search for plots near the searched location
      // For now, we'll just filter the existing plots
      const response = await fetch(`/api/plots/nearby?query=${encodeURIComponent(searchQuery)}`)

      if (!response.ok) {
        throw new Error("Failed to search for parking plots")
      }

      const data = await response.json()

      if (data.success && data.data) {
        setPlots(data.data)
        setFilteredPlots(data.data)
      } else {
        throw new Error("No plots found")
      }
    } catch (error) {
      console.error("Error searching plots:", error)
      toast({
        title: "Search Error",
        description: "Failed to search for parking plots. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-6">Find Parking</h1>

      <div className="grid gap-6">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by location or parking name"
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Searching...
              </>
            ) : (
              "Search"
            )}
          </Button>
        </form>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Filters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Max Distance</span>
                    <span className="text-sm text-muted-foreground">{maxDistance} miles</span>
                  </div>
                  <Slider
                    defaultValue={[maxDistance]}
                    max={10}
                    step={0.5}
                    onValueChange={(value) => setMaxDistance(value[0])}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Max Price</span>
                    <span className="text-sm text-muted-foreground">${maxPrice}/hour</span>
                  </div>
                  <Slider
                    defaultValue={[maxPrice]}
                    max={20}
                    step={1}
                    onValueChange={(value) => setMaxPrice(value[0])}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Results ({filteredPlots.length})</h2>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                  {filteredPlots.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">
                      No parking spots found matching your criteria.
                    </p>
                  ) : (
                    filteredPlots.map((plot) => (
                      <Card
                        key={plot.id}
                        id={`plot-${plot.id}`}
                        className={`cursor-pointer transition-all ${selectedPlot === plot.id ? "border-primary" : ""}`}
                        onClick={() => handleSelectPlot(plot.id)}
                      >
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">{plot.name}</CardTitle>
                          <CardDescription className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {plot.address}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="pb-2">
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">Price: </span>
                              <span className="font-medium">${plot.price}/hour</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Distance: </span>
                              <span className="font-medium">{plot.distance.toFixed(1)} miles</span>
                            </div>
                            <div className="col-span-2">
                              <span className="text-muted-foreground">Available: </span>
                              <span className="font-medium">
                                {plot.availableSlots}/{plot.totalSlots} slots
                              </span>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter>
                          <Link href={`/dashboard/plots/${plot.id}`} className="w-full">
                            <Button size="sm" className="w-full">
                              Book Now
                            </Button>
                          </Link>
                        </CardFooter>
                      </Card>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-2">
            <Tabs defaultValue="map">
              <TabsList className="mb-4">
                <TabsTrigger value="map">
                  <MapPin className="h-4 w-4 mr-2" />
                  Map View
                </TabsTrigger>
                <TabsTrigger value="list">
                  <List className="h-4 w-4 mr-2" />
                  List View
                </TabsTrigger>
              </TabsList>

              <TabsContent value="map" className="mt-0">
                <Card>
                  <CardContent className="p-0">
                    <div className="h-[600px] w-full rounded-md overflow-hidden">
                      {isLoading ? (
                        <div className="flex justify-center items-center h-full bg-muted">
                          <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                      ) : (
                        <MapComponent
                          plots={filteredPlots}
                          selectedPlotId={selectedPlot}
                          onSelectPlot={handleSelectPlot}
                          userLocation={userLocation}
                        />
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="list" className="mt-0">
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredPlots.length === 0 ? (
                      <p className="col-span-2 text-center text-muted-foreground py-4">
                        No parking spots found matching your criteria.
                      </p>
                    ) : (
                      filteredPlots.map((plot) => (
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
                                <span className="font-medium">{plot.distance.toFixed(1)} miles</span>
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
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
