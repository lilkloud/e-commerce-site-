"use client"

import type React from "react"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { loadStripe } from "@stripe/stripe-js"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/lib/cart-context"
import { createOrder } from "@/lib/actions"
import { Loader2, CreditCard, Truck } from "lucide-react"
import Image from "next/image"
import type { User } from "@supabase/supabase-js"

interface CheckoutFormProps {
  user: User
}

export default function CheckoutForm({ user }: CheckoutFormProps) {
  const { state, clearCart } = useCart()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isPaying, setIsPaying] = useState(false)
  const [couponInput, setCouponInput] = useState("")
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; percent_off: number } | null>(null)
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false)

  const schema = z.object({
    firstName: z.string().min(1, "Required"),
    lastName: z.string().min(1, "Required"),
    email: z.string().email("Invalid email"),
    phone: z.string().min(7, "Invalid phone"),
    address: z.string().min(1, "Required"),
    city: z.string().min(1, "Required"),
    state: z.string().min(1, "Required"),
    zipCode: z.string().min(3, "Invalid ZIP"),
    country: z.string().min(1, "Required"),
    cardName: z.string().min(1, "Required"),
    cardNumber: z
      .string()
      .replace(/\s+/g, "")
      .regex(/^\d{13,19}$/, "Invalid card number"),
    expiryDate: z.string().regex(/^(0[1-9]|1[0-2])\/(\d{2})$/, "MM/YY"),
    cvv: z.string().regex(/^\d{3,4}$/, "Invalid CVV"),
  })

  type FormValues = z.infer<typeof schema>

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
    firstName: "",
    lastName: "",
    email: user.email || "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "United States",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardName: "",
    },
  })

  const onSubmit = async (values: FormValues) => {
    if (state.items.length === 0) return
    setIsSubmitting(true)
    try {
      const orderData = {
        items: state.items,
        total: state.total,
        shippingAddress: {
          firstName: values.firstName,
          lastName: values.lastName,
          address: values.address,
          city: values.city,
          state: values.state,
          zipCode: values.zipCode,
          country: values.country,
        },
        paymentMethod: {
          cardNumber: values.cardNumber.replace(/\s+/g, "").slice(-4),
          cardName: values.cardName,
        },
      }

      const result = await createOrder(orderData)
      if (result.success) {
        await clearCart()
        toast.success("Order created")
        router.push(`/checkout/success?orderId=${result.orderId}`)
      } else {
        toast.error("Failed to create order. Please try again.")
      }
    } catch (error) {
      console.error("Checkout error:", error)
      toast.error("An error occurred during checkout. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Stripe Checkout flow
  const onSubmitStripe = async (values: FormValues) => {
    if (state.items.length === 0) return
    setIsPaying(true)
    try {
      const stripePk = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
      if (!stripePk) {
        toast.error("Stripe publishable key is not configured.")
        return
      }

      // 1) Create a pending order in Supabase
      const orderData = {
        items: state.items,
        total: finalTotal,
        shippingAddress: {
          firstName: values.firstName,
          lastName: values.lastName,
          address: values.address,
          city: values.city,
          state: values.state,
          zipCode: values.zipCode,
          country: values.country,
        },
        paymentMethod: { provider: "stripe", coupon: appliedCoupon?.code || null },
      }
      const orderResult = await createOrder(orderData as any)
      if (!orderResult?.success || !orderResult.orderId) {
        toast.error("Failed to create order. Please try again.")
        return
      }

      // 2) Create Checkout Session on the server
      const res = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: orderResult.orderId,
          items: state.items.map((i) => ({ productId: i.product.id, quantity: i.quantity })),
          couponCode: appliedCoupon?.code || undefined,
        }),
      })
      if (!res.ok) {
        toast.error("Failed to initiate Stripe checkout.")
        return
      }
      const data = await res.json()

      const stripe = await loadStripe(stripePk)
      if (!stripe) {
        toast.error("Failed to load Stripe.")
        return
      }

      // Prefer redirectToCheckout by sessionId if available
      if (data.id) {
        const { error } = await stripe.redirectToCheckout({ sessionId: data.id })
        if (error) {
          console.error(error)
          toast.error("Stripe redirect failed")
        } else {
          toast.message("Redirecting to Stripe…")
        }
      } else if (data.url) {
        toast.message("Redirecting to Stripe…")
        window.location.href = data.url
      } else {
        toast.error("Invalid response from Stripe session API")
      }
    } catch (err) {
      console.error("Stripe checkout error", err)
      toast.error("An error occurred starting payment. Please try again.")
    } finally {
      setIsPaying(false)
    }
  }

  if (state.items.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-slate-400 text-lg mb-4">Your cart is empty</div>
        <Button onClick={() => router.push("/")} className="bg-blue-600 hover:bg-blue-700">
          Continue Shopping
        </Button>
      </div>
    )
  }

  const shippingCost = 9.99
  const discount = appliedCoupon ? state.total * (appliedCoupon.percent_off / 100) : 0
  const taxableSubtotal = Math.max(0, state.total - discount)
  const tax = taxableSubtotal * 0.08
  const finalTotal = taxableSubtotal + shippingCost + tax

  const applyCoupon = async () => {
    const code = couponInput.trim()
    if (!code) return
    setIsApplyingCoupon(true)
    try {
      const params = new URLSearchParams({ code, subtotal: String(state.total) })
      const res = await fetch(`/api/coupons/validate?${params.toString()}`)
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || "Invalid coupon")
        setAppliedCoupon(null)
        return
      }
      setAppliedCoupon({ code: data.code, percent_off: data.percent_off })
      toast.success(`Coupon ${data.code} applied`)
    } catch (e) {
      console.error(e)
      toast.error("Failed to validate coupon")
    } finally {
      setIsApplyingCoupon(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left Column - Forms */}
      <div className="space-y-6">
        {/* Shipping Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Truck className="h-5 w-5 mr-2" />
              Shipping Information
            </CardTitle>
            <CardDescription>Where should we deliver your order?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-slate-700 mb-1">
                  First Name
                </label>
                <Input id="firstName" {...register("firstName")} aria-invalid={!!errors.firstName} />
                {errors.firstName && <p className="text-xs text-red-600 mt-1">{errors.firstName.message}</p>}
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-slate-700 mb-1">
                  Last Name
                </label>
                <Input id="lastName" {...register("lastName")} aria-invalid={!!errors.lastName} />
                {errors.lastName && <p className="text-xs text-red-600 mt-1">{errors.lastName.message}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                Email
              </label>
              <Input id="email" type="email" {...register("email")} aria-invalid={!!errors.email} />
              {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1">
                Phone Number
              </label>
              <Input id="phone" type="tel" {...register("phone")} aria-invalid={!!errors.phone} />
              {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone.message}</p>}
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-slate-700 mb-1">
                Address
              </label>
              <Input id="address" {...register("address")} aria-invalid={!!errors.address} />
              {errors.address && <p className="text-xs text-red-600 mt-1">{errors.address.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-slate-700 mb-1">
                  City
                </label>
                <Input id="city" {...register("city")} aria-invalid={!!errors.city} />
                {errors.city && <p className="text-xs text-red-600 mt-1">{errors.city.message}</p>}
              </div>
              <div>
                <label htmlFor="state" className="block text-sm font-medium text-slate-700 mb-1">
                  State
                </label>
                <Input id="state" {...register("state")} aria-invalid={!!errors.state} />
                {errors.state && <p className="text-xs text-red-600 mt-1">{errors.state.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="zipCode" className="block text-sm font-medium text-slate-700 mb-1">
                  ZIP Code
                </label>
                <Input id="zipCode" {...register("zipCode")} aria-invalid={!!errors.zipCode} />
                {errors.zipCode && <p className="text-xs text-red-600 mt-1">{errors.zipCode.message}</p>}
              </div>
              <div>
                <label htmlFor="country" className="block text-sm font-medium text-slate-700 mb-1">
                  Country
                </label>
                <Input id="country" {...register("country")} aria-invalid={!!errors.country} />
                {errors.country && <p className="text-xs text-red-600 mt-1">{errors.country.message}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="h-5 w-5 mr-2" />
              Payment Information
            </CardTitle>
            <CardDescription>Enter your payment details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="cardName" className="block text-sm font-medium text-slate-700 mb-1">
                Name on Card
              </label>
              <Input id="cardName" {...register("cardName")} aria-invalid={!!errors.cardName} />
              {errors.cardName && <p className="text-xs text-red-600 mt-1">{errors.cardName.message}</p>}
            </div>

            <div>
              <label htmlFor="cardNumber" className="block text-sm font-medium text-slate-700 mb-1">
                Card Number
              </label>
              <Input
                id="cardNumber"
                placeholder="1234 5678 9012 3456"
                {...register("cardNumber")}
                aria-invalid={!!errors.cardNumber}
                onChange={(e) => setValue("cardNumber", e.target.value.replace(/[^\d]/g, "").replace(/(.{4})/g, "$1 ").trim())}
              />
              {errors.cardNumber && <p className="text-xs text-red-600 mt-1">{errors.cardNumber.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="expiryDate" className="block text-sm font-medium text-slate-700 mb-1">
                  Expiry Date
                </label>
                <Input
                  id="expiryDate"
                  placeholder="MM/YY"
                  {...register("expiryDate")}
                  aria-invalid={!!errors.expiryDate}
                  onChange={(e) => setValue("expiryDate", e.target.value.replace(/[^\d]/g, "").replace(/(\d{2})(\d{0,2}).*/, (m, a, b) => (b ? `${a}/${b}` : a)))}
                />
                {errors.expiryDate && <p className="text-xs text-red-600 mt-1">{errors.expiryDate.message}</p>}
              </div>
              <div>
                <label htmlFor="cvv" className="block text-sm font-medium text-slate-700 mb-1">
                  CVV
                </label>
                <Input id="cvv" placeholder="123" {...register("cvv")} aria-invalid={!!errors.cvv} />
                {errors.cvv && <p className="text-xs text-red-600 mt-1">{errors.cvv.message}</p>}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Column - Order Summary */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
            <CardDescription>{state.itemCount} items in your cart</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Order Items */}
            <div className="space-y-3">
              {state.items.map((item) => (
                <div key={item.product.id} className="flex items-center space-x-3">
                  <div className="relative w-12 h-12 flex-shrink-0">
                    <Image
                      src={item.product.image_url || "/placeholder.svg?height=48&width=48"}
                      alt={item.product.name}
                      fill
                      className="object-cover rounded-md"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-slate-900 truncate">{item.product.name}</h4>
                    <p className="text-sm text-slate-500">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-sm font-medium text-slate-900">
                    ${(item.product.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            <Separator />

            {/* Order Totals */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>${state.total.toFixed(2)}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-sm text-green-700">
                  <span>Discount ({appliedCoupon.code})</span>
                  <span>- ${discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span>Shipping</span>
                <span>${shippingCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tax</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span>${finalTotal.toFixed(2)}</span>
              </div>
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing Order...
                </>
              ) : (
                `Complete Order - $${finalTotal.toFixed(2)}`
              )}
            </Button>

            {/* Coupon Apply */}
            <div className="flex gap-2">
              <Input
                placeholder="Coupon code"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
              />
              <Button type="button" variant="outline" onClick={applyCoupon} disabled={isApplyingCoupon}>
                {isApplyingCoupon ? "Applying…" : "Apply"}
              </Button>
            </div>
            {appliedCoupon && (
              <div className="text-xs text-green-700">
                Applied {appliedCoupon.code} ({appliedCoupon.percent_off}% off)
              </div>
            )}

            <Button
              type="button"
              onClick={handleSubmit(onSubmitStripe)}
              disabled={isPaying}
              className="w-full bg-black hover:bg-black/90 text-white"
            >
              {isPaying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Redirecting to Stripe…
                </>
              ) : (
                "Pay with Stripe"
              )}
            </Button>

            <div className="text-xs text-slate-500 text-center">
              By completing your order, you agree to our Terms of Service and Privacy Policy.
            </div>
          </CardContent>
        </Card>
      </div>
    </form>
  )
}
