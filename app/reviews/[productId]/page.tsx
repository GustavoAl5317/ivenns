// app/reviews/[productId]/page.tsx
import { ReviewForm } from "@/components/reviews/review-form"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"

interface ReviewProductPageProps {
  params: { productId: string }
}

export default async function ReviewProductPage({ params }: ReviewProductPageProps) {
  const { productId } = params
  const supabase = await createClient()

  const { data: product, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", productId)
    .eq("is_active", true)
    .single()

  if (error || !product) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />

      <section className="py-20">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-6">
            Avaliar <span className="gradient-text">{product.title}</span>
          </h1>

          <ReviewForm productId={productId} />
        </div>
      </section>

      <Footer />
    </main>
  )
}
