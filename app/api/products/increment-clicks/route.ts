import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { product_id } = await request.json()

    if (!product_id) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 })
    }

    const supabase = await createClient()

    const { error } = await supabase.rpc("increment_product_clicks", {
      product_uuid: product_id,
    })

    if (error) {
      console.error("Error incrementing clicks:", error)
      return NextResponse.json({ error: "Failed to increment clicks" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in increment clicks API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
