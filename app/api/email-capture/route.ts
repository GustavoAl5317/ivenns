import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { name, email, company, product_id } = await request.json()

    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 })
    }

    const supabase = await createClient()

    const { error } = await supabase.from("email_captures").insert({
      name,
      email,
      company: company || null,
      product_id: product_id || null,
    })

    if (error) {
      console.error("Error saving email capture:", error)
      return NextResponse.json({ error: "Failed to save email capture" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in email capture API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
