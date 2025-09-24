"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Star, CheckCircle } from "lucide-react"

interface ReviewModalProps {
  isOpen: boolean
  onClose: () => void
  productId?: string
  productTitle?: string
}

export function ReviewModal({ isOpen, onClose, productId, productTitle }: ReviewModalProps) {
  const [formData, setFormData] = useState({
    reviewer_name: "",
    reviewer_email: "",
    rating: 0,
    comment: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

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

  const handleClose = () => {
    setIsSubmitted(false)
    setFormData({
      reviewer_name: "",
      reviewer_email: "",
      rating: 0,
      comment: "",
    })
    onClose()
  }

  if (isSubmitted) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <div className="p-6 text-center">
            <div className="mb-6">
              <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold mb-4">Avaliação Enviada!</h3>
            <p className="text-muted-foreground mb-6">
              Obrigado por sua avaliação. Ela será analisada e publicada em breve.
            </p>
            <Button onClick={handleClose} className="w-full gradient-primary">
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{productTitle ? `Avaliar ${productTitle}` : "Deixar Avaliação"}</DialogTitle>
          <DialogDescription>Compartilhe sua experiência conosco</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="modal-name">Nome *</Label>
            <Input
              id="modal-name"
              value={formData.reviewer_name}
              onChange={(e) => setFormData({ ...formData, reviewer_name: e.target.value })}
              required
              placeholder="Seu nome"
            />
          </div>

          <div>
            <Label htmlFor="modal-email">E-mail *</Label>
            <Input
              id="modal-email"
              type="email"
              value={formData.reviewer_email}
              onChange={(e) => setFormData({ ...formData, reviewer_email: e.target.value })}
              required
              placeholder="seu@email.com"
            />
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
                    className={`h-6 w-6 transition-colors ${
                      i < formData.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300 hover:text-yellow-400"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="modal-comment">Comentário *</Label>
            <Textarea
              id="modal-comment"
              rows={3}
              value={formData.comment}
              onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
              required
              placeholder="Conte-nos sobre sua experiência..."
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose} className="flex-1 bg-transparent">
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1 gradient-primary">
              {isSubmitting ? "Enviando..." : "Enviar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
