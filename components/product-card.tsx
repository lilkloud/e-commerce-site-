"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Heart } from "lucide-react"
import type { Database } from "@/lib/supabase/client"
import { useCart } from "@/lib/cart-context"
import { useState } from "react"
import { toast } from "sonner"

type Product = Database["public"]["Tables"]["products"]["Row"] & {
  categories: Database["public"]["Tables"]["categories"]["Row"] | null
}

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart()
  const [isAdding, setIsAdding] = useState(false)
  const isInStock = product.stock_quantity > 0
  const isLowStock = product.stock_quantity <= 10 && product.stock_quantity > 0

  const handleAddToCart = async () => {
    if (!isInStock) return

    setIsAdding(true)
    try {
      await addToCart(product, 1)
      toast.success("Added to cart", { description: product.name })
    } catch (error) {
      console.error("Error adding to cart:", error)
      toast.error("Failed to add to cart")
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow duration-200 overflow-hidden group">
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden bg-slate-100">
        <Link href={`/products/${product.id}`} aria-label={product.name} className="block h-full w-full">
          <Image
            src={product.image_url || "/placeholder.svg?height=400&width=400"}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
            className="object-cover group-hover:scale-105 transition-transform duration-200"
          />
        </Link>
        {!isInStock && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <Badge variant="secondary" className="bg-red-500 text-white">
              Out of Stock
            </Badge>
          </div>
        )}
        {isLowStock && isInStock && <Badge className="absolute top-3 left-3 bg-orange-500 text-white">Low Stock</Badge>}
        <button
          className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-50"
          aria-label="Add to wishlist"
          title="Add to wishlist"
        >
          <Heart className="h-4 w-4 text-slate-600" />
        </button>
      </div>

      {/* Product Info */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            {product.categories && (
              <Badge variant="outline" className="text-xs mb-2">
                {product.categories.name}
              </Badge>
            )}
            <Link href={`/products/${product.id}`} className="hover:underline">
              <h3 className="font-semibold text-slate-900 line-clamp-2 leading-tight">{product.name}</h3>
            </Link>
          </div>
        </div>

        {product.description && <p className="text-sm text-slate-600 line-clamp-2 mb-3">{product.description}</p>}

        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-slate-900">${product.price.toFixed(2)}</span>
            <span className="text-xs text-slate-500">{product.stock_quantity} in stock</span>
          </div>

          <Button
            size="sm"
            disabled={!isInStock || isAdding}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={handleAddToCart}
          >
            <ShoppingCart className="h-4 w-4 mr-1" />
            {isAdding ? "Adding..." : "Add to Cart"}
          </Button>
        </div>
      </div>
    </div>
  )
}
