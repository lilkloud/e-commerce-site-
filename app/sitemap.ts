import type { MetadataRoute } from "next"
import { createClient } from "@/lib/supabase/server"

export const runtime = 'nodejs'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  const supabase = createClient()

  const [{ data: products }, { data: categories }] = await Promise.all([
    supabase.from("products").select("id, updated_at"),
    supabase.from("categories").select("id, updated_at"),
  ])

  const base: MetadataRoute.Sitemap = [
    { url: `${site}/`, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${site}/orders`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.6 },
  ]

  const productEntries: MetadataRoute.Sitemap = (products || []).map((p) => ({
    url: `${site}/products/${p.id}`,
    lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }))

  const categoryEntries: MetadataRoute.Sitemap = (categories || []).map((c) => ({
    url: `${site}/?category=${c.id}`,
    lastModified: c.updated_at ? new Date(c.updated_at) : new Date(),
    changeFrequency: "weekly",
    priority: 0.5,
  }))

  return [...base, ...productEntries, ...categoryEntries]
}
