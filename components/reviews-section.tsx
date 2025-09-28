"use client"

import { useEffect, useMemo, useState, useId } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Star, Plus } from "lucide-react"
import {
  motion,
  AnimatePresence,
  useReducedMotion,
  type Variants,
  type Transition,
} from "framer-motion"

/* =========================
   Tipos
========================= */
interface Review {
  id: string
  reviewer_name: string
  rating: number
  comment: string
  created_at: string
}

/* =========================
   Helpers puros (testáveis)
========================= */
export function __clampRating(rating: number): number {
  if (Number.isNaN(rating)) return 0
  if (rating < 0) return 0
  if (rating > 5) return 5
  return Math.floor(rating)
}

export function __starArray(rating: number): boolean[] {
  const r = __clampRating(rating)
  return Array.from({ length: 5 }, (_, i) => i < r)
}

/* Pequenos "tests" em dev (não afetam prod) */
if (typeof window !== "undefined" && process.env.NODE_ENV !== "production") {
  console.assert(__clampRating(6) === 5, "rating > 5 deve clamp para 5")
  console.assert(__clampRating(-2) === 0, "rating < 0 deve clamp para 0")
  const arr = __starArray(3)
  console.assert(arr.length === 5 && arr.filter(Boolean).length === 3, "__starArray deve marcar 3 verdadeiros")
}

