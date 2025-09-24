// app/api/reviews/submit/route.ts
import { NextRequest, NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"
export const revalidate = 0
export const fetchCache = "force-no-store"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null)

    if (!body) {
      return NextResponse.json({ error: "JSON inválido" }, { status: 400 })
    }

    const {
      reviewer_name,
      reviewer_email,
      rating,
      comment,
    } = body

    // validações básicas
    const missing: string[] = []
    if (!reviewer_name) missing.push("reviewer_name")
    if (!reviewer_email) missing.push("reviewer_email")
    if (rating == null) missing.push("rating")
    if (!comment) missing.push("comment")

    if (missing.length) {
      return NextResponse.json(
        { error: "Campos obrigatórios ausentes", missing },
        { status: 400 }
      )
    }

    const r = Number(rating)
    if (!Number.isFinite(r) || r < 1 || r > 5) {
      return NextResponse.json(
        { error: "Rating deve ser um número entre 1 e 5" },
        { status: 400 }
      )
    }

    const supabase = createServerSupabase()

    // monta payload só com dados da review
    const payload = {
      reviewer_name,
      reviewer_email,
      rating: r,
      comment,
      status: "pending" as const, // remova se sua tabela não tiver essa coluna
    }

    const { data: review, error: insertErr } = await supabase
      .from("reviews")
      .insert(payload)
      .select()
      .maybeSingle()

    if (insertErr) {
      console.error("Error creating review:", insertErr)
      return NextResponse.json(
        { error: "Falha ao criar review" },
        { status: 500 }
      )
    }

    return NextResponse.json(review, { status: 201 })
  } catch (e) {
    console.error("Error in submit review API:", e)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
