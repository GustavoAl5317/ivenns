import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// Util: converte price
function toPriceOrNull(input: unknown) {
  if (input === null || input === undefined || input === "") return null
  const n = Number(input)
  if (Number.isNaN(n)) throw new Error("invalid_price")
  return n
}

// Util: valida UUID
function isUUID(v: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params?.id
    if (!id || !isUUID(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 })
    }

    const supabase = await createClient()

    // Auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Admin?
    const { data: profile, error: profileErr } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .limit(1)
      .single()

    if (profileErr || !profile || profile.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    // Body
    if (!request.headers.get("content-type")?.includes("application/json")) {
      return NextResponse.json({ error: "Content-Type must be application/json" }, { status: 415 })
    }

    let body: any
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
    }

    // Registro atual
    const { data: current, error: fetchErr } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .limit(1)
      .single()

    if (fetchErr || !current) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Merge parcial
    const up: any = {}
    if (body.title !== undefined) up.title = String(body.title)
    if (body.description !== undefined) up.description = String(body.description)
    if (body.image_url !== undefined) up.image_url = String(body.image_url)
    if (body.sku !== undefined) up.sku = String(body.sku)
    if (body.category !== undefined) {
      const cat = String(body.category).toLowerCase()
      if (!["product", "service"].includes(cat)) {
        return NextResponse.json({ error: "Invalid category" }, { status: 400 })
      }
      up.category = cat
    }
    if (body.price !== undefined) {
      try {
        up.price = toPriceOrNull(body.price)
      } catch (e: any) {
        if (e?.message === "invalid_price") {
          return NextResponse.json({ error: "Invalid price" }, { status: 400 })
        }
        throw e
      }
    }
    if (body.metadata !== undefined) {
      if (body.metadata && typeof body.metadata !== "object") {
        return NextResponse.json({ error: "Invalid metadata" }, { status: 400 })
      }
      up.metadata = body.metadata ?? null
    }

    if (Object.keys(up).length === 0) {
      return NextResponse.json(current) // nada mudou
    }

    // 1ª tentativa (com metadata, se presente)
    let { data: updated, error: updateErr } = await supabase
      .from("products")
      .update(up)
      .eq("id", id)
      .select("*")
      .limit(1)
      .single()

    // Se der PGRST204 por causa de metadata, tenta novamente sem metadata
    if (updateErr?.code === "PGRST204" && "metadata" in up) {
      // remove somente metadata e tenta de novo
      const { metadata, ...upWithoutMetadata } = up
      const retry = await supabase
        .from("products")
        .update(upWithoutMetadata)
        .eq("id", id)
        .select("*")
        .limit(1)
        .single()

      updated = retry.data
      updateErr = retry.error

      if (!updateErr) {
        // avisa que metadata não foi atualizada por coluna ausente
        return NextResponse.json({
          ...updated,
          _warning: "metadata_not_updated_column_missing",
          _hint: "Crie a coluna 'metadata jsonb' e rode: NOTIFY pgrst, 'reload schema';"
        })
      }
    }

    if (updateErr) {
      console.error("Error updating product:", updateErr)
      return NextResponse.json({ error: "Failed to update product" }, { status: 500 })
    }

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Error in products PUT:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params?.id
    if (!id || !isUUID(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 })
    }

    const supabase = await createClient()

    // Auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Admin?
    const { data: profile, error: profileErr } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .limit(1)
      .single()

    if (profileErr || !profile || profile.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const { error: delErr } = await supabase
      .from("products")
      .delete()
      .eq("id", id)

    if (delErr) {
      console.error("Error deleting product:", delErr)
      return NextResponse.json({ error: "Failed to delete product" }, { status: 500 })
    }

    return NextResponse.json({ message: "Product deleted successfully" })
  } catch (error) {
    console.error("Error in products DELETE:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
