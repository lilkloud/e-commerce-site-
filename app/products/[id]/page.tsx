import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import ProductDetailClient from "@/components/product-detail-client"
import { Suspense } from "react"
import ProductDetailSkeleton from "@/components/skeletons/ProductDetailSkeleton"
import type { Metadata } from "next"

interface ProductPageProps {
  params: { id: string }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const supabase = createClient()
  
  // Get product details
  const { data: product, error } = await supabase
    .from("products")
    .select(`
      *,
      categories(id, name)
    `)
    .eq("id", params.id)
    .single()

  if (error || !product) {
    notFound()
  }

  // Get related products from the same category
  const { data: relatedProducts } = await supabase
    .from("products")
    .select(`
      *,
      categories(id, name)
    `)
    .eq("category_id", product.category_id)
    .neq("id", product.id)
    .limit(4)

  // Get user for authentication state
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <Suspense fallback={<ProductDetailSkeleton />}>
      {/* JSON-LD Product schema for SEO */}
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: product.name,
            description: product.description || undefined,
            image: product.image_url ? [product.image_url] : undefined,
            brand: {
              "@type": "Brand",
              name: "Private",
            },
            offers: {
              "@type": "Offer",
              priceCurrency: "USD",
              price: Number(product.price).toFixed(2),
              availability: product.stock_quantity > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            },
          }),
        }}
      />
      <ProductDetailClient 
        product={product} 
        relatedProducts={relatedProducts || []}
        user={user}
      />
    </Suspense>
  )
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const supabase = createClient()
  const { data: product } = await supabase
    .from("products")
    .select("id,name,description,image_url,updated_at")
    .eq("id", params.id)
    .maybeSingle()

  if (!product) return { title: "Product · Private" }

  const site = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  const title = `${product.name} · Private`
  const description = product.description || "Shop quality products on Private."
  const url = `${site}/products/${product.id}`
  const images = product.image_url ? [{ url: product.image_url, width: 1200, height: 630, alt: product.name }] : undefined

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      type: "product",
      images,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: images?.map(i => i.url),
    },
    alternates: { canonical: url },
  }
}
