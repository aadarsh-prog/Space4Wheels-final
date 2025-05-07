"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { MapComponent } from "@/components/map-component"
import { Search, MapPin, List, Loader2, Filter, Clock, DollarSign, Zap, AlertCircle, CheckCircle2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/firebase/auth-context"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet"
import { Progress } from "@/components/ui/progress"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Maximum search radius in miles
const MAX_SEARCH_RADIUS = 20
// Initial search radius in miles
const INITIAL_SEARCH_RADIUS = 5
// Radius increment in miles when expanding search
const RADIUS_INCREMENT = 2

export default function FindParkingPage() {
  const { toast } = useToast()
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [searchRadius, setSearchRadius] = useState(INITIAL_SEARCH_RADIUS)
  const [maxPrice, setMaxPrice] = useState(15)
  const [minAvailability, setMinAvailability] = useState(1)
  const [sortBy, setSortBy] = useState("distance")
  const [plots, setPlots] = useState([])
  const [filteredPlots, setFilteredPlots] = useState([])
  const [selectedPlot, setSelectedPlot] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSearching, setIsSearching] = useState(false)
  const [userLocation, setUserLocation] = useState(null)
  const [searchStatus, setSearchStatus] = useState("")
  const [searchProgress, setSearchProgress] = useState(0)
  const [expandingSearch, setExpandingSearch] = useState(false)
  const [currentSearchRadius, setCurrentSearchRadius] = useState(INITIAL_SEARCH_RADIUS)
  const [showFilters, setShowFilters] = useState(false)
  const [searchError, setSearchError] = useState(null)

  // Get user's location on component mount
  useEffect(() => {
    const getUserLocation = () => {
      if (navigator.geolocation) {
        setSearchStatus("Getting your location...")
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords
            setUserLocation({ lat: latitude, lng: longitude })
            setSearchStatus("Location found! Ready to search.")
            // Auto-search when location is found
            fetchNearbyPlots(latitude, longitude, searchRadius)
          },
          (error) => {
            console.error("Error getting location:", error)
            setSearchError("Unable to get your location. Please enter a location manually.")
            setIsLoading(false)
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
        )
      } else {
        setSearchError("Geolocation is not supported by your browser. Please enter a location manually.")
        setIsLoading(false)
      }
    }

    getUserLocation()
  }, [])

  // Fetch nearby plots based on coordinates and radius
  const fetchNearbyPlots = useCallback(
    async (lat, lng, radius) => {
      try {
        setIsSearching(true)
        setSearchStatus(`Searching for parking within ${radius} miles...`)
        setSearchProgress(30)

        // API call to get nearby plots
        const response = await fetch(`/api/plots/nearby?lat=${lat}&lng=${lng}&radius=${radius}`)

        setSearchProgress(70)

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to fetch nearby plots")
        }

        const data = await response.json()
        setSearchProgress(100)

        if (data.success && data.data && data.data.length > 0) {
          console.log(`Found ${data.data.length} plots within ${radius} miles`, data.data)
          // Sort plots by distance
          const sortedPlots = sortPlots(data.data, sortBy)
          setPlots(sortedPlots)
          setFilteredPlots(sortedPlots)
          setSearchStatus(`Found ${data.data.length} parking spots near you!`)
          return true // Results found
        } else {
          console.log(`No plots found within ${radius} miles`)
          setPlots([])
          setFilteredPlots([])
          setSearchStatus(`No parking spots found within ${radius} miles.`)
          return false // No results
        }
      } catch (error) {
        console.error("Error fetching nearby plots:", error)
        setSearchError(`Error searching for parking: ${error.message}`)
        return false
      } finally {
        setIsSearching(false)
        setIsLoading(false)
      }
    },
    [sortBy],
  )

  // Auto-expand search radius when no results are found
  const expandSearchRadius = useCallback(async () => {
    if (!userLocation) return

    setExpandingSearch(true)
    let radius = INITIAL_SEARCH_RADIUS
    let resultsFound = false

    while (!resultsFound && radius <= MAX_SEARCH_RADIUS) {
      setCurrentSearchRadius(radius)
      setSearchStatus(`Expanding search to ${radius} miles...`)

      resultsFound = await fetchNearbyPlots(userLocation.lat, userLocation.lng, radius)

      if (!resultsFound) {
        radius += RADIUS_INCREMENT
      }
    }

    if (!resultsFound) {
      setSearchStatus(`No parking spots found within ${MAX_SEARCH_RADIUS} miles.`)
      toast({
        title: "No Results Found",
        description: `We couldn't find any parking spots within ${MAX_SEARCH_RADIUS} miles of your location.`,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Parking Spots Found!",
        description: `We found parking spots within ${radius} miles of your location.`,
      })
    }

    setExpandingSearch(false)
    setSearchRadius(radius)
  }, [userLocation, fetchNearbyPlots, toast])

  // Handle manual search submission
  const handleSearch = async (e) => {
    e.preventDefault()
    setSearchError(null)

    if (!searchQuery.trim() && !userLocation) {
      setSearchError("Please enter a location or allow location access")
      return
    }

    try {
      setIsSearching(true)
      setSearchStatus("Searching for your location...")
      setSearchProgress(20)

      let searchLat, searchLng

      if (searchQuery.trim()) {
        // In a real app, you would use a geocoding service
        // For now, we'll use a simple approach to parse coordinates or use a mock location
        const coordinates = parseCoordinates(searchQuery)
        if (coordinates) {
          searchLat = coordinates.lat
          searchLng = coordinates.lng
        } else {
          // Use a geocoding service here
          // For now, we'll use a mock location (New York City)
          searchLat = 40.7128
          searchLng = -74.006
          toast({
            title: "Using approximate location",
            description: "For demo purposes, we're using New York City as the search location.",
          })
        }
      } else {
        // Use user's current location
        searchLat = userLocation.lat
        searchLng = userLocation.lng
      }

      setSearchProgress(40)

      // Start with initial radius
      const resultsFound = await fetchNearbyPlots(searchLat, searchLng, searchRadius)

      // If no results, ask user if they want to expand search
      if (!resultsFound) {
        toast({
          title: "No Results Found",
          description: `No parking spots found within ${searchRadius} miles. Would you like to expand your search?`,
          action: (
            <Button variant="outline" onClick={expandSearchRadius}>
              Expand Search
            </Button>
          ),
        })
      }
    } catch (error) {
      console.error("Error during search:", error)
      setSearchError(`Search error: ${error.message}`)
    } finally {
      setIsSearching(false)
    }
  }

  // Parse coordinates from a string (e.g., "40.7128, -74.006")
  const parseCoordinates = (input) => {
    // Try to match a pattern like "lat, lng" or "lat,lng"
    const match = input.match(/^\s*(-?\d+(\.\d+)?)\s*,\s*(-?\d+(\.\d+)?)\s*$/)
    if (match) {
      return {
        lat: Number.parseFloat(match[1]),
        lng: Number.parseFloat(match[3]),
      }
    }
    return null
  }

  // Sort plots based on selected criteria
  const sortPlots = (plotsToSort, sortCriteria) => {
    return [...plotsToSort].sort((a, b) => {
      switch (sortCriteria) {
        case "distance":
          return a.distance - b.distance
        case "price":
          return a.price - b.price
        case "availability":
          return b.availableSlots / b.totalSlots - a.availableSlots / a.totalSlots
        default:
          return a.distance - b.distance
      }
    })
  }

  // Apply filters and sorting
  useEffect(() => {
    if (plots.length === 0) return

    let filtered = plots.filter((plot) => plot.price <= maxPrice && plot.availableSlots >= minAvailability)

    filtered = sortPlots(filtered, sortBy)
    setFilteredPlots(filtered)

    // If there was a selected plot that's no longer in the filtered results, clear selection
    if (selectedPlot && !filtered.some((plot) => plot.id === selectedPlot)) {
      setSelectedPlot(null)
    }
  }, [plots, maxPrice, minAvailability, sortBy, selectedPlot])

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

  // Reset filters to default
  const resetFilters = () => {
    setMaxPrice(15)
    setMinAvailability(1)
    setSortBy("distance")
  }

  return (
    <div className="container mx-auto pb-8">
      <h1 className="text-3xl font-bold mb-6">Find Parking</h1>

      {searchError && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{searchError}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by location or address"
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={isSearching} className="flex-1 md:flex-none">
              {isSearching ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Searching...
                </>
              ) : (
                "Search"
              )}
            </Button>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" onClick={() => setShowFilters(true)}>
                  <Filter className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Search Filters</SheetTitle>
                  <SheetDescription>Customize your parking search</SheetDescription>
                </SheetHeader>
                <div className="py-4 space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Search Radius</h3>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">{searchRadius} miles</span>
                      <span className="text-sm text-muted-foreground">Max: {MAX_SEARCH_RADIUS} miles</span>
                    </div>
                    <Slider
                      value={[searchRadius]}
                      min={1}
                      max={MAX_SEARCH_RADIUS}
                      step={1}
                      onValueChange={(value) => setSearchRadius(value[0])}
                    />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Maximum Price</h3>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">${maxPrice}/hour</span>
                      <span className="text-sm text-muted-foreground">Max: $30/hour</span>
                    </div>
                    <Slider
                      value={[maxPrice]}
                      min={1}
                      max={30}
                      step={1}
                      onValueChange={(value) => setMaxPrice(value[0])}
                    />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Minimum Available Spots</h3>
                    <Slider
                      value={[minAvailability]}
                      min={1}
                      max={10}
                      step={1}
                      onValueChange={(value) => setMinAvailability(value[0])}
                    />
                    <div className="text-sm text-muted-foreground">
                      At least {minAvailability} spot{minAvailability > 1 ? "s" : ""} available
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Sort By</h3>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="distance">Distance</SelectItem>
                        <SelectItem value="price">Price (Low to High)</SelectItem>
                        <SelectItem value="availability">Availability</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <SheetFooter>
                  <Button variant="outline" onClick={resetFilters}>
                    Reset
                  </Button>
                  <SheetClose asChild>
                    <Button>Apply Filters</Button>
                  </SheetClose>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </div>
        </form>

        {isSearching && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">{searchStatus}</span>
              <span className="text-sm">{searchProgress}%</span>
            </div>
            <Progress value={searchProgress} />
          </div>
        )}

        {expandingSearch && (
          <Alert>
            <Zap className="h-4 w-4" />
            <AlertTitle>Expanding Search</AlertTitle>
            <AlertDescription>Searching within {currentSearchRadius} miles of your location...</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <CardTitle>Filters</CardTitle>
                  <Button variant="ghost" size="sm" onClick={resetFilters}>
                    Reset
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Search Radius</span>
                    <span className="text-sm text-muted-foreground">{searchRadius} miles</span>
                  </div>
                  <Slider
                    value={[searchRadius]}
                    min={1}
                    max={MAX_SEARCH_RADIUS}
                    step={1}
                    onValueChange={(value) => setSearchRadius(value[0])}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Max Price</span>
                    <span className="text-sm text-muted-foreground">${maxPrice}/hour</span>
                  </div>
                  <Slider
                    value={[maxPrice]}
                    min={1}
                    max={30}
                    step={1}
                    onValueChange={(value) => setMaxPrice(value[0])}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Sort By</span>
                  </div>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="distance">Distance</SelectItem>
                      <SelectItem value="price">Price (Low to High)</SelectItem>
                      <SelectItem value="availability">Availability</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Results ({filteredPlots.length})</h2>
                {filteredPlots.length > 0 && (
                  <Badge variant="outline">
                    {sortBy === "distance"
                      ? "Nearest first"
                      : sortBy === "price"
                        ? "Cheapest first"
                        : "Most available first"}
                  </Badge>
                )}
              </div>

              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                  {filteredPlots.length === 0 ? (
                    <div className="text-center py-8 space-y-4">
                      <p className="text-muted-foreground">No parking spots found matching your criteria.</p>
                      {plots.length > 0 && (
                        <Button variant="outline" onClick={resetFilters}>
                          Reset Filters
                        </Button>
                      )}
                      {plots.length === 0 && !expandingSearch && (
                        <Button onClick={expandSearchRadius}>Expand Search Radius</Button>
                      )}
                    </div>
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
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3 text-muted-foreground" />
                              <span className="font-medium">${plot.price}/hour</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3 text-muted-foreground" />
                              <span className="font-medium">{plot.distance.toFixed(1)} miles</span>
                            </div>
                            <div className="col-span-2 flex items-center gap-1">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              <span className="font-medium">
                                {plot.availableSlots}/{plot.totalSlots} slots available
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
                          <div className="text-center">
                            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
                            <p className="text-sm text-muted-foreground">{searchStatus}</p>
                          </div>
                        </div>
                      ) : (
                        <MapComponent
                          plots={filteredPlots}
                          selectedPlotId={selectedPlot}
                          onSelectPlot={handleSelectPlot}
                          userLocation={userLocation}
                          searchRadius={searchRadius}
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
                              {plot.features && plot.features.length > 0 && (
                                <Accordion type="single" collapsible className="mt-2">
                                  <AccordionItem value="features">
                                    <AccordionTrigger className="text-sm">Features</AccordionTrigger>
                                    <AccordionContent>
                                      <ul className="text-sm space-y-1">
                                        {plot.features.map((feature, index) => (
                                          <li key={index} className="flex items-center gap-2">
                                            <CheckCircle2 className="h-3 w-3 text-green-500" />
                                            {feature}
                                          </li>
                                        ))}
                                      </ul>
                                    </AccordionContent>
                                  </AccordionItem>
                                </Accordion>
                              )}
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
