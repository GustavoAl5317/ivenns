// app/api/admin/reviews/route.ts
import { NextRequest, NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"
export const revalidate = 0
export const fetchCache = "force-no-store"

// --- helper admin guard ---
async function requireAdmin() {
  const supabase = createServerSupabase()

  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser()
  if (userErr || !user) {
    return { supabase, status: 401 as const, resp: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }
  }

  const { data: profile, error: profErr } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id) // troque para user_id se necessário
    .maybeSingle()

  if (profErr || !profile || profile.role !== "admin") {
    return { supabase, status: 403 as const, resp: NextResponse.json({ error: "Admin access required" }, { status: 403 }) }
  }

  return { supabase, status: 200 as const }
}

// GET /api/admin/reviews?filter=pending|approved|rejected
export async function GET(req: NextRequest) {
  const auth = await requireAdmin()
  if (auth.status !== 200) return auth.resp
  const { supabase } = auth

  const { searchParams } = new URL(req.url)
  const filter = searchParams.get("filter") ?? undefined

  // 1) BUSCA REVIEWS (SEM RELACIONAMENTOS)
  let q = supabase
    .from("reviews")
    .select("id, comment, rating, status, product_id, author_id, created_at")
    .order("created_at", { ascending: false })

  if (filter) q = q.eq("status", filter)

  const { data: reviews, error: revErr } = await q
  if (revErr) {
    console.error("Error fetching reviews (base):", revErr)
    return NextResponse.json({ error: revErr }, { status: 500 })
  }

  if (!reviews?.length) return NextResponse.json([])

  // 2) BUSCA PRODUCTS e PROFILES EM LOTE (SEM RELACIONAMENTOS)
  const productIds = Array.from(new Set(reviews.map(r => r.product_id).filter(Boolean)))
  const authorIds  = Array.from(new Set(reviews.map(r => r.author_id).filter(Boolean)))

  const [{ data: products, error: prodErr }, { data: profiles, error: profErr }] = await Promise.all([
    productIds.length
      ? supabase.from("products").select("id, title, sku, image_url").in("id", productIds)
      : Promise.resolve({ data: [] as any[], error: null }),
    authorIds.length
      ? supabase.from("profiles").select("id, full_name, avatar_url").in("id", authorIds)
      : Promise.resolve({ data: [] as any[], error: null }),
  ])

  if (prodErr || profErr) {
    console.error("Error fetching related entities:", { prodErr, profErr })
  }

  const productById = new Map((products ?? []).map(p => [p.id, p]))
  const profileById = new Map((profiles ?? []).map(p => [p.id, p]))

  const payload = reviews.map(r => ({
    ...r,
    product: r.product_id ? productById.get(r.product_id) ?? null : null,
    author:  r.author_id  ? profileById.get(r.author_id) ?? null  : null,
  }))

  return NextResponse.json(payload)
}

// PATCH /api/admin/reviews  body: { id: string; status: "approved"|"rejected"|"pending" }
export async function PATCH(req: NextRequest) {
  const auth = await requireAdmin()
  if (auth.status !== 200) return auth.resp
  const { supabase } = auth

  const body = await req.json().catch(() => null)
  if (!body?.id || !body?.status) {
    return NextResponse.json({ error: "id e status são obrigatórios" }, { status: 400 })
  }

  const { data, error } = await supabase
    .from("reviews")
    .update({ status: body.status })
    .eq("id", body.id)
    .select()
    .maybeSingle()

  if (error) {
    console.error("Error updating review:", error)
    return NextResponse.json({ error }, { status: 500 })
  }

  return NextResponse.json(data)
}
