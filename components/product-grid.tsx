import ProductCard from "./product-card"
import type { Database } from "@/lib/supabase/client"
import { VirtuosoGrid } from "react-virtuoso"
import { Loader2 } from "lucide-react"

type Product = Database["public"]["Tables"]["products"]["Row"] & {
  categories: Database["public"]["Tables"]["categories"]["Row"] | null
}

interface ProductGridProps {
  products: Product[]
  loadMore?: () => void
  hasMore?: boolean
  isLoadingMore?: boolean
}

export default function ProductGrid({ products, loadMore, hasMore, isLoadingMore }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-slate-400 text-lg">No products found</div>
        <p className="text-slate-500 mt-2">Try adjusting your filters or check back later.</p>
      </div>
    )
  }

  return (
    <VirtuosoGrid
      totalCount={products.length}
      listClassName="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      itemContent={(index) => {
        const product = products[index]
        return <ProductCard key={product.id} product={product} />
      }}
      endReached={() => {
        if (hasMore && loadMore) loadMore()
      }}
      increaseViewportBy={{ top: 200, bottom: 600 }}
      components={{
        Footer: () => (
          hasMore ? (
            <div className="col-span-full flex justify-center py-6">
              <button
                disabled={!!isLoadingMore}
                onClick={() => loadMore && loadMore()}
                className="px-4 py-2 rounded-lg border bg-white hover:bg-slate-50 disabled:opacity-50 flex items-center gap-2"
                aria-busy={!!isLoadingMore}
              >
                {isLoadingMore && <Loader2 className="h-4 w-4 animate-spin" />}
                {isLoadingMore ? "Loading more…" : "Load more"}
              </button>
            </div>
          ) : null
        ),
      }}
    />
  )
}
