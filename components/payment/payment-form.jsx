"use client"

import { useState } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Loader2, CreditCard, Wallet } from "lucide-react"
import { motion } from "framer-motion"

const paymentFormSchema = z
  .object({
    paymentMethod: z.enum(["credit_card", "paypal"], {
      required_error: "Please select a payment method",
    }),
    cardNumber: z
      .string()
      .optional()
      .refine((val) => !val || /^\d{16}$/.test(val), { message: "Card number must be 16 digits" }),
    cardName: z.string().optional(),
    expiryDate: z
      .string()
      .optional()
      .refine((val) => !val || /^(0[1-9]|1[0-2])\/\d{2}$/.test(val), {
        message: "Expiry date must be in MM/YY format",
      }),
    cvv: z
      .string()
      .optional()
      .refine((val) => !val || /^\d{3,4}$/.test(val), { message: "CVV must be 3 or 4 digits" }),
  })
  .refine(
    (data) => {
      if (data.paymentMethod === "credit_card") {
        return !!data.cardNumber && !!data.cardName && !!data.expiryDate && !!data.cvv
      }
      return true
    },
    {
      message: "Please fill in all credit card details",
      path: ["paymentMethod"],
    },
  )

export function PaymentForm({ amount, onPaymentComplete, onCancel, bookingDetails }) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentStep, setPaymentStep] = useState("details") // details, processing, success

  const form = useForm({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      paymentMethod: "credit_card",
      cardNumber: "",
      cardName: "",
      expiryDate: "",
      cvv: "",
    },
  })

  const watchPaymentMethod = form.watch("paymentMethod")

  const onSubmit = async (values) => {
    setIsProcessing(true)
    setPaymentStep("processing")

    try {
      // In a real app, you would process the payment with a payment gateway
      // For demo purposes, we'll simulate a successful payment after a delay
      await new Promise((resolve) => setTimeout(resolve, 2000))

      setPaymentStep("success")

      // Wait a moment to show success state before completing
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Call the callback with payment details
      onPaymentComplete({
        method: values.paymentMethod,
        status: "completed",
        transactionId: `tx_${Date.now()}`,
        amount,
      })
    } catch (error) {
      console.error("Payment error:", error)
      form.setError("root", {
        type: "manual",
        message: "Payment failed. Please try again.",
      })
      setPaymentStep("details")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Details</CardTitle>
        <CardDescription>Complete your payment to confirm booking</CardDescription>
      </CardHeader>

      {paymentStep === "details" && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              {/* Booking Summary */}
              <div className="bg-muted p-4 rounded-md mb-4">
                <h3 className="font-medium mb-2">Booking Summary</h3>
                <div className="text-sm space-y-1">
                  <p>
                    <span className="text-muted-foreground">Location:</span> {bookingDetails?.plotName}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Date:</span> {bookingDetails?.date}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Time:</span> {bookingDetails?.startTime} -{" "}
                    {bookingDetails?.endTime}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Duration:</span> {bookingDetails?.duration} hours
                  </p>
                </div>
              </div>

              <div className="text-2xl font-bold text-center mb-4">Total: ${amount}</div>

              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Payment Method</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="credit_card" />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer flex items-center">
                            <CreditCard className="mr-2 h-4 w-4" />
                            Credit Card
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="paypal" />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer flex items-center">
                            <Wallet className="mr-2 h-4 w-4" />
                            PayPal
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {watchPaymentMethod === "credit_card" && (
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="cardNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Card Number</FormLabel>
                        <FormControl>
                          <Input placeholder="1234 5678 9012 3456" {...field} />
                        </FormControl>
                        <FormDescription>Enter the 16-digit number on your card</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cardName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name on Card</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="expiryDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Expiry Date</FormLabel>
                          <FormControl>
                            <Input placeholder="MM/YY" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="cvv"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CVV</FormLabel>
                          <FormControl>
                            <Input placeholder="123" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}

              {watchPaymentMethod === "paypal" && (
                <div className="bg-muted p-4 rounded-md text-center">
                  <p className="text-sm text-muted-foreground mb-2">
                    You will be redirected to PayPal to complete your payment.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Note: This is a demo. No actual redirection will occur.
                  </p>
                </div>
              )}

              {form.formState.errors.root && (
                <div className="text-red-500 text-sm text-center">{form.formState.errors.root.message}</div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button type="button" variant="outline" onClick={onCancel} disabled={isProcessing}>
                Cancel
              </Button>
              <Button type="submit" disabled={isProcessing}>
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Pay $${amount}`
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      )}

      {paymentStep === "processing" && (
        <CardContent className="py-10">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="relative">
              <Loader2 className="h-16 w-16 animate-spin text-primary" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-8 w-8 rounded-full bg-background"></div>
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-medium">Processing Payment</h3>
              <p className="text-sm text-muted-foreground mt-1">Please wait while we process your payment...</p>
            </div>
          </div>
        </CardContent>
      )}

      {paymentStep === "success" && (
        <CardContent className="py-10">
          <div className="flex flex-col items-center justify-center space-y-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center"
            >
              <motion.svg
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="h-8 w-8 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </motion.svg>
            </motion.div>
            <div className="text-center">
              <h3 className="text-lg font-medium">Payment Successful!</h3>
              <p className="text-sm text-muted-foreground mt-1">Your booking has been confirmed.</p>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
