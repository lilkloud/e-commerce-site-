import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const code = (searchParams.get('code') || '').trim().toUpperCase()
    const subtotal = Number(searchParams.get('subtotal') || '0')

    if (!code) {
      return NextResponse.json({ error: 'Coupon code is required' }, { status: 400 })
    }

    const supabase = createClient()

    const nowIso = new Date().toISOString()
    const { data: coupon, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', code)
      .eq('active', true)
      .lte('starts_at', nowIso)
      .gte('ends_at', nowIso)
      .maybeSingle()

    // If not found with windowed query, try without date bounds (null dates allowed)
    let valid = coupon
    if (!valid) {
      const { data: fallback } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', code)
        .eq('active', true)
        .maybeSingle()
      valid = fallback || null
    }

    if (!valid) {
      return NextResponse.json({ error: 'Invalid or inactive coupon' }, { status: 404 })
    }

    if (valid.min_subtotal && subtotal < Number(valid.min_subtotal)) {
      return NextResponse.json({ error: `Minimum subtotal of $${Number(valid.min_subtotal).toFixed(2)} required` }, { status: 400 })
    }

    return NextResponse.json({
      code: valid.code,
      percent_off: Number(valid.percent_off),
      min_subtotal: Number(valid.min_subtotal || 0),
    })
  } catch (e) {
    console.error('Coupon validate error', e)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
