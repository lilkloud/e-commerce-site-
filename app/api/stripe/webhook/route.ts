import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'
import Stripe from 'stripe'
import { sendOrderConfirmationEmail } from '@/lib/email'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  const stripe = getStripe()
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  let event: Stripe.Event

  try {
    if (process.env.NODE_ENV !== 'production') {
      if (!signature) console.warn('[webhook] Missing Stripe-Signature header')
      if (!endpointSecret) console.warn('[webhook] Missing STRIPE_WEBHOOK_SECRET env')
    }
    event = stripe.webhooks.constructEvent(body, signature as string, endpointSecret)
  } catch (err) {
    console.error('Webhook signature verification failed')
    if (process.env.NODE_ENV !== 'production') {
      console.error('[webhook] constructEvent error (details hidden in production):', err)
    }
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    )
  }

  const supabase = createClient()

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const orderId = session.metadata?.orderId
        if (orderId) {
          await supabase
            .from('orders')
            .update({ status: 'paid' })
            .eq('id', orderId)

          // Send order confirmation email (best-effort)
          try {
            const { data: order } = await supabase
              .from('orders')
              .select(`*, order_items(*, products(name, price))`)
              .eq('id', orderId)
              .single()

            if (order && order.email) {
              await sendOrderConfirmationEmail({
                to: order.email,
                order: {
                  id: order.id,
                  total: order.total,
                  created_at: order.created_at,
                  order_items: order.order_items?.map((it: any) => ({
                    quantity: it.quantity,
                    price: it.price,
                    products: { name: it.products?.name || 'Item' },
                  })) || [],
                },
              })
            }
          } catch (e) {
            console.error('Order confirmation email error', e)
          }
        }
        break
      }
      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session
        const orderId = session.metadata?.orderId
        if (orderId) {
          await supabase
            .from('orders')
            .update({ status: 'failed' })
            .eq('id', orderId)
        }
        break
      }
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
