import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ProductDetails } from "@/components/product-details"

interface ProductPageProps {
  params: {
    id: string
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const supabase = await createClient()

  // Buscar produto específico
  const { data: product, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", params.id)
    .eq("category", "product")
    .single()

  if (error || !product) {
    notFound()
  }

  return <ProductDetails product={product} />
}