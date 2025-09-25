import { ThemeProvider } from "@/components/theme-provider"
import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"
import { CartProvider } from "@/lib/cart-context"
import Link from "next/link"
import CartDrawer from "@/components/cart-drawer"
import { Button } from "@/components/ui/button"
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import { Toaster } from "@/components/ui/sonner"
import Footer from "@/components/footer"

export const metadata: Metadata = {
  title: "Private",
  description: "Private Storefront",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // ...existing code...
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body>
          <CartProvider>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
              <header className="sticky top-0 z-30 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="md:hidden">
                      <Sheet>
                        <SheetTrigger asChild>
                          <Button variant="ghost" size="icon" aria-label="Open menu">
                            <Menu className="h-5 w-5" />
                          </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-80">
                          <SheetHeader>
                            <SheetTitle>Menu</SheetTitle>
                          </SheetHeader>
                          <nav className="mt-6 space-y-3">
                            <Link href="/" className="block text-slate-700 hover:text-slate-900">Home</Link>
                            <Link href="/orders" className="block text-slate-700 hover:text-slate-900">Orders</Link>
                          </nav>
                          <form action="/" method="get" className="mt-6">
                            <input
                              type="text"
                              name="q"
                              placeholder="Search products…"
                              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                            />
                          </form>
                        </SheetContent>
                      </Sheet>
                    </div>
                    <Link href="/" className="font-semibold text-slate-900">Private</Link>
                    <nav className="hidden md:flex items-center gap-4 text-sm text-slate-600">
                      <Link href="/" className="hover:text-slate-900">Home</Link>
                      <Link href="/orders" className="hover:text-slate-900">Orders</Link>
                    </nav>
                  </div>
                  <div className="flex items-center gap-3">
                    <form action="/" method="get" className="hidden md:block">
                      <input
                        type="text"
                        name="q"
                        placeholder="Search products…"
                        className="w-64 border border-slate-300 rounded-lg px-3 py-2 text-sm"
                      />
                    </form>
                    <CartDrawer />
                  </div>
                </div>
              </header>
              {children}
            </ThemeProvider>
          </CartProvider>
          <Footer />
          <Toaster richColors closeButton />
      </body>
    </html>
  )
}
