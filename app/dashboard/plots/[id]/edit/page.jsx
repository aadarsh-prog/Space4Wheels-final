"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, X, Trash2, ImageIcon, FileText } from "lucide-react"
import { useAuth } from "@/lib/firebase/auth-context"
import { useFirebase } from "@/lib/firebase/firebase-provider"
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api"
import {
  uploadMultipleFiles,
  deleteMultipleFiles,
  formatFileSize,
  isImageFile,
  isDocumentFile,
} from "@/lib/firebase/storage-utils"
import { Progress } from "@/components/ui/progress"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

const formSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters" }),
  address: z.string().min(5, { message: "Address must be at least 5 characters" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  price: z.coerce.number().positive({ message: "Price must be a positive number" }),
  totalSlots: z.coerce.number().int().positive({ message: "Total slots must be a positive integer" }),
})

const mapContainerStyle = {
  width: "100%",
  height: "300px",
  borderRadius: "0.375rem",
}

const defaultCenter = {
  lat: 40.7128,
  lng: -74.006,
}

export default function EditPlotPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const { db, storage } = useFirebase()
  const [plot, setPlot] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  // Image handling
  const [existingImages, setExistingImages] = useState([])
  const [newImages, setNewImages] = useState([])
  const [newImagePreviews, setNewImagePreviews] = useState([])
  const [imagesToDelete, setImagesToDelete] = useState([])

  // Document handling
  const [existingDocuments, setExistingDocuments] = useState([])
  const [newDocuments, setNewDocuments] = useState([])
  const [newDocumentInfo, setNewDocumentInfo] = useState([])
  const [documentsToDelete, setDocumentsToDelete] = useState([])

  const [markerPosition, setMarkerPosition] = useState(null)

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    libraries: ["places"],
  })

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      address: "",
      description: "",
      price: 0,
      totalSlots: 0,
    },
  })

  useEffect(() => {
    const fetchPlot = async () => {
      try {
        if (!params.id) return

        const response = await fetch(`/api/plots/${params.id}`)
        if (!response.ok) {
          throw new Error("Failed to fetch plot")
        }

        const data = await response.json()
        if (!data.success) {
          throw new Error(data.error || "Failed to fetch plot")
        }

        const plotData = data.data
        setPlot(plotData)

        // Set form values
        form.reset({
          name: plotData.name,
          address: plotData.address,
          description: plotData.description,
          price: plotData.price,
          totalSlots: plotData.totalSlots,
        })

        // Set images and documents
        if (plotData.images && Array.isArray(plotData.images)) {
          setExistingImages(plotData.images)
        }

        if (plotData.documents && Array.isArray(plotData.documents)) {
          setExistingDocuments(plotData.documents)
        }

        // Set marker position
        if (plotData.lat && plotData.lng) {
          setMarkerPosition({ lat: plotData.lat, lng: plotData.lng })
        }
      } catch (error) {
        console.error("Error fetching plot:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load parking plot details.",
        })
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchPlot()
    }
  }, [params.id, form, toast])

  const handleNewImageChange = (e) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).filter((file) => isImageFile(file.name))
      setNewImages((prev) => [...prev, ...files])

      // Create preview URLs
      files.forEach((file) => {
        const url = URL.createObjectURL(file)
        setNewImagePreviews((prev) => [...prev, url])
      })
    }
  }

  const handleNewDocumentChange = (e) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).filter((file) => isDocumentFile(file.name))
      setNewDocuments((prev) => [...prev, ...files])

      // Store document info
      files.forEach((file) => {
        setNewDocumentInfo((prev) => [
          ...prev,
          {
            name: file.name,
            size: formatFileSize(file.size),
            type: file.type,
          },
        ])
      })
    }
  }

  const removeExistingImage = (index) => {
    const imageToRemove = existingImages[index]
    setImagesToDelete((prev) => [...prev, imageToRemove])
    setExistingImages((prev) => prev.filter((_, i) => i !== index))
  }

  const removeNewImage = (index) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index))
    setNewImagePreviews((prev) => {
      // Revoke the object URL to avoid memory leaks
      URL.revokeObjectURL(prev[index])
      return prev.filter((_, i) => i !== index)
    })
  }

  const removeExistingDocument = (index) => {
    const docToRemove = existingDocuments[index]
    setDocumentsToDelete((prev) => [...prev, docToRemove])
    setExistingDocuments((prev) => prev.filter((_, i) => i !== index))
  }

  const removeNewDocument = (index) => {
    setNewDocuments((prev) => prev.filter((_, i) => i !== index))
    setNewDocumentInfo((prev) => prev.filter((_, i) => i !== index))
  }

  const onMapClick = (e) => {
    setMarkerPosition({
      lat: e.latLng.lat(),
      lng: e.latLng.lng(),
    })
  }

  const onSubmit = async (values) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: "You must be logged in to update a parking plot.",
      })
      return
    }

    setIsSubmitting(true)
    setUploadProgress(10)

    try {
      // 1. Upload new images
      let uploadedNewImages = []
      if (newImages.length > 0) {
        uploadedNewImages = await uploadMultipleFiles(newImages, "plots/images", user.uid, (progress) => {
          setUploadProgress(10 + progress * 0.3) // 10-40% progress for images
        })
      }

      // 2. Upload new documents
      let uploadedNewDocuments = []
      if (newDocuments.length > 0) {
        uploadedNewDocuments = await uploadMultipleFiles(newDocuments, "plots/documents", user.uid, (progress) => {
          setUploadProgress(40 + progress * 0.3) // 40-70% progress for documents
        })
      }

      // 3. Delete removed images
      if (imagesToDelete.length > 0) {
        const imagePathsToDelete = imagesToDelete
          .filter((img) => img.path) // Only delete images with storage paths
          .map((img) => img.path)

        if (imagePathsToDelete.length > 0) {
          await deleteMultipleFiles(imagePathsToDelete)
        }
      }

      // 4. Delete removed documents
      if (documentsToDelete.length > 0) {
        const documentPathsToDelete = documentsToDelete
          .filter((doc) => doc.path) // Only delete documents with storage paths
          .map((doc) => doc.path)

        if (documentPathsToDelete.length > 0) {
          await deleteMultipleFiles(documentPathsToDelete)
        }
      }

      setUploadProgress(80)

      // 5. Update plot data
      const updatedPlotData = {
        ...values,
        lat: markerPosition?.lat || plot.lat,
        lng: markerPosition?.lng || plot.lng,
        images: [...existingImages, ...uploadedNewImages],
        documents: [...existingDocuments, ...uploadedNewDocuments],
        updatedAt: new Date().toISOString(),
      }

      // 6. Send update to API
      const response = await fetch(`/api/plots/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedPlotData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update plot")
      }

      setUploadProgress(100)

      toast({
        title: "Plot Updated Successfully",
        description: "Your parking plot has been updated.",
      })

      router.push("/dashboard/plots")
    } catch (error) {
      console.error("Error updating plot:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "There was an error updating your parking plot. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    setShowDeleteDialog(true)
  }

  const confirmDelete = async () => {
    try {
      setIsSubmitting(true)

      // 1. Delete all images from storage
      if (existingImages.length > 0) {
        const imagePathsToDelete = existingImages.filter((img) => img.path).map((img) => img.path)

        if (imagePathsToDelete.length > 0) {
          await deleteMultipleFiles(imagePathsToDelete)
        }
      }

      // 2. Delete all documents from storage
      if (existingDocuments.length > 0) {
        const documentPathsToDelete = existingDocuments.filter((doc) => doc.path).map((doc) => doc.path)

        if (documentPathsToDelete.length > 0) {
          await deleteMultipleFiles(documentPathsToDelete)
        }
      }

      // 3. Delete plot from database
      const response = await fetch(`/api/plots/${params.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to delete plot")
      }

      toast({
        title: "Plot Deleted",
        description: "Your parking plot has been deleted.",
      })

      router.push("/dashboard/plots")
    } catch (error) {
      console.error("Error deleting plot:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "There was an error deleting your parking plot. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
      setShowDeleteDialog(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-6">Edit Parking Plot</h1>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  if (!plot) {
    return (
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-6">Edit Parking Plot</h1>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-red-500">Parking plot not found.</p>
            <Button className="mt-4" onClick={() => router.push("/dashboard/plots")}>
              Back to My Plots
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-6">Edit Parking Plot</h1>

      <div className="grid gap-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>Update your parking plot details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Plot Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Downtown Parking" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input placeholder="123 Main St, City, State, ZIP" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe your parking plot, including any special features or amenities."
                            className="min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Pricing & Capacity</CardTitle>
                  <CardDescription>Update pricing and availability</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price per Hour ($)</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" step="0.5" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="totalSlots"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Parking Slots</FormLabel>
                        <FormControl>
                          <Input type="number" min="1" step="1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Images</CardTitle>
                  <CardDescription>Update plot images</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Existing Images */}
                  {existingImages.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Current Images</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {existingImages.map((image, index) => (
                          <div key={index} className="relative rounded-md overflow-hidden">
                            <img
                              src={image.url || "/placeholder.svg"}
                              alt={`Plot image ${index + 1}`}
                              className="w-full h-24 object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => removeExistingImage(index)}
                              className="absolute top-1 right-1 bg-black bg-opacity-50 rounded-full p-1"
                            >
                              <X className="h-4 w-4 text-white" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* New Images */}
                  {newImagePreviews.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">New Images</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {newImagePreviews.map((url, index) => (
                          <div key={index} className="relative rounded-md overflow-hidden">
                            <img
                              src={url || "/placeholder.svg"}
                              alt={`New image ${index + 1}`}
                              className="w-full h-24 object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => removeNewImage(index)}
                              className="absolute top-1 right-1 bg-black bg-opacity-50 rounded-full p-1"
                            >
                              <X className="h-4 w-4 text-white" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Upload New Images */}
                  <div>
                    <h4 className="text-sm font-medium mb-2">Add More Images</h4>
                    <label htmlFor="new-images" className="cursor-pointer">
                      <div className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center">
                        <ImageIcon className="h-8 w-8 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">Drag and drop images here or click to browse</p>
                        <p className="text-xs text-muted-foreground mt-1">JPG, PNG or GIF, up to 5MB each</p>
                      </div>
                      <Input
                        id="new-images"
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleNewImageChange}
                      />
                    </label>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Documents</CardTitle>
                  <CardDescription>Update plot documents</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Existing Documents */}
                  {existingDocuments.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Current Documents</h4>
                      <div className="space-y-2">
                        {existingDocuments.map((doc, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-md">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4" />
                              <div>
                                <p className="text-sm font-medium truncate max-w-[200px]">{doc.name}</p>
                                <p className="text-xs text-muted-foreground">{formatFileSize(doc.size || 0)}</p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeExistingDocument(index)}
                              className="text-destructive hover:text-destructive/80"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* New Documents */}
                  {newDocumentInfo.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">New Documents</h4>
                      <div className="space-y-2">
                        {newDocumentInfo.map((doc, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-md">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4" />
                              <div>
                                <p className="text-sm font-medium truncate max-w-[200px]">{doc.name}</p>
                                <p className="text-xs text-muted-foreground">{doc.size}</p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeNewDocument(index)}
                              className="text-destructive hover:text-destructive/80"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Upload New Documents */}
                  <div>
                    <h4 className="text-sm font-medium mb-2">Add More Documents</h4>
                    <label htmlFor="new-documents" className="cursor-pointer">
                      <div className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center">
                        <FileText className="h-8 w-8 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">
                          Upload ownership documents, permits, or certificates
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">PDF, DOC, or DOCX, up to 10MB each</p>
                      </div>
                      <Input
                        id="new-documents"
                        type="file"
                        accept=".pdf,.doc,.docx"
                        multiple
                        className="hidden"
                        onChange={handleNewDocumentChange}
                      />
                    </label>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Location</CardTitle>
                <CardDescription>Update the exact location of your parking plot</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full rounded-md overflow-hidden">
                  {isLoaded ? (
                    <GoogleMap
                      mapContainerStyle={mapContainerStyle}
                      center={markerPosition || defaultCenter}
                      zoom={15}
                      onClick={onMapClick}
                      options={{
                        fullscreenControl: false,
                        streetViewControl: true,
                        mapTypeControl: true,
                      }}
                    >
                      {markerPosition && (
                        <Marker
                          position={markerPosition}
                          draggable={true}
                          onDragEnd={(e) => {
                            setMarkerPosition({
                              lat: e.latLng.lat(),
                              lng: e.latLng.lng(),
                            })
                          }}
                        />
                      )}
                    </GoogleMap>
                  ) : (
                    <div className="flex items-center justify-center h-full bg-muted">
                      <p className="text-muted-foreground">Loading map...</p>
                    </div>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Click on the map to set the location or drag the marker to adjust.
                </p>
              </CardContent>
            </Card>

            {isSubmitting && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Processing...</span>
                  <span>{Math.round(uploadProgress)}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}

            <div className="flex justify-between gap-4">
              <Button type="button" variant="destructive" onClick={handleDelete} disabled={isSubmitting}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Plot
              </Button>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => router.push("/dashboard/plots")}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this parking plot?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your parking plot and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
