"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, Check, X, Eye, EyeOff } from "lucide-react"

type ReviewData = {
  id: string
  reviewer_name: string
  reviewer_email: string
  rating: number
  comment: string
  is_approved: boolean
  is_public: boolean
  created_at: string | null
  product: null | {
    title: string | null
    user: null | {
      full_name: string | null
    }
  }
}

export function ReviewsModeration() {
  const [reviews, setReviews] = useState<ReviewData[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("pending")
  const mounted = useRef(true)

  useEffect(() => {
    mounted.current = true
    const ac = new AbortController()

    const fetchReviews = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/admin/reviews?filter=${filter}`, { signal: ac.signal })
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        const data = (await response.json()) as ReviewData[] | null
        if (!mounted.current) return
        setReviews(Array.isArray(data) ? data : [])
      } catch (error) {
        if (ac.signal.aborted) return
        console.error("Error fetching reviews:", error)
        if (mounted.current) setReviews([])
      } finally {
        if (mounted.current) setLoading(false)
      }
    }

    fetchReviews()
    return () => {
      mounted.current = false
      ac.abort()
    }
  }, [filter])

  const handleApprove = async (reviewId: string) => {
    try {
      const res = await fetch(`/api/admin/reviews/${reviewId}/approve`, { method: "POST" })
      if (res.ok) {
        // otimista: atualiza localmente
        setReviews((prev) => prev.map(r => r.id === reviewId ? { ...r, is_approved: true } : r))
      }
    } catch (e) {
      console.error("Error approving review:", e)
    }
  }

  const handleReject = async (reviewId: string) => {
    try {
      const res = await fetch(`/api/admin/reviews/${reviewId}/reject`, { method: "POST" })
      if (res.ok) {
        // remove da lista (ou ajuste conforme sua regra)
        setReviews((prev) => prev.filter(r => r.id !== reviewId))
      }
    } catch (e) {
      console.error("Error rejecting review:", e)
    }
  }

  const handleToggleVisibility = async (reviewId: string, isPublic: boolean) => {
    try {
      const res = await fetch(`/api/admin/reviews/${reviewId}/visibility`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_public: !isPublic }),
      })
      if (res.ok) {
        setReviews((prev) =>
          prev.map(r => r.id === reviewId ? { ...r, is_public: !isPublic } : r)
        )
      }
    } catch (e) {
      console.error("Error toggling visibility:", e)
    }
  }

  const renderStars = (rating: number) =>
    Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < Math.round(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
      />
    ))

  if (loading) {
    return (
      <Card className="bg-card border-border/50">
        <CardHeader>
          <CardTitle>Moderação de Avaliações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-pulse">Carregando avaliações...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Moderação de Avaliações</CardTitle>
            <CardDescription>Gerencie e modere avaliações de produtos e serviços</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant={filter === "pending" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("pending")}
              className={filter === "pending" ? "gradient-primary" : "bg-transparent"}
            >
              Pendentes
            </Button>
            <Button
              variant={filter === "approved" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("approved")}
              className={filter === "approved" ? "gradient-primary" : "bg-transparent"}
            >
              Aprovadas
            </Button>
            <Button
              variant={filter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("all")}
              className={filter === "all" ? "gradient-primary" : "bg-transparent"}
            >
              Todas
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {reviews.length === 0 ? (
          <div className="text-center py-8">
            <Star className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {filter === "pending" ? "Nenhuma avaliação pendente" : "Nenhuma avaliação encontrada"}
            </h3>
            <p className="text-muted-foreground">
              {filter === "pending"
                ? "Todas as avaliações foram moderadas."
                : "As avaliações aparecerão aqui quando forem enviadas."}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {reviews.map((review) => {
              const productTitle = review.product?.title ?? "Sem produto"
              const sellerName = review.product?.user?.full_name ?? "—"
              const created = review.created_at
                ? new Date(review.created_at).toLocaleDateString("pt-BR")
                : "—"

              return (
                <div key={review.id} className="border border-border/50 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="font-semibold">{review.reviewer_name}</div>
                        <div className="text-sm text-muted-foreground">({review.reviewer_email})</div>
                        <div className="flex">{renderStars(review.rating)}</div>
                      </div>

                      <div className="text-sm text-muted-foreground mb-2">
                        Produto: <span className="font-medium">{productTitle}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Vendedor: <span className="font-medium">{sellerName}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant={review.is_approved ? "default" : "secondary"}>
                        {review.is_approved ? "Aprovada" : "Pendente"}
                      </Badge>
                      <Badge variant={review.is_public ? "default" : "outline"}>
                        {review.is_public ? "Pública" : "Oculta"}
                      </Badge>
                      <div className="text-xs text-muted-foreground">{created}</div>
                    </div>
                  </div>

                  <blockquote className="text-muted-foreground mb-4 p-3 bg-muted/20 rounded text-pretty">
                    "{review.comment}"
                  </blockquote>

                  <div className="flex gap-2">
                    {!review.is_approved && (
                      <Button size="sm" onClick={() => handleApprove(review.id)} className="gradient-primary">
                        <Check className="mr-2 h-4 w-4" />
                        Aprovar
                      </Button>
                    )}

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggleVisibility(review.id, review.is_public)}
                      className="bg-transparent"
                    >
                      {review.is_public ? (
                        <>
                          <EyeOff className="mr-2 h-4 w-4" />
                          Ocultar
                        </>
                      ) : (
                        <>
                          <Eye className="mr-2 h-4 w-4" />
                          Mostrar
                        </>
                      )}
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleReject(review.id)}
                      className="bg-transparent border-destructive/50 text-destructive hover:bg-destructive/10"
                    >
                      <X className="mr-2 h-4 w-4" />
                      Excluir
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
