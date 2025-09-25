"use client"
import { useState, useMemo, useEffect } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { SlidersHorizontal } from "lucide-react"
import ProductGrid from "@/components/product-grid"
import ProductGridSkeleton from "@/components/skeletons/ProductGridSkeleton"

type Category = { id: string; name: string }
type Product = {
  id: string
  name: string
  price: number
  category_id?: string | null
  categories?: Category | null
}
type User = { email?: string | null }

interface HomePageClientProps {
  user: User | null
  categories: Category[]
  products: Product[]
}

export default function HomePageClient({ user, categories, products }: HomePageClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [minPrice, setMinPrice] = useState("")
  const [maxPrice, setMaxPrice] = useState("")
  const [sort, setSort] = useState("newest")

  // Initialize state from URL on mount
  useEffect(() => {
    const q = searchParams.get("q") || ""
    const cat = searchParams.get("category")
    const min = searchParams.get("min") || ""
    const max = searchParams.get("max") || ""
    setSearch(q)
    setSelectedCategory(cat ? cat : null)
    setMinPrice(min)
    setMaxPrice(max)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Debounce search term
  const [debouncedSearch, setDebouncedSearch] = useState("")
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(t)
  }, [search])

  // Sync filters to URL when they change
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())

    if (debouncedSearch) params.set("q", debouncedSearch)
    else params.delete("q")

    if (selectedCategory) params.set("category", selectedCategory)
    else params.delete("category")

    if (minPrice) params.set("min", minPrice)
    else params.delete("min")

    if (maxPrice) params.set("max", maxPrice)
    else params.delete("max")

    params.set("sort", sort)
    const query = params.toString()
    const url = query ? `${pathname}?${query}` : pathname
    router.replace(url, { scroll: false })
  }, [debouncedSearch, selectedCategory, minPrice, maxPrice, sort, router, pathname, searchParams])

  // Paging state for infinite scroll
  const [page, setPage] = useState(1)
  const [pageData, setPageData] = useState<Product[]>(products)
  const [hasMore, setHasMore] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  // Reset pages when filters change
  useEffect(() => {
    setPage(1)
    setPageData(products)
    setHasMore(true)
  }, [products, selectedCategory, debouncedSearch, minPrice, maxPrice, sort])

  const loadMore = async () => {
    if (isLoadingMore || !hasMore) return
    setIsLoadingMore(true)
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", String(page + 1))
    params.set("pageSize", "24")
    const res = await fetch(`/api/products?${params.toString()}`)
    if (!res.ok) {
      setIsLoadingMore(false)
      return
    }
    const json = await res.json()
    setPage((p) => p + 1)
    setPageData((prev) => [...prev, ...json.items])
    setHasMore(Boolean(json.hasMore))
    setIsLoadingMore(false)
  }

  const filteredProducts = useMemo(() => {
    const list = pageData
    if (sort === "price-asc") return [...list].sort((a, b) => a.price - b.price)
    if (sort === "price-desc") return [...list].sort((a, b) => b.price - a.price)
    if (sort === "name-asc") return [...list].sort((a, b) => a.name.localeCompare(b.name))
    return list
  }, [pageData, sort])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Hero */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Discover products you’ll love</h1>
              <p className="text-slate-600 mt-1">Browse by category, search, or sort to find the perfect match.</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden md:block">
                <Select value={sort} onValueChange={setSort}>
                  <SelectTrigger className="w-48 bg-white">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="price-asc">Price: Low to High</SelectItem>
                    <SelectItem value="price-desc">Price: High to Low</SelectItem>
                    <SelectItem value="name-asc">Name: A–Z</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="md:hidden">
                    <SlidersHorizontal className="h-4 w-4 mr-2" /> Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80">
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6 space-y-6">
                    <div>
                      <h3 className="text-sm font-medium text-slate-700 mb-2">Categories</h3>
                      <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={selectedCategory === null ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(null)}
                >
                          All
                </Button>
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    {category.name}
                  </Button>
                ))}
              </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-slate-700 mb-2">Search</h3>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-slate-700 mb-2">Price</h3>
                      <div className="flex gap-2">
                  <input
                    type="number"
                    min="0"
                          placeholder="Min"
                    value={minPrice}
                    onChange={e => setMinPrice(e.target.value)}
                    className="w-1/2 border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  />
                  <input
                    type="number"
                    min="0"
                          placeholder="Max"
                    value={maxPrice}
                    onChange={e => setMaxPrice(e.target.value)}
                    className="w-1/2 border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          {/* Category chips */}
          <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              className="shrink-0"
              onClick={() => setSelectedCategory(null)}
            >
              All
            </Button>
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                className="shrink-0"
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.name}
              </Button>
            ))}
          </div>

          {/* Search + Price quick filters (desktop) */}
          <div className="mt-6 hidden md:flex items-center gap-3">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search products…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                placeholder="Min"
                value={minPrice}
                onChange={e => setMinPrice(e.target.value)}
                className="w-28 border border-slate-300 rounded-lg px-3 py-2 text-sm"
              />
              <span className="text-slate-400">—</span>
              <input
                type="number"
                min="0"
                placeholder="Max"
                value={maxPrice}
                onChange={e => setMaxPrice(e.target.value)}
                className="w-28 border border-slate-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div className="hidden md:block">
              <Select value={sort} onValueChange={setSort}>
                <SelectTrigger className="w-48 bg-white">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="price-asc">Price: Low to High</SelectItem>
                  <SelectItem value="price-desc">Price: High to Low</SelectItem>
                  <SelectItem value="name-asc">Name: A–Z</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* Products Grid */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-slate-900">All Products</h2>
          <span className="text-slate-600">{filteredProducts.length} shown</span>
            </div>
            {filteredProducts.length > 0 ? (
          <ProductGrid
            products={filteredProducts}
            loadMore={loadMore}
            hasMore={hasMore}
            isLoadingMore={isLoadingMore}
          />
            ) : (
              <div className="text-center py-16 border rounded-xl bg-white">
                <div className="text-2xl font-semibold text-slate-900 mb-2">No products found</div>
                <p className="text-slate-600 mb-6">Try adjusting your search or clearing filters to see more items.</p>
                <div className="flex items-center justify-center gap-2">
                  <Button
                    variant="default"
                    onClick={() => {
                      setSearch("")
                      setSelectedCategory(null)
                      setMinPrice("")
                      setMaxPrice("")
                    }}
                  >
                    Clear filters
                  </Button>
                </div>
              </div>
            )}
            {isLoadingMore && (
              <div className="mt-8">
                <ProductGridSkeleton count={6} />
              </div>
            )}
      </main>

      {/* ... footer ... */}
    </div>
  )
}
