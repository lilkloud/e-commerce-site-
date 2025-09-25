import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendShipmentEmail } from '@/lib/email'

// Allowed statuses for demo purposes
const ALLOWED_STATUSES = new Set(['processing', 'shipped', 'delivered', 'cancelled'])

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { status, trackingNumber } = await req.json()
    const orderId = params.id

    if (!status || !ALLOWED_STATUSES.has(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Ensure the order belongs to the current user (demo-safe). In real apps, check admin role.
    const { data: order, error: fetchErr } = await supabase
      .from('orders')
      .select('id,user_id,status')
      .eq('id', orderId)
      .single()

    if (fetchErr || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Admin allowlist via env; admins can update any order
    const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map((e) => e.trim().toLowerCase()).filter(Boolean)
    const isAdmin = !!user.email && adminEmails.includes(user.email.toLowerCase())

    if (!isAdmin && order.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Build update payload
    const update: Record<string, any> = { status }
    if (status === 'shipped') {
      update.shipped_at = new Date().toISOString()
      if (trackingNumber && typeof trackingNumber === 'string') {
        update.tracking_number = trackingNumber
      }
    }
    if (status === 'delivered') {
      update.delivered_at = new Date().toISOString()
    }

    const { error: updateErr } = await supabase
      .from('orders')
      .update(update)
      .eq('id', orderId)

    if (updateErr) {
      return NextResponse.json({ error: 'Failed to update status' }, { status: 500 })
    }

    // If shipped, try to send shipment email (best-effort)
    if (status === 'shipped') {
      try {
        const { data: updated } = await supabase
          .from('orders')
          .select('id, email, tracking_number, shipped_at')
          .eq('id', orderId)
          .single()
        if (updated?.email) {
          await sendShipmentEmail({
            to: updated.email,
            orderId: updated.id,
            trackingNumber: updated.tracking_number || undefined,
            shippedAt: updated.shipped_at || undefined,
          })
        }
      } catch (e) {
        console.error('shipment email error', e)
      }
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('Update order status error', e)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
