import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Package, Eye, Calendar, DollarSign } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default async function OrdersPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login?next=/orders")
  }

  // Fetch user's orders
  const { data: orders } = await supabase
    .from("orders")
    .select(`
      *,
      order_items (
        *,
        products (
          name,
          image_url
        )
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

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
              <span className="text-sm text-slate-500">Order History</span>
            </div>
            <Button variant="outline" asChild>
              <Link href="/">Continue Shopping</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Your Orders</h1>
          <p className="text-slate-600">Track and manage your purchases</p>
        </div>

        {!orders || orders.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Package className="h-16 w-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No orders yet</h3>
              <p className="text-slate-500 mb-6">When you place your first order, it will appear here.</p>
              <Button asChild className="bg-blue-600 hover:bg-blue-700">
                <Link href="/">Start Shopping</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {orders.map((order: any) => (
              <Card key={order.id} className="overflow-hidden">
                <CardHeader className="bg-slate-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">Order #{order.id.slice(0, 8)}</CardTitle>
                      <CardDescription className="flex items-center space-x-4 mt-1">
                        <span className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(order.created_at).toLocaleDateString()}
                        </span>
                        <span className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-1" />${order.total.toFixed(2)}
                        </span>
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge className={getStatusColor(order.status)}>{order.status.toUpperCase()}</Badge>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/orders/${order.id}`}>
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="flex -space-x-2">
                      {order.order_items.slice(0, 3).map((item: any, index: number) => (
                        <div
                          key={item.id}
                          className="relative w-12 h-12 rounded-lg overflow-hidden border-2 border-white"
                        >
                          <Image
                            src={item.products.image_url || "/placeholder.svg?height=48&width=48"}
                            alt={item.products.name}
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        </div>
                      ))}
                      {order.order_items.length > 3 && (
                        <div className="w-12 h-12 rounded-lg bg-slate-200 border-2 border-white flex items-center justify-center">
                          <span className="text-xs font-medium text-slate-600">+{order.order_items.length - 3}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-slate-600">
                        {order.order_items.length} item{order.order_items.length !== 1 ? "s" : ""}
                      </p>
                      <p className="text-sm font-medium text-slate-900">
                        {order.order_items[0]?.products.name}
                        {order.order_items.length > 1 && ` and ${order.order_items.length - 1} more`}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
