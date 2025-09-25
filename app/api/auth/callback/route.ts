import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get("code")

    if (!code) {
      return NextResponse.redirect(new URL("/", request.url))
    }

    const supabase = createClient()
    await supabase.auth.exchangeCodeForSession(code)

    return NextResponse.redirect(new URL("/", request.url))
  } catch (err) {
    console.error("auth callback error", err)
    return NextResponse.redirect(new URL("/", request.url))
  }
}
