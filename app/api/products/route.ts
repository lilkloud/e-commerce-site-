import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get("q") || ""
  const category = searchParams.get("category")
  const min = searchParams.get("min")
  const max = searchParams.get("max")
  const page = Number(searchParams.get("page") || 1)
  const pageSize = Math.min(Number(searchParams.get("pageSize") || 24), 100)

  const supabase = createClient()

  let query = supabase
    .from("products")
    .select("*,categories(id,name)")
    .order("created_at", { ascending: false })

  if (q) {
    query = query.ilike("name", `%${q}%`)
  }
  if (category) {
    query = query.eq("category_id", category)
  }
  if (min) {
    query = query.gte("price", Number(min))
  }
  if (max) {
    query = query.lte("price", Number(max))
  }

  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  const { data, error } = await query.range(from, to)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const items = data || []
  const hasMore = items.length === pageSize

  return NextResponse.json({ items, page, pageSize, hasMore })
}


