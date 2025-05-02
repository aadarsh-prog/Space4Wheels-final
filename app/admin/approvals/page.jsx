"use client"

import { useState, useEffect } from "react"
import { useDatabase } from "@/lib/hooks/use-database"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { MapPin, Calendar, Check, X, Loader2 } from "lucide-react"

export default function PlotApprovalsPage() {
  const { getPlots, approvePlot, rejectPlot, loading } = useDatabase()
  const { toast } = useToast()
  const [plots, setPlots] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [rejectionReason, setRejectionReason] = useState("")
  const [selectedPlot, setSelectedPlot] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    const fetchPendingPlots = async () => {
      try {
        setIsLoading(true)
        // In a real app, we would use:
        // const data = await getPlots({ approvalStatus: "pending" })

        // For demo purposes, use dummy data
        const dummyPendingPlots = [
          {
            id: "plot1",
            name: "Downtown Parking",
            address: "123 Main St, Downtown",
            ownerId: "owner1",
            ownerName: "John Owner",
            price: 5,
            totalSlots: 15,
            description: "Conveniently located parking in the heart of downtown.",
            approvalStatus: "pending",
            createdAt: "2023-05-10T10:30:00Z",
          },
          {
            id: "plot2",
            name: "Central Mall Parking",
            address: "456 Market Ave, Central",
            ownerId: "owner2",
            ownerName: "Jane Owner",
            price: 7,
            totalSlots: 30,
            description: "Spacious parking near the Central Mall with security.",
            approvalStatus: "pending",
            createdAt: "2023-05-09T14:20:00Z",
          },
          {
            id: "plot3",
            name: "City Center Parking",
            address: "789 Center Blvd, Midtown",
            ownerId: "owner3",
            ownerName: "Mike Owner",
            price: 6,
            totalSlots: 20,
            description: "Secure parking in the city center with 24/7 access.",
            approvalStatus: "pending",
            createdAt: "2023-05-08T09:15:00Z",
          },
        ]

        setPlots(dummyPendingPlots)
      } catch (error) {
        console.error("Error fetching pending plots:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load pending plots.",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchPendingPlots()
  }, [getPlots, toast])

  const handleApprove = async (plotId) => {
    setIsProcessing(true)
    try {
      // In a real app, we would use:
      // await approvePlot(plotId)

      // For demo purposes, simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Update local state
      setPlots(plots.filter((plot) => plot.id !== plotId))

      toast({
        title: "Plot Approved",
        description: "The parking plot has been approved successfully.",
      })
    } catch (error) {
      console.error("Error approving plot:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to approve plot.",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReject = async () => {
    if (!selectedPlot || !rejectionReason.trim()) return

    setIsProcessing(true)
    try {
      // In a real app, we would use:
      // await rejectPlot(selectedPlot.id, rejectionReason)

      // For demo purposes, simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Update local state
      setPlots(plots.filter((plot) => plot.id !== selectedPlot.id))

      toast({
        title: "Plot Rejected",
        description: "The parking plot has been rejected.",
      })

      // Reset and close dialog
      setRejectionReason("")
      setSelectedPlot(null)
      setIsDialogOpen(false)
    } catch (error) {
      console.error("Error rejecting plot:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to reject plot.",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const openRejectDialog = (plot) => {
    setSelectedPlot(plot)
    setRejectionReason("")
    setIsDialogOpen(true)
  }

  if (isLoading) {
    return (
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-6">Plot Approvals</h1>
        <div className="grid gap-4">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-6">Plot Approvals</h1>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">Pending ({plots.length})</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          {plots.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p>No plots pending approval.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {plots.map((plot) => (
                <Card key={plot.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{plot.name}</CardTitle>
                        <CardDescription className="flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3" />
                          {plot.address}
                        </CardDescription>
                      </div>
                      <Badge>Pending</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Owner Information</h3>
                        <p className="font-medium">{plot.ownerName}</p>
                        <p className="text-sm text-muted-foreground">Owner ID: {plot.ownerId}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Plot Details</h3>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Price: </span>
                            <span className="font-medium">${plot.price}/hour</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Total Slots: </span>
                            <span className="font-medium">{plot.totalSlots}</span>
                          </div>
                        </div>
                      </div>
                      <div className="md:col-span-2">
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Description</h3>
                        <p className="text-sm">{plot.description}</p>
                      </div>
                      <div className="md:col-span-2">
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Submitted</h3>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {new Date(plot.createdAt).toLocaleDateString()} at{" "}
                            {new Date(plot.createdAt).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end gap-4">
                    <Button variant="outline" onClick={() => openRejectDialog(plot)} disabled={isProcessing}>
                      <X className="mr-2 h-4 w-4" />
                      Reject
                    </Button>
                    <Button onClick={() => handleApprove(plot.id)} disabled={isProcessing}>
                      {isProcessing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Check className="mr-2 h-4 w-4" />
                          Approve
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="approved" className="mt-6">
          <Card>
            <CardContent className="pt-6 text-center">
              <p>Approved plots will be shown here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rejected" className="mt-6">
          <Card>
            <CardContent className="pt-6 text-center">
              <p>Rejected plots will be shown here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Plot</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this plot. This will be sent to the plot owner.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Enter rejection reason..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isProcessing}>
              Cancel
            </Button>
            <Button onClick={handleReject} disabled={!rejectionReason.trim() || isProcessing}>
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Confirm Rejection"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
