# E-commerce App (Next.js + Supabase + Stripe)

Modern storefront with product browsing, filtering, product details, cart, checkout, Stripe payments, orders, tracking, coupons, admin dashboards, and email notifications via Resend.

## Stack
- Next.js App Router, React, TypeScript, Tailwind, shadcn/ui
- Supabase (Auth + Postgres)
- Stripe Checkout + Webhooks
- Resend (Email notifications)

## Features
- Product grid, category filters, search, price filters
- Product details with related items
- Cart drawer and full checkout flow
- Stripe Checkout with optional coupon codes
- Orders list and detail pages with status timeline
- Tracking numbers + "Track Package" modal
- Email notifications: order confirmation and shipment
- Admin dashboards: Orders, Products (create/edit/delete), Coupons (create)

## Getting Started

### 1) Clone & Install
```bash
npm install
```

### 2) Environment Variables
Create `.env.local` in project root based on `.env.example`:

- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- NEXT_PUBLIC_SITE_URL (e.g., http://localhost:3000)
- NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
- STRIPE_SECRET_KEY
- STRIPE_WEBHOOK_SECRET (from Stripe CLI)
- ADMIN_EMAILS (comma-separated list of admin emails)
- RESEND_API_KEY
- EMAIL_FROM (e.g., 'ShopHub <noreply@yourdomain.com>')

### 3) Database Migrations
Run in Supabase SQL editor:

- `scripts/11_alter_orders_add_email.sql`
- `scripts/09_alter_orders_add_tracking.sql`
- `scripts/10_create_coupons_table.sql`

Optional sample data for demo:

- `scripts/07_seed_sample_categories.sql`
- `scripts/06_seed_sample_products.sql`
- `scripts/08_seed_additional_products.sql`

Optional sample coupon:
```sql
INSERT INTO coupons (code, percent_off, active) VALUES ('WELCOME10', 10, true);
```

### 4) Run the App
```bash
npm run dev
```

In a separate terminal, forward Stripe webhooks:
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

### 5) Test the Flow
- Visit `/` to browse products
- Add to cart and open `/checkout`
- Apply a coupon (e.g., WELCOME10) and "Pay with Stripe"
- Use test card 4242 4242 4242 4242
- View orders at `/orders` and details at `/orders/[id]`

### 6) Admin
Ensure your email is in `ADMIN_EMAILS`, then access:
- `/admin/orders` — update statuses (processing/shipped/delivered) with tracking
- `/admin/products` — create products, inline edit, delete
- `/admin/coupons` — create coupons

## Notes
- The webhook runs on Node runtime and verifies signatures.
- Emails are best-effort; missing `RESEND_API_KEY` will skip send.
- Coupons are percent-off; discount is applied server-side to Stripe line items.

## Roadmap
- Coupon editing/toggles (UI)
- Stripe Tax + shipping rates (production)
- Abandoned cart emails & analytics (Vercel Analytics/PostHog)
- SEO (JSON-LD, sitemaps, product metadata)

## Deploying to Vercel

1) Set Environment Variables (Production)

- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- NEXT_PUBLIC_SITE_URL (your Vercel URL)
- NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
- STRIPE_SECRET_KEY
- STRIPE_WEBHOOK_SECRET (from Stripe Dashboard webhook endpoint)
- ADMIN_EMAILS (comma-separated)
- RESEND_API_KEY
- EMAIL_FROM (e.g., `Private <noreply@yourdomain.com>`)
- SHIPPING_PRICE_ID (optional)

2) Create Stripe Webhook (Production)

- Stripe Dashboard → Developers → Webhooks → Add endpoint
- Endpoint URL: `https://YOUR_VERCEL_URL/api/stripe/webhook`
- Events: at least `checkout.session.completed`
- Reveal Signing secret and set it as `STRIPE_WEBHOOK_SECRET` in Vercel envs
- Redeploy on Vercel

3) Supabase Auth URLs

- Supabase → Authentication → URL Configuration
- Site URL: your Vercel URL
- Redirect URLs: include your Vercel URL

4) Optional Local Testing (Stripe CLI)

- Install Stripe CLI and run:
  - `stripe listen --forward-to localhost:3000/api/stripe/webhook`
  - Copy the `whsec_...` printed into `.env.local` as `STRIPE_WEBHOOK_SECRET`
  - `stripe trigger checkout.session.completed`

