import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"

async function createCoupon(formData: FormData) {
  "use server"
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login?next=/admin/coupons")

  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map((e) => e.trim().toLowerCase()).filter(Boolean)
  const isAdmin = !!user.email && adminEmails.includes(user.email.toLowerCase())
  if (!isAdmin) redirect("/")

  const code = String(formData.get("code") || "").trim().toUpperCase()
  const percent_off = Number(formData.get("percent_off") || 0)
  const min_subtotal = Number(formData.get("min_subtotal") || 0)
  const active = String(formData.get("active") || "on") === "on"
  const starts_at = String(formData.get("starts_at") || "").trim() || null
  const ends_at = String(formData.get("ends_at") || "").trim() || null

  if (!code || percent_off <= 0 || percent_off > 100) {
    return
  }

async function toggleActive(formData: FormData) {
  "use server"
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login?next=/admin/coupons")
  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map((e) => e.trim().toLowerCase()).filter(Boolean)
  const isAdmin = !!user.email && adminEmails.includes(user.email.toLowerCase())
  if (!isAdmin) redirect("/")
  const id = String(formData.get("id") || "")
  const active = String(formData.get("active") || "true") === "true"
  if (!id) return
  const { error } = await supabase.from("coupons").update({ active }).eq("id", id)
  if (error) return
  revalidatePath("/admin/coupons")
}

async function deleteCoupon(formData: FormData) {
  "use server"
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login?next=/admin/coupons")
  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map((e) => e.trim().toLowerCase()).filter(Boolean)
  const isAdmin = !!user.email && adminEmails.includes(user.email.toLowerCase())
  if (!isAdmin) redirect("/")
  const id = String(formData.get("id") || "")
  if (!id) return
  const { error } = await supabase.from("coupons").delete().eq("id", id)
  if (error) return
  revalidatePath("/admin/coupons")
}

  const { error } = await supabase.from("coupons").insert({ code, percent_off, min_subtotal, active, starts_at, ends_at })
  if (error) return
  revalidatePath("/admin/coupons")
}

export default async function AdminCouponsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login?next=/admin/coupons")

  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map((e) => e.trim().toLowerCase()).filter(Boolean)
  const isAdmin = !!user.email && adminEmails.includes(user.email.toLowerCase())
  if (!isAdmin) redirect("/")

  const { data: coupons } = await supabase
    .from("coupons")
    .select("*")
    .order("created_at", { ascending: false })

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Admin · Coupons</h1>
        <p className="text-slate-600">Create and manage promotional codes</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Create form */}
        <Card>
          <CardHeader>
            <CardTitle>New Coupon</CardTitle>
            <CardDescription>Set a percent discount and optional min subtotal & dates</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={createCoupon} className="space-y-3">
              <Input name="code" placeholder="Code (e.g., WELCOME10)" required />
              <Input name="percent_off" type="number" min="1" max="100" placeholder="Percent off" required />
              <Input name="min_subtotal" type="number" step="0.01" min="0" placeholder="Minimum subtotal (optional)" />
              <div className="flex items-center gap-2">
                <Switch name="active" defaultChecked />
                <span className="text-sm text-slate-700">Active</span>
              </div>
              <Input name="starts_at" type="datetime-local" />
              <Input name="ends_at" type="datetime-local" />
              <Button type="submit">Create</Button>
            </form>
          </CardContent>
        </Card>

        {/* Coupons list */}
        <div className="lg:col-span-2 space-y-4">
          {coupons?.map((c: any) => (
            <Card key={c.id}>
              <CardContent className="p-4 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="font-semibold">{c.code}</div>
                  <div className="text-sm text-slate-600">{c.percent_off}% off · Min ${Number(c.min_subtotal || 0).toFixed(2)}</div>
                  <div className="text-xs text-slate-500">
                    {c.active ? 'Active' : 'Inactive'}
                    {c.starts_at ? ` · Starts ${new Date(c.starts_at).toLocaleString()}` : ''}
                    {c.ends_at ? ` · Ends ${new Date(c.ends_at).toLocaleString()}` : ''}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <form action={toggleActive}>
                    <input type="hidden" name="id" value={c.id} />
                    <input type="hidden" name="active" value={(!c.active).toString()} />
                    <Button variant="outline" size="sm">{c.active ? 'Deactivate' : 'Activate'}</Button>
                  </form>
                  <form action={deleteCoupon}>
                    <input type="hidden" name="id" value={c.id} />
                    <Button variant="destructive" size="sm">Delete</Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </main>
  )
}
