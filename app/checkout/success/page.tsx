import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Package } from "lucide-react"
import Link from "next/link"

interface SuccessPageProps {
  searchParams: { orderId?: string }
}

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const orderId = searchParams.orderId

  if (!orderId) {
    redirect("/")
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
          price,
          image_url
        )
      )
    `)
    .eq("id", orderId)
    .eq("user_id", user.id)
    .single()

  if (!order) {
    redirect("/")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-slate-900">ShopHub</h1>
              <span className="text-sm text-slate-500">Order Confirmation</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Success Message */}
        <div className="text-center mb-8">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Order Confirmed!</h1>
          <p className="text-slate-600">Thank you for your purchase. Your order has been successfully placed.</p>
        </div>

        {/* Order Details */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Order Details</CardTitle>
            <CardDescription>Order #{order.id.slice(0, 8)}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Order Items */}
            <div>
              <h3 className="font-semibold text-slate-900 mb-3">Items Ordered</h3>
              <div className="space-y-3">
                {order.order_items.map((item: any) => (
                  <div key={item.id} className="flex items-center space-x-4 p-3 bg-slate-50 rounded-lg">
                    <div className="relative w-16 h-16 flex-shrink-0">
                      <img
                        src={item.products.image_url || "/placeholder.svg?height=64&width=64"}
                        alt={item.products.name}
                        className="w-full h-full object-cover rounded-md"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-slate-900">{item.products.name}</h4>
                      <p className="text-sm text-slate-500">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-slate-900">${(item.price * item.quantity).toFixed(2)}</p>
                      <p className="text-sm text-slate-500">${item.price.toFixed(2)} each</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Total */}
            <div className="border-t pt-4">
              <div className="flex justify-between text-lg font-semibold">
                <span>Total Paid</span>
                <span>${order.total.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="h-5 w-5 mr-2" />
              What's Next?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-semibold text-blue-600">1</span>
              </div>
              <div>
                <h4 className="font-medium text-slate-900">Order Processing</h4>
                <p className="text-sm text-slate-600">We're preparing your items for shipment.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-semibold text-slate-600">2</span>
              </div>
              <div>
                <h4 className="font-medium text-slate-900">Shipping</h4>
                <p className="text-sm text-slate-600">You'll receive a tracking number once your order ships.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-semibold text-slate-600">3</span>
              </div>
              <div>
                <h4 className="font-medium text-slate-900">Delivery</h4>
                <p className="text-sm text-slate-600">Your order will arrive within 3-5 business days.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild className="bg-blue-600 hover:bg-blue-700">
            <Link href="/">Continue Shopping</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/orders">View All Orders</Link>
          </Button>
        </div>
      </main>
    </div>
  )
}
