"use client"

import { useState, useEffect } from "react"
import { useDatabase } from "@/lib/hooks/use-database"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2 } from "lucide-react"

export function DatabaseServiceExample() {
  const { loading, error, getMyPlots, getMyBookings, getMyNotifications } = useDatabase()

  const [activeTab, setActiveTab] = useState("plots")
  const [data, setData] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      let result = []

      if (activeTab === "plots") {
        result = await getMyPlots()
      } else if (activeTab === "bookings") {
        result = await getMyBookings()
      } else if (activeTab === "notifications") {
        result = await getMyNotifications()
      }

      setData(result || [])
    }

    fetchData()
  }, [activeTab, getMyPlots, getMyBookings, getMyNotifications])

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="plots">My Plots</TabsTrigger>
          <TabsTrigger value="bookings">My Bookings</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="plots">
          <h2 className="text-xl font-bold mb-4">My Parking Plots</h2>
          {renderContent()}
        </TabsContent>

        <TabsContent value="bookings">
          <h2 className="text-xl font-bold mb-4">My Bookings</h2>
          {renderContent()}
        </TabsContent>

        <TabsContent value="notifications">
          <h2 className="text-xl font-bold mb-4">My Notifications</h2>
          {renderContent()}
        </TabsContent>
      </Tabs>
    </div>
  )

  function renderContent() {
    if (error) {
      return (
        <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-6">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )
    }

    if (loading) {
      return (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )
    }

    if (data.length === 0) {
      return (
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">No {activeTab} found.</p>
          </CardContent>
        </Card>
      )
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.map((item) => (
          <Card key={item.id}>
            <CardHeader>
              <CardTitle>{getItemTitle(item)}</CardTitle>
            </CardHeader>
            <CardContent>{renderItemDetails(item)}</CardContent>
          </Card>
        ))}
      </div>
    )
  }

  function getItemTitle(item) {
    switch (activeTab) {
      case "plots":
        return item.name
      case "bookings":
        return item.plotName
      case "notifications":
        return item.title
      default:
        return "Item"
    }
  }

  function renderItemDetails(item) {
    switch (activeTab) {
      case "plots":
        return (
          <>
            <p>{item.address}</p>
            <p className="mt-2">Price: ${item.price}/hour</p>
            <p>
              Available: {item.availableSlots}/{item.totalSlots} slots
            </p>
          </>
        )
      case "bookings":
        return (
          <>
            <p>{item.plotAddress}</p>
            <p className="mt-2">Date: {item.date}</p>
            <p>
              Time: {item.startTime} - {item.endTime}
            </p>
            <p className="mt-2">
              Status: <span className="capitalize">{item.status}</span>
            </p>
          </>
        )
      case "notifications":
        return (
          <>
            <p>{item.message}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {item.createdAt?.toDate().toLocaleString() || "Unknown date"}
            </p>
          </>
        )
      default:
        return null
    }
  }
}
