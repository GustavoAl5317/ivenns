import { ReviewForm } from "@/components/reviews/review-form"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function ReviewsPage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />

      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-3xl md:text-4xl font-bold mb-4 text-balance">
                Deixe Sua <span className="gradient-text">Avaliação</span>
              </h1>
              <p className="text-xl text-muted-foreground text-pretty">
                Compartilhe sua experiência conosco e ajude outros clientes.
              </p>
            </div>

            <ReviewForm />
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
