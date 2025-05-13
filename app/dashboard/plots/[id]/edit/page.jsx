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
import { Loader2, Upload, X, Trash2 } from "lucide-react"
import { useAuth } from "@/lib/firebase/auth-context"
import { useFirebase } from "@/lib/firebase/firebase-provider"
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api"

const formSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters" }),
  address: z.string().min(5, { message: "Address must be at least 5 characters" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  price: z.coerce.number().positive({ message: "Price must be a positive number" }),
  totalSlots: z.coerce.number().int().positive({ message: "Total slots must be a positive integer" }),
})

// Dummy plot data
const dummyPlot = {
  id: "plot1",
  name: "Downtown Parking",
  address: "123 Main St, Downtown",
  description: "Conveniently located parking in the heart of downtown. Easy access to shops, restaurants, and offices.",
  price: 5,
  availableSlots: 8,
  totalSlots: 15,
  lat: 40.7128,
  lng: -74.006,
  images: ["/placeholder.svg?height=300&width=500", "/placeholder.svg?height=300&width=500"],
  features: ["24/7 Access", "Security Cameras", "Covered Parking"],
}

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
  const [images, setImages] = useState([])
  const [imageUrls, setImageUrls] = useState([])
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
        // In a real app, you would fetch from Firestore
        // const docRef = doc(db, "plots", params.id)
        // const docSnap = await getDoc(docRef)
        // if (docSnap.exists()) {
        //   const plotData = { id: docSnap.id, ...docSnap.data() }
        //   setPlot(plotData)
        //   form.reset({
        //     name: plotData.name,
        //     address: plotData.address,
        //     description: plotData.description,
        //     price: plotData.price,
        //     totalSlots: plotData.totalSlots,
        //   })
        //   setImageUrls(plotData.images || [])
        //   setMarkerPosition({ lat: plotData.lat, lng: plotData.lng })
        // }

        // For demo, use dummy data
        setPlot(dummyPlot)
        form.reset({
          name: dummyPlot.name,
          address: dummyPlot.address,
          description: dummyPlot.description,
          price: dummyPlot.price,
          totalSlots: dummyPlot.totalSlots,
        })
        setImageUrls(dummyPlot.images || [])
        setMarkerPosition({ lat: dummyPlot.lat, lng: dummyPlot.lng })
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
  }, [params.id, form, toast, db])

  const handleImageChange = (e) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setImages((prev) => [...prev, ...newFiles])

      // Create preview URLs for the images
      newFiles.forEach((file) => {
        const url = URL.createObjectURL(file)
        setImageUrls((prev) => [...prev, url])
      })
    }
  }

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
    setImageUrls((prev) => prev.filter((_, i) => i !== index))
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

    try {
      // In a real app, you would update in Firestore
      // const docRef = doc(db, "plots", params.id)
      // await updateDoc(docRef, {
      //   name: values.name,
      //   address: values.address,
      //   description: values.description,
      //   price: values.price,
      //   totalSlots: values.totalSlots,
      //   lat: markerPosition.lat,
      //   lng: markerPosition.lng,
      //   updatedAt: new Date().toISOString(),
      // })

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
    if (confirm("Are you sure you want to delete this parking plot? This action cannot be undone.")) {
      try {
        // In a real app, you would delete from Firestore
        // const docRef = doc(db, "plots", params.id)
        // await deleteDoc(docRef)

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
      }
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
                        <FormLabel>Price per Hour (₹)</FormLabel>
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

                  <div>
                    <FormLabel>Current Images</FormLabel>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      {imageUrls.map((url, index) => (
                        <div key={index} className="relative rounded-md overflow-hidden">
                          <img
                            src={url || "/placeholder.svg"}
                            alt={`Plot image ${index + 1}`}
                            className="w-full h-24 object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 bg-black bg-opacity-50 rounded-full p-1"
                          >
                            <X className="h-4 w-4 text-white" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <FormLabel>Add More Images</FormLabel>
                    <div className="mt-2">
                      <label htmlFor="images" className="cursor-pointer">
                        <div className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center">
                          <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground">Drag and drop images here or click to browse</p>
                          <p className="text-xs text-muted-foreground mt-1">JPG, PNG or GIF, up to 5MB each</p>
                        </div>
                        <Input
                          id="images"
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={handleImageChange}
                        />
                      </label>
                    </div>
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

            <div className="flex justify-between gap-4">
              <Button type="button" variant="destructive" onClick={handleDelete}>
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
    </div>
  )
}
