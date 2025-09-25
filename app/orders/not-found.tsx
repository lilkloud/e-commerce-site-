import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Package } from "lucide-react"
import Link from "next/link"

export default function OrderNotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardContent className="text-center py-12">
          <Package className="h-16 w-16 text-slate-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Order Not Found</h1>
          <p className="text-slate-600 mb-6">
            The order you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <div className="space-y-2">
            <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
              <Link href="/orders">View All Orders</Link>
            </Button>
            <Button variant="outline" asChild className="w-full bg-transparent">
              <Link href="/">Continue Shopping</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
