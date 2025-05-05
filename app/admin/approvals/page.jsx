"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useAuth } from "@/lib/firebase/auth-context"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { MapPin, Calendar, Check, X, Loader2, FileText, ExternalLink } from "lucide-react"

export default function PlotApprovalsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [pendingPlots, setPendingPlots] = useState([])
  const [approvedPlots, setApprovedPlots] = useState([])
  const [rejectedPlots, setRejectedPlots] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [rejectionReason, setRejectionReason] = useState("")
  const [selectedPlot, setSelectedPlot] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null)
  const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false)

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

    const fetchPlots = async () => {
      try {
        setIsLoading(true)

        // Fetch pending plots
        const pendingResponse = await fetch("/api/admin/plots/pending")
        if (!pendingResponse.ok) {
          throw new Error("Failed to fetch pending plots")
        }
        const pendingData = await pendingResponse.json()
        setPendingPlots(pendingData)

        // Fetch approved plots
        const approvedResponse = await fetch("/api/admin/plots?status=approved")
        if (approvedResponse.ok) {
          const approvedData = await approvedResponse.json()
          setApprovedPlots(approvedData)
        }

        // Fetch rejected plots
        const rejectedResponse = await fetch("/api/admin/plots?status=rejected")
        if (rejectedResponse.ok) {
          const rejectedData = await rejectedResponse.json()
          setRejectedPlots(rejectedData)
        }
      } catch (error) {
        console.error("Error fetching plots:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load plots. Please try again.",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      fetchPlots()
    }
  }, [user, router, toast])

  const handleApprove = async (plotId) => {
    setIsProcessing(true)
    try {
      const response = await fetch(`/api/admin/plots/${plotId}/approve`, {
        method: "PUT",
      })

      if (!response.ok) {
        throw new Error("Failed to approve plot")
      }

      // Update local state
      const approvedPlot = pendingPlots.find((plot) => plot.id === plotId)
      setPendingPlots(pendingPlots.filter((plot) => plot.id !== plotId))
      setApprovedPlots([...approvedPlots, { ...approvedPlot, approvalStatus: "approved" }])

      toast({
        title: "Plot Approved",
        description: "The parking plot has been approved successfully.",
      })
    } catch (error) {
      console.error("Error approving plot:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to approve plot: " + error.message,
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReject = async () => {
    if (!selectedPlot || !rejectionReason.trim()) return

    setIsProcessing(true)
    try {
      const response = await fetch(`/api/admin/plots/${selectedPlot.id}/reject`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason: rejectionReason }),
      })

      if (!response.ok) {
        throw new Error("Failed to reject plot")
      }

      // Update local state
      const rejectedPlot = pendingPlots.find((plot) => plot.id === selectedPlot.id)
      setPendingPlots(pendingPlots.filter((plot) => plot.id !== selectedPlot.id))
      setRejectedPlots([
        ...rejectedPlots,
        {
          ...rejectedPlot,
          approvalStatus: "rejected",
          rejectionReason: rejectionReason,
        },
      ])

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
        description: "Failed to reject plot: " + error.message,
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

  const viewPlotDetails = (plotId) => {
    router.push(`/admin/plots/${plotId}`)
  }

  const openImagePreview = (imageUrl) => {
    setImagePreviewUrl(imageUrl)
    setIsImagePreviewOpen(true)
  }

  // For demo purposes, let's create some dummy plots with images and documents
  const dummyPendingPlots = [
    {
      id: "plot1",
      name: "Downtown Parking",
      address: "123 Main St, Downtown",
      ownerId: "owner1",
      ownerName: "John Smith",
      price: 5,
      totalSlots: 15,
      description: "Conveniently located parking in the heart of downtown.",
      approvalStatus: "pending",
      createdAt: "2023-05-10T10:30:00Z",
      images: ["/placeholder.svg?height=300&width=500", "/placeholder.svg?height=300&width=500"],
      documents: [
        {
          name: "Property Deed",
          url: "#property-deed",
        },
        {
          name: "Business License",
          url: "#business-license",
        },
      ],
    },
    {
      id: "plot2",
      name: "Central Mall Parking",
      address: "456 Market Ave, Central",
      ownerId: "owner2",
      ownerName: "Jane Doe",
      price: 7,
      totalSlots: 30,
      description: "Spacious parking near the Central Mall with security.",
      approvalStatus: "pending",
      createdAt: "2023-05-09T14:20:00Z",
      images: ["/placeholder.svg?height=300&width=500"],
      documents: [
        {
          name: "Ownership Certificate",
          url: "#ownership-certificate",
        },
      ],
    },
  ]

  const dummyApprovedPlots = [
    {
      id: "plot3",
      name: "City Center Parking",
      address: "789 Center Blvd, Midtown",
      ownerId: "owner3",
      ownerName: "Mike Johnson",
      price: 6,
      totalSlots: 20,
      description: "Secure parking in the city center with 24/7 access.",
      approvalStatus: "approved",
      createdAt: "2023-05-08T09:15:00Z",
      approvedAt: "2023-05-09T10:00:00Z",
      images: ["/placeholder.svg?height=300&width=500"],
      documents: [
        {
          name: "Property Documents",
          url: "#property-documents",
        },
      ],
    },
  ]

  const dummyRejectedPlots = [
    {
      id: "plot4",
      name: "Riverside Parking",
      address: "321 River Rd, Eastside",
      ownerId: "owner1",
      ownerName: "John Smith",
      price: 4,
      totalSlots: 25,
      description: "Parking space near the riverside.",
      approvalStatus: "rejected",
      rejectionReason: "Insufficient documentation provided.",
      createdAt: "2023-05-07T11:45:00Z",
      rejectedAt: "2023-05-08T13:30:00Z",
      images: ["/placeholder.svg?height=300&width=500"],
      documents: [
        {
          name: "Incomplete Documents",
          url: "#incomplete-documents",
        },
      ],
    },
  ]

  // Use dummy data if no real data is available
  const displayPendingPlots = pendingPlots.length > 0 ? pendingPlots : dummyPendingPlots
  const displayApprovedPlots = approvedPlots.length > 0 ? approvedPlots : dummyApprovedPlots
  const displayRejectedPlots = rejectedPlots.length > 0 ? rejectedPlots : dummyRejectedPlots

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
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
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Plot Approvals</h1>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">Pending ({displayPendingPlots.length})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({displayApprovedPlots.length})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({displayRejectedPlots.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          {displayPendingPlots.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p>No plots pending approval.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {displayPendingPlots.map((plot) => (
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
                    <div className="grid gap-6">
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
                      </div>

                      {/* Images Section */}
                      {plot.images && plot.images.length > 0 && (
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground mb-2">Images</h3>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {plot.images.map((image, index) => (
                              <div
                                key={index}
                                className="relative aspect-video bg-muted rounded-md overflow-hidden cursor-pointer"
                                onClick={() => openImagePreview(image)}
                              >
                                <Image
                                  src={image || "/placeholder.svg"}
                                  alt={`Plot image ${index + 1}`}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Documents Section */}
                      {plot.documents && plot.documents.length > 0 && (
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground mb-2">Documents</h3>
                          <div className="space-y-2">
                            {plot.documents.map((doc, index) => (
                              <div key={index} className="flex items-center gap-2 p-2 border rounded-md">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                <span className="flex-1 text-sm">{doc.name}</span>
                                <a
                                  href={doc.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 text-xs text-primary hover:underline"
                                >
                                  View <ExternalLink className="h-3 w-3" />
                                </a>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div>
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
          {displayApprovedPlots.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p>No approved plots found.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {displayApprovedPlots.map((plot) => (
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
                      <Badge className="bg-green-500">Approved</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground mb-1">Owner Information</h3>
                          <p className="font-medium">{plot.ownerName}</p>
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
                      </div>

                      {/* Thumbnail of first image */}
                      {plot.images && plot.images.length > 0 && (
                        <div
                          className="relative aspect-video w-full max-w-md mx-auto bg-muted rounded-md overflow-hidden cursor-pointer"
                          onClick={() => openImagePreview(plot.images[0])}
                        >
                          <Image
                            src={plot.images[0] || "/placeholder.svg"}
                            alt={`Plot image`}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}

                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Approved On</h3>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {new Date(plot.approvedAt).toLocaleDateString()} at{" "}
                            {new Date(plot.approvedAt).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end">
                    <Button variant="outline" onClick={() => viewPlotDetails(plot.id)}>
                      View Details
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="rejected" className="mt-6">
          {displayRejectedPlots.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p>No rejected plots found.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {displayRejectedPlots.map((plot) => (
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
                      <Badge variant="destructive">Rejected</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground mb-1">Owner Information</h3>
                          <p className="font-medium">{plot.ownerName}</p>
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
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Rejection Reason</h3>
                        <p className="text-sm text-red-500">{plot.rejectionReason}</p>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Rejected On</h3>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {new Date(plot.rejectedAt).toLocaleDateString()} at{" "}
                            {new Date(plot.rejectedAt).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end">
                    <Button variant="outline" onClick={() => viewPlotDetails(plot.id)}>
                      View Details
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Rejection Dialog */}
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

      {/* Image Preview Dialog */}
      <Dialog open={isImagePreviewOpen} onOpenChange={setIsImagePreviewOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Image Preview</DialogTitle>
          </DialogHeader>
          <div className="relative aspect-video w-full">
            {imagePreviewUrl && (
              <Image
                src={imagePreviewUrl || "/placeholder.svg"}
                alt="Plot image preview"
                fill
                className="object-contain"
              />
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setIsImagePreviewOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
