"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, CreditCard, Calendar, Lock } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export function PaymentForm({ amount, onSubmit, onCancel, processing = false }) {
  const [cardNumber, setCardNumber] = useState("")
  const [cardName, setCardName] = useState("")
  const [expiryDate, setExpiryDate] = useState("")
  const [cvv, setCvv] = useState("")
  const [errors, setErrors] = useState({})

  // Format card number with spaces
  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
    const matches = v.match(/\d{4,16}/g)
    const match = (matches && matches[0]) || ""
    const parts = []

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }

    if (parts.length) {
      return parts.join(" ")
    } else {
      return value
    }
  }

  // Format expiry date
  const formatExpiryDate = (value) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")

    if (v.length >= 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`
    }

    return v
  }

  // Validate form
  const validateForm = () => {
    const newErrors = {}

    if (!cardNumber.trim()) {
      newErrors.cardNumber = "Card number is required"
    } else if (cardNumber.replace(/\s+/g, "").length !== 16) {
      newErrors.cardNumber = "Card number must be 16 digits"
    }

    if (!cardName.trim()) {
      newErrors.cardName = "Cardholder name is required"
    }

    if (!expiryDate.trim()) {
      newErrors.expiryDate = "Expiry date is required"
    } else if (!/^\d{2}\/\d{2}$/.test(expiryDate)) {
      newErrors.expiryDate = "Expiry date must be in MM/YY format"
    }

    if (!cvv.trim()) {
      newErrors.cvv = "CVV is required"
    } else if (!/^\d{3,4}$/.test(cvv)) {
      newErrors.cvv = "CVV must be 3 or 4 digits"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault()

    if (validateForm()) {
      onSubmit({
        cardNumber: cardNumber.replace(/\s+/g, ""),
        cardName,
        expiryDate,
        cvv,
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="cardNumber">Card Number</Label>
        <div className="relative">
          <CreditCard className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="cardNumber"
            placeholder="1234 5678 9012 3456"
            value={cardNumber}
            onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
            className="pl-10"
            maxLength={19}
          />
        </div>
        {errors.cardNumber && <p className="text-sm text-red-500">{errors.cardNumber}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="cardName">Cardholder Name</Label>
        <Input id="cardName" placeholder="John Doe" value={cardName} onChange={(e) => setCardName(e.target.value)} />
        {errors.cardName && <p className="text-sm text-red-500">{errors.cardName}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="expiryDate">Expiry Date</Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="expiryDate"
              placeholder="MM/YY"
              value={expiryDate}
              onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
              className="pl-10"
              maxLength={5}
            />
          </div>
          {errors.expiryDate && <p className="text-sm text-red-500">{errors.expiryDate}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="cvv">CVV</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="cvv"
              placeholder="123"
              value={cvv}
              onChange={(e) => setCvv(e.target.value.replace(/[^0-9]/g, ""))}
              className="pl-10"
              maxLength={4}
              type="password"
            />
          </div>
          {errors.cvv && <p className="text-sm text-red-500">{errors.cvv}</p>}
        </div>
      </div>

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="payment-methods">
          <AccordionTrigger className="text-sm">Other Payment Methods</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2 pt-2">
              <Button variant="outline" className="w-full justify-start" type="button" disabled>
                <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                    fill="#FFD700"
                    stroke="#FFD700"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Pay with PayPal
              </Button>
              <Button variant="outline" className="w-full justify-start" type="button" disabled>
                <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="2" y="6" width="20" height="12" rx="2" stroke="currentColor" strokeWidth="2" />
                  <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
                </svg>
                Apple Pay
              </Button>
              <p className="text-xs text-muted-foreground text-center mt-2">Additional payment methods coming soon</p>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="pt-2 flex flex-col space-y-2">
        <Button type="submit" className="w-full" disabled={processing}>
          {processing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            `Pay $${amount.toFixed(2)}`
          )}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={processing}>
          Cancel
        </Button>
      </div>

      <div className="text-xs text-center text-muted-foreground">
        <p>This is a demo application. No actual payment will be processed.</p>
        <p>You can use any card details for testing.</p>
      </div>
    </form>
  )
}
