import { NextResponse } from "next/server"
import * as XLSX from "xlsx"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"

const RowSchema = z.object({
  title: z.string().min(1),
  sku: z.string().min(1),
  category: z.string().min(1),
  price: z.coerce.number().nullable().optional(),
  description: z.string().optional().default(""),
  image_url: z.string().url().optional().or(z.literal("")).optional(),
  "metadata.href": z.string().optional(),
  "metadata.bullets": z.string().optional(), // itens separados por |
  "metadata.visible": z.coerce.boolean().optional(),
  "metadata.highlight": z.coerce.boolean().optional(),
  "metadata.order": z.coerce.number().optional(),
})

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: auth } = await supabase.auth.getUser()
    if (!auth?.user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", auth.user.id)
      .single()

    if (!profile || profile.role !== "admin") {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
    }

    const form = await req.formData()
    const file = form.get("file") as File | null
    if (!file) return NextResponse.json({ error: "Arquivo não enviado" }, { status: 400 })

    const arrayBuffer = await file.arrayBuffer()
    const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: "array" })
    const firstSheet = workbook.SheetNames[0]
    const rowsRaw = XLSX.utils.sheet_to_json<Record<string, any>>(workbook.Sheets[firstSheet], { defval: "" })
    if (!rowsRaw.length) return NextResponse.json({ error: "Planilha vazia" }, { status: 400 })

    const rows = rowsRaw.map((r, idx) => {
      const parsed = RowSchema.safeParse(r)
      if (!parsed.success) {
        throw new Error(`Linha ${idx + 2} inválida: ${parsed.error.issues.map(i => i.message).join(", ")}`)
      }
      const v = parsed.data
      const metadata: any = {}
      if (v["metadata.href"]) metadata.href = v["metadata.href"]
      if (v["metadata.bullets"]) metadata.bullets = String(v["metadata.bullets"]).split("|").map(s => s.trim()).filter(Boolean)
      if (typeof v["metadata.visible"] !== "undefined") metadata.visible = v["metadata.visible"]
      if (typeof v["metadata.highlight"] !== "undefined") metadata.highlight = v["metadata.highlight"]
      if (typeof v["metadata.order"] !== "undefined") metadata.order = v["metadata.order"]

      return {
        title: v.title,
        sku: v.sku,
        category: v.category,
        price: typeof v.price === "number" ? v.price : null,
        description: v.description,
        image_url: v.image_url || null,
        metadata: Object.keys(metadata).length ? metadata : null,
      }
    })

    const { data: upserted, error } = await supabase
      .from("products") // ajuste se o nome da tabela for outro
      .upsert(rows, { onConflict: "sku" })
      .select("id, sku")

    if (error) throw error

    return NextResponse.json({
      ok: true,
      imported: upserted?.length ?? 0,
      message: `Importação concluída (${upserted?.length ?? 0} itens).`,
    })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: err.message || "Falha ao importar" }, { status: 500 })
  }
}
