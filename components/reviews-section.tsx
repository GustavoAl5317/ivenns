"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Star } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

interface Review {
  id: string
  reviewer_name: string
  rating: number
  comment: string
  created_at: string
}

export function ReviewsSection() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReviews()
  }, [])

  const fetchReviews = async () => {
    try {
      const response = await fetch("/api/reviews")
      if (response.ok) {
        const data = await response.json()
        setReviews(data)
      }
    } catch (error) {
      console.error("Error fetching reviews:", error)
    } finally {
      setLoading(false)
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`h-4 w-4 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
    ))
  }

  if (loading) {
    return (
      <section id="avaliacoes" className="py-20 bg-card/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Carregando avaliações...</h2>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="avaliacoes" className="py-20 bg-card/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">
            O Que Nossos <span className="gradient-text">Clientes Dizem</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
            Depoimentos reais de clientes que transformaram seus negócios conosco.
          </p>
          <div className="mt-6">
            <Link href="/reviews">
              <Button className="gradient-primary">
                <Plus className="mr-2 h-4 w-4" />
                Deixar Avaliação
              </Button>
            </Link>
          </div>
        </div>

        {reviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {reviews.map((review) => (
              <Card key={review.id} className="bg-card border-border/50 hover:shadow-lg transition-all duration-300">
  <CardContent className="p-6">
    <div className="flex items-center mb-4">{renderStars(review.rating)}</div>
    <blockquote className="text-muted-foreground mb-4 text-pretty">"{review.comment}"</blockquote>
    <div className="flex items-center">
      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
        <span className="text-primary font-semibold">
          {review.reviewer_name ? review.reviewer_name.charAt(0).toUpperCase() : '?'}
        </span>
      </div>
      <div>
        <div className="font-semibold">{review.reviewer_name || 'Anônimo'}</div>
        <div className="text-sm text-muted-foreground">
          {new Date(review.created_at).toLocaleDateString("pt-BR")}
        </div>
      </div>
    </div>
  </CardContent>
</Card>

            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-xl text-muted-foreground mb-6">Seja o primeiro a deixar uma avaliação!</p>
            <Link href="/reviews">
              <Button className="gradient-primary">
                <Plus className="mr-2 h-4 w-4" />
                Deixar Primeira Avaliação
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
