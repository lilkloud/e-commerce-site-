import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Package, Truck, CheckCircle, Clock, X, ArrowLeft } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import OrderStatusControls from "@/components/order-status-controls"
import TrackPackageButton from "@/components/track-package"

interface OrderDetailPageProps {
  params: { id: string }
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch order details
  const { data: order } = await supabase
    .from("orders")
    .select(`
      *,
      order_items (
        *,
        products (
          name,
          description,
          price,
          image_url
        )
      )
    `)
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single()

  if (!order) {
    notFound()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "processing":
        return "bg-blue-100 text-blue-800"
      case "shipped":
        return "bg-purple-100 text-purple-800"
      case "delivered":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-5 w-5" />
      case "processing":
        return <Package className="h-5 w-5" />
      case "shipped":
        return <Truck className="h-5 w-5" />
      case "delivered":
        return <CheckCircle className="h-5 w-5" />
      case "cancelled":
        return <X className="h-5 w-5" />
      default:
        return <Package className="h-5 w-5" />
    }
  }

  const orderDate = new Date(order.created_at)
  const estimatedDelivery = new Date(orderDate.getTime() + 5 * 24 * 60 * 60 * 1000) // 5 days from order

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-2xl font-bold text-slate-900">
                Private
              </Link>
              <span className="text-sm text-slate-500">Order Details</span>
            </div>
            <Button variant="outline" asChild>
              <Link href="/orders">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Orders
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Order Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Order #{order.id.slice(0, 8)}</h1>
              <p className="text-slate-600">Placed on {orderDate.toLocaleDateString()}</p>
            </div>
            <Badge className={`${getStatusColor(order.status)} flex items-center space-x-1`}>
              {getStatusIcon(order.status)}
              <span>{order.status.toUpperCase()}</span>
            </Badge>
          </div>
          {/* Demo-only controls to advance status */}
          <OrderStatusControls orderId={order.id} currentStatus={order.status} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Items */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
                <CardDescription>{order.order_items.length} items in this order</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {order.order_items.map((item: any) => (
                  <div key={item.id} className="flex items-center space-x-4 p-4 bg-slate-50 rounded-lg">
                    <div className="relative w-20 h-20 flex-shrink-0">
                      <Image
                        src={item.products.image_url || "/placeholder.svg?height=80&width=80"}
                        alt={item.products.name}
                        fill
                        sizes="80px"
                        className="object-cover rounded-md"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-slate-900">{item.products.name}</h4>
                      <p className="text-sm text-slate-600 line-clamp-2">{item.products.description}</p>
                      <p className="text-sm text-slate-500 mt-1">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-slate-900">${(item.price * item.quantity).toFixed(2)}</p>
                      <p className="text-sm text-slate-500">${item.price.toFixed(2)} each</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Order Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Order Timeline</CardTitle>
                <CardDescription>Track your order progress</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-slate-900">Order Placed</h4>
                      <p className="text-sm text-slate-600">{orderDate.toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        ["processing", "shipped", "delivered"].includes(order.status) ? "bg-green-100" : "bg-slate-100"
                      }`}
                    >
                      <Package
                        className={`h-4 w-4 ${
                          ["processing", "shipped", "delivered"].includes(order.status)
                            ? "text-green-600"
                            : "text-slate-400"
                        }`}
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-slate-900">Processing</h4>
                      <p className="text-sm text-slate-600">
                        {["processing", "shipped", "delivered"].includes(order.status)
                          ? "Order is being prepared"
                          : "Waiting to be processed"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        ["shipped", "delivered"].includes(order.status) ? "bg-green-100" : "bg-slate-100"
                      }`}
                    >
                      <Truck
                        className={`h-4 w-4 ${
                          ["shipped", "delivered"].includes(order.status) ? "text-green-600" : "text-slate-400"
                        }`}
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-slate-900">Shipped</h4>
                      <p className="text-sm text-slate-600">
                        {["shipped", "delivered"].includes(order.status) ? "Order is on its way" : "Not yet shipped"}
                      </p>
                      {order.tracking_number && (
                        <p className="text-xs text-slate-500 mt-1">Tracking #: {order.tracking_number}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        order.status === "delivered" ? "bg-green-100" : "bg-slate-100"
                      }`}
                    >
                      <CheckCircle
                        className={`h-4 w-4 ${order.status === "delivered" ? "text-green-600" : "text-slate-400"}`}
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-slate-900">Delivered</h4>
                      <p className="text-sm text-slate-600">
                        {order.status === "delivered"
                          ? "Order has been delivered"
                          : `Expected by ${estimatedDelivery.toLocaleDateString()}`}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>${(order.total - 9.99 - order.total * 0.08).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Shipping</span>
                    <span>$9.99</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tax</span>
                    <span>${(order.total * 0.08).toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span>${order.total.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {order.tracking_number ? (
                  <TrackPackageButton trackingNumber={order.tracking_number} shippedAt={order.shipped_at} />
                ) : (
                  <Button variant="outline" className="w-full justify-start bg-transparent" disabled>
                    Track Package (available after shipping)
                  </Button>
                )}
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  Contact Support
                </Button>
                {order.status === "pending" && (
                  <Button
                    variant="outline"
                    className="w-full justify-start text-red-600 hover:text-red-700 bg-transparent"
                  >
                    Cancel Order
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
