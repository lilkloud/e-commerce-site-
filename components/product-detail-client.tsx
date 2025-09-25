"use client"

import Image from "next/image"
import Link from "next/link"
import { useCart } from "@/lib/cart-context"
import type { Database } from "@/lib/supabase/client"
import ProductGrid from "@/components/product-grid"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"
import { toast } from "sonner"

type Category = Database["public"]["Tables"]["categories"]["Row"]

type Product = Database["public"]["Tables"]["products"]["Row"] & {
  categories: Category | null
}

interface Props {
  product: Product
  relatedProducts: Product[]
  user: { id?: string | null; email?: string | null } | null
}

export default function ProductDetailClient({ product, relatedProducts }: Props) {
  const { addToCart } = useCart()
  const [isAdding, setIsAdding] = useState(false)
  const isInStock = product.stock_quantity > 0
  const isLowStock = product.stock_quantity > 0 && product.stock_quantity <= 5

  const handleAddToCart = async () => {
    if (!isInStock) return
    setIsAdding(true)
    try {
      await addToCart(product, 1)
      toast.success("Added to cart", { description: product.name })
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Image */}
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="relative aspect-square">
              <Image
                src={product.image_url || "/placeholder.svg?height=800&width=800"}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 50vw, 100vw"
              />
              {!isInStock && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-white text-sm font-medium bg-black/60 px-3 py-1 rounded-full">Out of stock</span>
                </div>
              )}
            </div>
          </div>

          {/* Details */}
          <div>
            <div className="mb-3">
              {product.categories && (
                <Badge variant="outline">{product.categories.name}</Badge>
              )}
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">{product.name}</h1>
            {product.description && (
              <p className="text-slate-600 mb-6">{product.description}</p>
            )}

            <div className="flex items-end justify-between mb-6">
              <div>
                <div className="text-3xl font-bold text-slate-900">${product.price.toFixed(2)}</div>
                <div className="text-sm text-slate-500">{product.stock_quantity} in stock</div>
              </div>
            </div>

            <div className="flex gap-3 items-center">
              <Button onClick={handleAddToCart} disabled={!isInStock || isAdding} className="bg-blue-600 hover:bg-blue-700 text-white">
                {isAdding ? "Adding..." : isInStock ? "Add to Cart" : "Unavailable"}
              </Button>
              <Button variant="outline" asChild>
                <Link href="/checkout">Go to Checkout</Link>
              </Button>
              {isLowStock && isInStock && (
                <Badge className="bg-orange-500 text-white">Low stock</Badge>
              )}
            </div>
          </div>
        </div>

        {/* Related products */}
        {relatedProducts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">You may also like</h2>
            <ProductGrid products={relatedProducts} />
          </div>
        )}
      </div>
    </div>
  )
}
