import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    // --- filtros ---
    const rawCategory = searchParams.get("category")
    const category = rawCategory && ["product", "service"].includes(rawCategory) ? rawCategory : null

    // --- paginação (com saneamento) ---
    const toInt = (v: string | null, def: number) => {
      const n = Number(v)
      return Number.isFinite(n) ? n : def
    }

    const MAX_LIMIT = 60
    const DEFAULT_LIMIT = 9
    const DEFAULT_OFFSET = 0

    let limit = toInt(searchParams.get("limit"), DEFAULT_LIMIT)
    let offset = toInt(searchParams.get("offset"), DEFAULT_OFFSET)

    if (limit < 1) limit = 1
    if (limit > MAX_LIMIT) limit = MAX_LIMIT
    if (offset < 0) offset = 0

    const rangeStart = offset
    const rangeEnd = Math.max(offset, offset + limit - 1)

    // --- query base ---
    let query = supabase
      .from("products")
      .select("*", { count: "exact" }) // count total antes do range
      .order("created_at", { ascending: false })

    if (category) {
      query = query.eq("category", category)
    }

    // --- aplica range ---
    const { data, error, count } = await query.range(rangeStart, rangeEnd)

    if (error) {
      console.error("Error fetching products:", error)
      return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
    }

    const items = data ?? []
    const total = typeof count === "number" ? count : items.length
    const hasMore = offset + items.length < total

    // Opcional: cache leve para CDN (ajuste conforme necessidade)
    const headers = new Headers({
      "Cache-Control": "public, s-maxage=120, stale-while-revalidate=600",
    })

    return NextResponse.json(
      {
        items,
        page: {
          limit,
          offset,
          returned: items.length,
          total,
          hasMore,
        },
      },
      { headers },
    )
  } catch (error) {
    console.error("Error in products API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
