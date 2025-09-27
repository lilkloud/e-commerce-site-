import { NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  // Only report presence, never values
  const present = (v: string | undefined | null) => (v && v.length > 0) ? true : false

  const report = {
    NEXT_PUBLIC_SUPABASE_URL: present(process.env.NEXT_PUBLIC_SUPABASE_URL),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: present(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    NEXT_PUBLIC_SITE_URL: present(process.env.NEXT_PUBLIC_SITE_URL),
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: present(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY),
    STRIPE_SECRET_KEY: present(process.env.STRIPE_SECRET_KEY),
    STRIPE_WEBHOOK_SECRET: present(process.env.STRIPE_WEBHOOK_SECRET),
    ADMIN_EMAILS: present(process.env.ADMIN_EMAILS),
    RESEND_API_KEY: present(process.env.RESEND_API_KEY),
    EMAIL_FROM: present(process.env.EMAIL_FROM),
    SHIPPING_PRICE_ID: present(process.env.SHIPPING_PRICE_ID),
    NODE_ENV: process.env.NODE_ENV || "",
  }

  return NextResponse.json({ ok: true, env: report })
}