/* =========================
   Componente
========================= */
export default function ReviewsSection() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const listId = useId()
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    const controller = new AbortController()
    const { signal } = controller

    async function fetchReviews() {
      setError(null)
      try {
        const response = await fetch("/api/reviews", { signal, cache: "no-store" })
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        const data: Review[] = await response.json()
        setReviews(Array.isArray(data) ? data : [])
      } catch (err: any) {
        if (err?.name !== "AbortError") {
          console.error("Error fetching reviews:", err)
          setError("Não foi possível carregar as avaliações.")
        }
      } finally {
        setLoading(false)
      }
    }

    fetchReviews()
    return () => controller.abort()
  }, [])

  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }),
    []
  )

  // ====== EASING compatível com motion-dom (v11)
  const easeOutBezier: [number, number, number, number] = [0.16, 1, 0.3, 1]

  // ====== Variants tipados (evita erro TS2322)
  const containerVariants: Variants = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 12 },
    show: {
      opacity: 1,
      y: 0,
      transition: prefersReducedMotion
        ? { duration: 0.2 }
        : {
            staggerChildren: 0.06,
            delayChildren: 0.08,
            duration: 0.5,
            ease: easeOutBezier,
          },
    },
  }

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 10 },
    show: {
      opacity: 1,
      y: 0,
      transition: prefersReducedMotion ? { duration: 0.2 } : { duration: 0.35, ease: easeOutBezier },
    },
  }

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 14, scale: 0.98 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: prefersReducedMotion ? { duration: 0.25 } : { duration: 0.45, ease: easeOutBezier },
    },
    hover: prefersReducedMotion ? {} : { y: -4, rotateX: 1, rotateY: -1 },
  }

  // ====== Estrelas (resolver bem tipado)
  const springBase = {
    type: "spring" as const, // literal para casar com AnimationGeneratorType
    stiffness: 400,
    damping: 18,
  }

  const starVariants: Variants = {
    hidden: { scale: 0.7, opacity: 0 },
    show: (i: number) => {
      const transition: Transition =
        prefersReducedMotion
          ? { duration: 0.15 }
          : { ...springBase, delay: 0.08 + i * 0.04 }
      return {
        scale: 1,
        opacity: 1,
        transition,
      }
    },
  }

  /* ========== Loading (skeleton) ========== */
  if (loading) {
    return (
      <section id="avaliacoes" className="relative py-20" aria-busy="true">
        <RadialBackdrop />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="h-8 w-72 mx-auto rounded bg-muted shimmer" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card
                key={i}
                className="h-full border-border/50 bg-white/60 backdrop-blur supports-[backdrop-filter]:bg-white/40"
              >
                <CardContent className="p-6">
                  <div className="h-4 w-28 bg-muted rounded shimmer mb-3" />
                  <div className="h-4 w-full bg-muted rounded shimmer mb-2" />
                  <div className="h-4 w-3/4 bg-muted rounded shimmer mb-6" />
                  <div className="mt-8 flex items-center">
                    <div className="w-10 h-10 rounded-full bg-muted shimmer mr-3" />
                    <div className="flex-1">
                      <div className="h-3 w-24 bg-muted rounded shimmer mb-1" />
                      <div className="h-3 w-16 bg-muted rounded shimmer" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    )
  }

  /* ========== Content ========== */
  return (
    <section id="avaliacoes" className="relative py-20">
      <RadialBackdrop />

      <motion.div
        className="container mx-auto px-4 sm:px-6 lg:px-8"
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
      >
        <motion.div className="text-center mb-12" variants={itemVariants}>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">
            O Que Nossos <span className="gradient-text">Clientes Dizem</span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
            Depoimentos reais de clientes que transformaram seus negócios conosco.
          </p>
          <div className="mt-6">
            <Link href="/reviews" aria-label="Ir para a página de avaliações">
              <Button className="gradient-primary shadow-sm hover:shadow-md transition-shadow">
                <Plus className="mr-2 h-4 w-4" />
                Deixar Avaliação
              </Button>
            </Link>
          </div>
        </motion.div>

        {error && (
          <motion.div
            variants={itemVariants}
            className="mb-8 text-center text-sm text-red-600"
            role="status"
          >
            {error}
          </motion.div>
        )}

        <AnimatePresence mode="popLayout">
          {reviews.length > 0 ? (
            <motion.ul
              key={`${listId}-list`}
              variants={containerVariants}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              aria-label="Lista de avaliações"
            >
              {reviews.map((review) => {
                const name = review.reviewer_name?.trim() || "Anônimo"
                const initial = name.charAt(0).toUpperCase() || "?"
                let dateLabel = ""
                try {
                  const d = new Date(review.created_at)
                  dateLabel = isNaN(d.getTime()) ? "" : dateFormatter.format(d)
                } catch {
                  dateLabel = ""
                }

                return (
                  <motion.li
                    key={review.id}
                    variants={itemVariants}
                    layout
                    transition={{ type: "spring", stiffness: 200, damping: 24 }}
                  >
                    <motion.div variants={cardVariants} whileHover="hover" className="h-full">
                      <Card className="bg-white/60 supports-[backdrop-filter]:bg-white/40 backdrop-blur border-border/50 hover:shadow-lg transition-all duration-300 h-full will-change-transform">
                        <CardContent className="p-6 flex flex-col h-full">
                          {/* Stars */}
                          <div className="mb-4" aria-label={`Nota ${__clampRating(review.rating)} de 5`}>
                            <div className="flex items-center gap-1">
                              {__starArray(review.rating).map((filled, i) => (
                                <motion.span
                                  key={i}
                                  custom={i}
                                  variants={starVariants}
                                  initial="hidden"
                                  whileInView="show"
                                  viewport={{ once: true }}
                                >
                                  <Star
                                    className={
                                      filled
                                        ? "h-4 w-4 fill-yellow-400 text-yellow-400 drop-shadow-[0_1px_1px_rgba(0,0,0,.08)]"
                                        : "h-4 w-4 text-gray-300"
                                    }
                                    aria-hidden
                                  />
                                </motion.span>
                              ))}
                            </div>
                          </div>

                          {/* Quote */}
                          <blockquote className="text-muted-foreground mb-4 text-pretty line-clamp-4 leading-relaxed">
                            “{review.comment}”
                          </blockquote>

                          {/* Footer */}
                          <div className="mt-auto flex items-center pt-2">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3 ring-1 ring-border">
                              <span className="text-primary font-semibold">{initial}</span>
                            </div>
                            <div>
                              <div className="font-semibold">{name}</div>
                              {dateLabel && <div className="text-sm text-muted-foreground">{dateLabel}</div>}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </motion.li>
                )
              })}
            </motion.ul>
          ) : (
            <motion.div key={`${listId}-empty`} variants={itemVariants} className="text-center py-12">
              <p className="text-lg md:text-xl text-muted-foreground mb-6">
                Seja o primeiro a deixar uma avaliação!
              </p>
              <Link href="/reviews">
                <Button className="gradient-primary">
                  <Plus className="mr-2 h-4 w-4" />
                  Deixar Primeira Avaliação
                </Button>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </section>
  )
}

/* =========================
   Subcomponentes utilitários
========================= */
function RadialBackdrop() {
  // fundo super clean: branco -> cinza claro com leve granulado
  return (
    <div
      aria-hidden
      className="
        pointer-events-none absolute inset-0 -z-10
        bg-[radial-gradient(1200px_600px_at_50%_-10%,rgba(0,0,0,0.06),transparent_60%)]
      "
    >
      <div className="absolute inset-0 opacity-[0.35] mix-blend-overlay bg-noise" />
    </div>
  )
}
