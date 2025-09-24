"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Star, CheckCircle } from "lucide-react"
import { useRouter } from "next/navigation"

interface ReviewFormProps {
  productId?: string
}

export function ReviewForm({ productId }: ReviewFormProps) {
  const [formData, setFormData] = useState({
    reviewer_name: "",
    reviewer_email: "",
    rating: 0,
    comment: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const router = useRouter()

  const handleStarClick = (rating: number) => {
    setFormData({ ...formData, rating })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.rating === 0) {
      alert("Por favor, selecione uma avaliação de 1 a 5 estrelas.")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/reviews/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          product_id: productId || null,
        }),
      })

      if (response.ok) {
        setIsSubmitted(true)
      } else {
        alert("Erro ao enviar avaliação. Tente novamente.")
      }
    } catch (error) {
      console.error("Error submitting review:", error)
      alert("Erro ao enviar avaliação. Tente novamente.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <Card className="bg-card border-border/50">
        <CardContent className="p-8 text-center">
          <div className="mb-6">
            <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
          </div>
          <h3 className="text-2xl font-bold mb-4">Avaliação Enviada!</h3>
          <p className="text-muted-foreground mb-6">
            Obrigado por sua avaliação. Ela será analisada e publicada em breve.
          </p>
          <div className="space-y-2">
            <Button onClick={() => router.push("/")} className="w-full gradient-primary">
              Voltar ao Início
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setIsSubmitted(false)
                setFormData({
                  reviewer_name: "",
                  reviewer_email: "",
                  rating: 0,
                  comment: "",
                })
              }}
              className="w-full bg-transparent"
            >
              Deixar Outra Avaliação
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card border-border/50">
      <CardHeader>
        <CardTitle>Sua Avaliação</CardTitle>
        <CardDescription>Preencha os campos abaixo para deixar sua avaliação</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={formData.reviewer_name}
                onChange={(e) => setFormData({ ...formData, reviewer_name: e.target.value })}
                required
                placeholder="Seu nome"
              />
            </div>
            <div>
              <Label htmlFor="email">E-mail *</Label>
              <Input
                id="email"
                type="email"
                value={formData.reviewer_email}
                onChange={(e) => setFormData({ ...formData, reviewer_email: e.target.value })}
                required
                placeholder="seu@email.com"
              />
            </div>
          </div>

          <div>
            <Label>Avaliação *</Label>
            <div className="flex items-center gap-2 mt-2">
              {Array.from({ length: 5 }, (_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleStarClick(i + 1)}
                  className="focus:outline-none focus:ring-2 focus:ring-primary rounded"
                >
                  <Star
                    className={`h-8 w-8 transition-colors ${
                      i < formData.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300 hover:text-yellow-400"
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 text-sm text-muted-foreground">
                {formData.rating > 0
                  ? `${formData.rating} estrela${formData.rating > 1 ? "s" : ""}`
                  : "Clique para avaliar"}
              </span>
            </div>
          </div>

          <div>
            <Label htmlFor="comment">Comentário *</Label>
            <Textarea
              id="comment"
              rows={4}
              value={formData.comment}
              onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
              required
              placeholder="Conte-nos sobre sua experiência..."
            />
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full gradient-primary">
            {isSubmitting ? "Enviando..." : "Enviar Avaliação"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
