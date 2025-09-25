import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import OrderStatusControls from "@/components/order-status-controls"

function getStatusColor(status: string) {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800"
    case "paid":
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

export default async function AdminOrdersPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login?next=/admin/orders")

  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map((e) => e.trim().toLowerCase()).filter(Boolean)
  const isAdmin = !!user.email && adminEmails.includes(user.email.toLowerCase())
  if (!isAdmin) redirect("/")

  const { data: orders } = await supabase
    .from("orders")
    .select(`*, order_items(*, products(name, image_url))`)
    .order("created_at", { ascending: false })

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Admin · Orders</h1>
          <p className="text-slate-600">Manage and update customer orders</p>
        </div>
        <Button asChild variant="outline"><Link href="/">Back to Store</Link></Button>
      </div>

      {!orders || orders.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No orders</CardTitle>
            <CardDescription>Orders will appear here as customers checkout</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-6">
          {orders.map((order: any) => (
            <Card key={order.id}>
              <CardHeader className="flex items-center justify-between gap-4">
                <div>
                  <CardTitle>Order #{order.id.slice(0, 8)}</CardTitle>
                  <CardDescription>
                    Placed {new Date(order.created_at).toLocaleString()} · ${order.total.toFixed(2)}
                  </CardDescription>
                </div>
                <Badge className={getStatusColor(order.status)}>{order.status.toUpperCase()}</Badge>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex -space-x-2">
                    {order.order_items.slice(0, 3).map((item: any) => (
                      <div key={item.id} className="relative w-10 h-10 rounded-md overflow-hidden border">
                        <Image src={item.products.image_url || "/placeholder.svg?height=40&width=40"} alt={item.products.name} fill sizes="40px" className="object-cover" />
                      </div>
                    ))}
                  </div>
                  <div className="text-sm text-slate-600">
                    {order.order_items.length} item{order.order_items.length !== 1 ? "s" : ""}
                  </div>
                  <Button asChild variant="outline" size="sm"><Link href={`/orders/${order.id}`}>View</Link></Button>
                </div>
                <OrderStatusControls orderId={order.id} currentStatus={order.status} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </main>
  )
}
