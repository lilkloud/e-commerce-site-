import { createClient } from "@/lib/supabase/server"
import HomePageClient from "@/components/HomePageClient"

export default async function HomePage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const [categoriesResult, productsResult] = await Promise.all([
    supabase.from("categories").select("*").order("name"),
    supabase
      .from("products")
      .select(`*,categories(id,name)`)
      .order("created_at", { ascending: false }),
  ])
  const categories = categoriesResult.data || []
  const products = productsResult.data || []
  return <HomePageClient user={user} categories={categories} products={products} />
}
