import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const stripe = getStripe()
    const { items, successUrl, cancelUrl, orderId, couponCode } = await request.json()

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'No items provided' }, { status: 400 })
    }
    if (!orderId) {
      return NextResponse.json({ error: 'orderId is required' }, { status: 400 })
    }

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Validate products and prices on the server
    const productIds = items.map((i: any) => i.productId)
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .in('id', productIds)

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
    }

    // Optional: validate coupon
    let percentOff: number | null = null
    if (couponCode && typeof couponCode === 'string' && couponCode.trim()) {
      const code = couponCode.trim().toUpperCase()
      const nowIso = new Date().toISOString()
      const { data: coupon } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', code)
        .eq('active', true)
        .maybeSingle()
      if (coupon) {
        // If date windows are set, enforce them
        const startsOk = !coupon.starts_at || coupon.starts_at <= nowIso
        const endsOk = !coupon.ends_at || coupon.ends_at >= nowIso
        if (startsOk && endsOk) {
          percentOff = Number(coupon.percent_off)
        }
      }
    }

    // Build Stripe line items
    const line_items = items.map((i: any) => {
      const product = products?.find((p) => p.id === i.productId)
      if (!product) throw new Error('Invalid product in cart')
      const priceCents = Math.round(Number(product.price) * 100)
      const discountedCents = percentOff
        ? Math.max(0, Math.round(priceCents * (1 - percentOff / 100)))
        : priceCents
      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name: product.name,
            images: product.image_url ? [product.image_url] : undefined,
          },
          unit_amount: discountedCents,
        },
        quantity: i.quantity,
      }
    })

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items,
      success_url: successUrl || `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/checkout/success?orderId=${orderId}`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/checkout`,
      automatic_tax: { enabled: true },
      shipping_address_collection: { allowed_countries: ['US', 'GB', 'CA', 'DE', 'FR', 'NG'] },
      shipping_options: process.env.SHIPPING_PRICE_ID
        ? [{ shipping_rate: process.env.SHIPPING_PRICE_ID }]
        : undefined,
      metadata: {
        userId: user.id,
        orderId,
      },
    })

    return NextResponse.json({ id: session.id, url: session.url })
  } catch (e) {
    console.error('create-checkout-session error', e)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
