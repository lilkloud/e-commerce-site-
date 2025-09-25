import { Resend } from 'resend'

const resendApiKey = process.env.RESEND_API_KEY
const fromEmail = process.env.EMAIL_FROM || 'ShopHub <noreply@yourdomain.com>'

if (!resendApiKey) {
  console.warn('RESEND_API_KEY is not set. Emails will be skipped.')
}

const resend = resendApiKey ? new Resend(resendApiKey) : null

function currency(amount: number) {
  return `$${amount.toFixed(2)}`
}

export async function sendOrderConfirmationEmail(params: {
  to: string
  order: {
    id: string
    total: number
    created_at: string
    order_items: Array<{ quantity: number; price: number; products: { name: string } }>
  }
}) {
  if (!resend) return { skipped: true }
  const { to, order } = params
  const subject = `Order Confirmation #${order.id.slice(0, 8)}`
  const itemsHtml = order.order_items
    .map((it) => `<li>${it.products.name} × ${it.quantity} — ${currency(it.price * it.quantity)}</li>`) 
    .join('')
  const html = `
    <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; color:#0f172a">
      <h2>Thanks for your purchase!</h2>
      <p>Your order <strong>#${order.id.slice(0, 8)}</strong> was placed on ${new Date(order.created_at).toLocaleString()}.</p>
      <h3>Items</h3>
      <ul>${itemsHtml}</ul>
      <p style="margin-top:12px; font-weight:600;">Total: ${currency(order.total)}</p>
      <p style="margin-top:16px;">You can view your order details at any time from your account.</p>
    </div>
  `
  try {
    await resend.emails.send({ from: fromEmail!, to, subject, html })
    return { success: true }
  } catch (e) {
    console.error('sendOrderConfirmationEmail error', e)
    return { error: true }
  }
}

export async function sendShipmentEmail(params: {
  to: string
  orderId: string
  trackingNumber?: string
  shippedAt?: string | null
}) {
  if (!resend) return { skipped: true }
  const { to, orderId, trackingNumber, shippedAt } = params
  const subject = `Your order #${orderId.slice(0, 8)} has shipped!`
  const html = `
    <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; color:#0f172a">
      <h2>Your order is on the way</h2>
      <p>Order <strong>#${orderId.slice(0, 8)}</strong> ${shippedAt ? `shipped on ${new Date(shippedAt).toLocaleString()}` : 'has shipped'}.</p>
      ${trackingNumber ? `<p>Tracking Number: <strong>${trackingNumber}</strong></p>` : ''}
      <p>You can track your package using your carrier's tracking tool.</p>
    </div>
  `
  try {
    await resend.emails.send({ from: fromEmail!, to, subject, html })
    return { success: true }
  } catch (e) {
    console.error('sendShipmentEmail error', e)
    return { error: true }
  }
}
