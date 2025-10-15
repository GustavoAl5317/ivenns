import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ProductDetails } from "@/components/product-details"

// opcional: evita cache SSR em produção
export const dynamic = "force-dynamic"

interface ProductPageProps {
  params: { id: string }
  searchParams?: Record<string, string | string[] | undefined>
}

// pega a última parte depois do último "-"
function keyFromSlug(slugOrId: string) {
  const parts = (slugOrId || "").split("-")
  return parts[parts.length - 1] || slugOrId
}

export default async function ProductPage({ params, searchParams }: ProductPageProps) {
  const supabase = await createClient()
  const slugOrId = params.id                     // ex.: "dell-switch-210-ASNB"
  const key = keyFromSlug(slugOrId)              // ex.: "ASNB"

  // 1) tenta: sku == última parte  OR  id == última parte
  let { data: product, error } = await supabase
    .from("products")
    .select("*")
    .or(`sku.eq.${key},id.eq.${key}`)
    // .eq("category", "product") // ative só se tiver certeza que TODOS são "product"
    .maybeSingle()

  // 2) tenta: sku/id == slug inteiro
  if (!product) {
    const res2 = await supabase
      .from("products")
      .select("*")
      .or(`sku.eq.${slugOrId},id.eq.${slugOrId}`)
      // .eq("category", "product")
      .maybeSingle()
    product = res2.data ?? null
    error = error || res2.error
  }

  // 3) fallback: sku ILIKE *ultima-parte* (cobre casos em que SKU é "DELL-SWITCH-210-ASNB" ou com prefixos)
  if (!product) {
    const res3 = await supabase
      .from("products")
      .select("*")
      .ilike("sku", `%${key}%`)
      // .eq("category", "product")
      .limit(1)
    product = res3.data?.[0] ?? null
    error = error || res3.error
  }

  // ----- DEBUG opcional: acesse com ?debug=1 para ver por que não achou -----
  const isDebug = String(searchParams?.debug || "").toLowerCase() === "1"
  if (!product) {
    if (process.env.NODE_ENV !== "production" || isDebug) {
      return (
        <pre style={{ padding: 24 }}>
{JSON.stringify(
  {
    tried: {
      slugOrId,
      key,
      steps: [
        "or(sku.eq.key, id.eq.key)",
        "or(sku.eq.slugOrId, id.eq.slugOrId)",
        "sku.ilike.%key%",
      ],
    },
    supabaseErrors: { message: error?.message, details: error?.details },
  },
  null,
  2
)}
        </pre>
      )
    }
    notFound()
  }

  return <ProductDetails product={product as any} />
}
