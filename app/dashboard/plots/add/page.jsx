"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Upload, X } from "lucide-react"
import { useAuth } from "@/lib/firebase/auth-context"
import { useFirebase } from "@/lib/firebase/firebase-provider"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"

const formSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters" }),
  address: z.string().min(5, { message: "Address must be at least 5 characters" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  price: z.coerce.number().positive({ message: "Price must be a positive number" }),
  totalSlots: z.coerce.number().int().positive({ message: "Total slots must be a positive integer" }),
})

export default function AddPlotPage() {
  const { user } = useAuth()
  const { db, storage } = useFirebase()
  const router = useRouter()
  const { toast } = useToast()
  const [images, setImages] = useState([])
  const [imageUrls, setImageUrls] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)

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

  const handleImageChange = (e) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setImages((prev) => [...prev, ...newFiles])
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

  const onSubmit = async (values) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: "You must be logged in to add a parking plot.",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const uploadedImageUrls = []

      for (const image of images) {
        const storageRef = ref(storage, `plots/${user.uid}/${Date.now()}_${image.name}`)
        await uploadBytes(storageRef, image)
        const downloadUrl = await getDownloadURL(storageRef)
        uploadedImageUrls.push(downloadUrl)
      }

      const plotData = {
        name: values.name,
        address: values.address,
        description: values.description,
        price: values.price,
        totalSlots: values.totalSlots,
        availableSlots: values.totalSlots,
        ownerId: user.uid,
        ownerName: user.displayName || "Unknown",
        images: uploadedImageUrls,
        features: [],
        reviews: [],
        createdAt: new Date().toISOString(),
      }

      console.log("Adding plot to Firestore:", plotData)
      // e.g. await addDoc(collection(db, "plots"), plotData)

      toast({
        title: "Plot Added Successfully",
        description: "Your parking plot has been added and is now available for booking.",
      })
      router.push("/dashboard/plots")
    } catch (error) {
      console.error("Error adding plot:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "There was an error adding your parking plot. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-6">Add Parking Plot</h1>

      <div className="grid gap-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Plot Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Downtown Parking" {...field} />
                          </FormControl>
                          <FormDescription>Give your parking plot a descriptive name.</FormDescription>
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
                          <FormDescription>Enter the full address of your parking plot.</FormDescription>
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
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price per Hour ($)</FormLabel>
                          <FormControl>
                            <Input type="number" min="0" step="0.5" {...field} />
                          </FormControl>
                          <FormDescription>Set the hourly rate for parking.</FormDescription>
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
                          <FormDescription>Enter the total number of parking spaces available.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div>
                      <FormLabel>Upload Images</FormLabel>
                      <div className="mt-2">
                        <label htmlFor="images" className="cursor-pointer">
                          <div className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center">
                            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground">
                              Drag and drop images here or click to browse
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              JPG, PNG or GIF, up to 5MB each
                            </p>
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

                      {imageUrls.length > 0 && (
                        <div className="mt-4 grid grid-cols-2 gap-2">
                          {imageUrls.map((url, index) => (
                            <div key={index} className="relative rounded-md overflow-hidden">
                              <img
                                src={url}
                                alt={`Preview ${index + 1}`}
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
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => router.push("/dashboard/plots")}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding Plot...
                  </>
                ) : (
                  "Add Plot"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}
