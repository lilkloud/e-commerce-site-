import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import Image from "next/image"

async function updateProduct(formData: FormData) {
  "use server"
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login?next=/admin/products")
  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map((e) => e.trim().toLowerCase()).filter(Boolean)
  const isAdmin = !!user.email && adminEmails.includes(user.email.toLowerCase())
  if (!isAdmin) redirect("/")

  const id = String(formData.get("id") || "")
  if (!id) return
  const name = String(formData.get("name") || "").trim()
  const price = Number(formData.get("price") || 0)
  const stock_quantity = Number(formData.get("stock_quantity") || 0)
  const image_url = String(formData.get("image_url") || "").trim() || null
  const description = String(formData.get("description") || "").trim() || null
  const category_id = String(formData.get("category_id") || "").trim() || null

  const { error } = await supabase
    .from("products")
    .update({ name, price, stock_quantity, image_url, description, category_id })
    .eq("id", id)
  if (error) return
  revalidatePath("/admin/products")
}

async function deleteProduct(formData: FormData) {
  "use server"
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login?next=/admin/products")
  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map((e) => e.trim().toLowerCase()).filter(Boolean)
  const isAdmin = !!user.email && adminEmails.includes(user.email.toLowerCase())
  if (!isAdmin) redirect("/")
  const id = String(formData.get("id") || "")
  if (!id) return
  const { error } = await supabase.from("products").delete().eq("id", id)
  if (error) return
  revalidatePath("/admin/products")
}

async function createProduct(formData: FormData) {
  "use server"
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login?next=/admin/products")

  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map((e) => e.trim().toLowerCase()).filter(Boolean)
  const isAdmin = !!user.email && adminEmails.includes(user.email.toLowerCase())
  if (!isAdmin) redirect("/")

  const name = String(formData.get("name") || "").trim()
  const price = Number(formData.get("price")) || 0
  const stock = Number(formData.get("stock")) || 0
  const image_url = String(formData.get("image_url") || "").trim() || null
  const category_id = String(formData.get("category_id") || "").trim() || null
  const description = String(formData.get("description") || "").trim() || null

  if (!name || !price || price < 0) {
    return
  }

  const { error } = await supabase.from("products").insert({
    name,
    price,
    stock_quantity: stock,
    image_url,
    category_id,
    description,
  })

  if (error) {
    return
  }
  revalidatePath("/admin/products")
}

export default async function AdminProductsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login?next=/admin/products")

  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map((e) => e.trim().toLowerCase()).filter(Boolean)
  const isAdmin = !!user.email && adminEmails.includes(user.email.toLowerCase())
  if (!isAdmin) redirect("/")

  const [{ data: products }, { data: categories }] = await Promise.all([
    supabase.from("products").select("*, categories(id, name)").order("created_at", { ascending: false }),
    supabase.from("categories").select("id, name").order("name"),
  ])

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Admin · Products</h1>
        <p className="text-slate-600">Create and manage products</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Create form */}
        <Card>
          <CardHeader>
            <CardTitle>New Product</CardTitle>
            <CardDescription>Add a product to your catalog</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={createProduct} className="space-y-3">
              <Input name="name" placeholder="Name" required />
              <Input name="price" type="number" step="0.01" min="0" placeholder="Price (USD)" required />
              <Input name="stock" type="number" min="0" placeholder="Stock quantity" />
              <Input name="image_url" placeholder="Image URL (optional)" />
              <Input name="description" placeholder="Short description (optional)" />
              <Select name="category_id">
                <SelectTrigger>
                  <SelectValue placeholder="Select category (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {categories?.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button type="submit">Create</Button>
            </form>
          </CardContent>
        </Card>

        {/* Product list */}
        <div className="lg:col-span-2 space-y-4">
          {products?.map((p: any) => (
            <Card key={p.id}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="relative w-16 h-16 rounded-md overflow-hidden bg-slate-100">
                  <Image src={p.image_url || "/placeholder.svg?height=64&width=64"} alt={p.name} fill sizes="64px" className="object-cover" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold">{p.name}</div>
                  <div className="text-sm text-slate-600">${Number(p.price).toFixed(2)} · Stock: {p.stock_quantity}</div>
                  {p.categories && <div className="text-xs text-slate-500">{p.categories.name}</div>}
                </div>
                <form action={updateProduct} className="flex items-center gap-2">
                  <input type="hidden" name="id" value={p.id} />
                  <Input name="name" defaultValue={p.name} className="w-40" required />
                  <Input name="price" type="number" step="0.01" min="0" defaultValue={p.price} className="w-24" required />
                  <Input name="stock_quantity" type="number" min="0" defaultValue={p.stock_quantity} className="w-24" />
                  <Input name="image_url" defaultValue={p.image_url || ""} className="w-48" placeholder="Image URL" />
                  <Input name="description" defaultValue={p.description || ""} placeholder="Description" className="w-56" />
                  <Select name="category_id" defaultValue={p.category_id || ""}>
                    <SelectTrigger className="w-44">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {categories?.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button type="submit" variant="outline">Save</Button>
                </form>
                <form action={deleteProduct}>
                  <input type="hidden" name="id" value={p.id} />
                  <Button type="submit" variant="destructive">Delete</Button>
                </form>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </main>
  )
}
