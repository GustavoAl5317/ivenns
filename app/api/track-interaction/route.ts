import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { type, product_id } = await request.json()

    if (!type || !["whatsapp", "email"].includes(type)) {
      return NextResponse.json({ error: "Invalid interaction type" }, { status: 400 })
    }

    const supabase = await createClient()

    // Get visitor info
    const visitorIp = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"
    const userAgent = request.headers.get("user-agent") || "unknown"

    const { error } = await supabase.from("contact_interactions").insert({
      type,
      product_id: product_id || null,
      visitor_ip: visitorIp,
      user_agent: userAgent,
    })

    if (error) {
      console.error("Error tracking interaction:", error)
      return NextResponse.json({ error: "Failed to track interaction" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in track interaction API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
