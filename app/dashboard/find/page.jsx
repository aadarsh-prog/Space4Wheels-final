"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { MapComponent } from "@/components/map-component"
import { Search, MapPin, List } from "lucide-react"

// Dummy data for parking plots
const dummyPlots = [
  {
    id: "plot1",
    name: "Downtown Parking",
    address: "123 Main St, Downtown",
    price: 5,
    availableSlots: 8,
    totalSlots: 15,
    distance: 0.5,
    lat: 40.7128,
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

export default function FindParkingPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [maxDistance, setMaxDistance] = useState(5)
  const [maxPrice, setMaxPrice] = useState(10)
  const [filteredPlots, setFilteredPlots] = useState(dummyPlots)
  const [selectedPlot, setSelectedPlot] = useState(null)

  // Filter plots based on search query, distance, and price
  useEffect(() => {
    const filtered = dummyPlots.filter(
      (plot) =>
        (plot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          plot.address.toLowerCase().includes(searchQuery.toLowerCase())) &&
        plot.distance <= maxDistance &&
        plot.price <= maxPrice,
    )
    setFilteredPlots(filtered)
  }, [searchQuery, maxDistance, maxPrice])

  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-6">Find Parking</h1>

      <div className="grid gap-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by location or parking name"
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button>Search</Button>
        </div>

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
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {filteredPlots.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">
                    No parking spots found matching your criteria.
                  </p>
                ) : (
                  filteredPlots.map((plot) => (
                    <Card
                      key={plot.id}
                      className={`cursor-pointer transition-all ${selectedPlot === plot.id ? "border-primary" : ""}`}
                      onClick={() => setSelectedPlot(plot.id)}
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
                            <span className="font-medium">{plot.distance} miles</span>
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
                      <MapComponent
                        plots={filteredPlots}
                        selectedPlotId={selectedPlot}
                        onSelectPlot={(id) => setSelectedPlot(id)}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="list" className="mt-0">
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
                    ))
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
