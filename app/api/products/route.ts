// app/api/products/route.ts
import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    // --- filtros ---
    const rawCategory = searchParams.get("category")
    const category =
      rawCategory && ["product", "service"].includes(rawCategory) ? rawCategory : null

    // --- ordenação ---
    // sort=img_first  -> produtos com image_url NÃO nula primeiro, depois mais recentes
    // sort=recent     -> padrão: mais recentes primeiro
    const sortParam = (searchParams.get("sort") || "recent").toLowerCase()

    // --- paginação ---
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
      .select("*", { count: "exact" })

    if (category) query = query.eq("category", category)

    // --- ordenação aplicada ---
    if (sortParam === "img_first") {
      // nullsLast (nullsFirst: false) -> com imagem primeiro
      query = query
        .order("image_url", { ascending: true, nullsFirst: false })
        .order("created_at", { ascending: false })
    } else {
      // padrão: mais recentes primeiro
      query = query.order("created_at", { ascending: false })
    }

    // --- aplica range ---
    const { data, error, count } = await query.range(rangeStart, rangeEnd)

    if (error) {
      console.error("Error fetching products:", error)
      return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
    }

    const items = data ?? []
    const total = typeof count === "number" ? count : items.length
    const returned = items.length
    const hasMore = offset + returned < total

    // Opcional: cache leve para CDN
    const headers = new Headers({
      "Cache-Control": "public, s-maxage=120, stale-while-revalidate=600",
    })

    return NextResponse.json(
      {
        items,
        page: { limit, offset, returned, total, hasMore },
      },
      { headers },
    )
  } catch (error) {
    console.error("Error in products API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
