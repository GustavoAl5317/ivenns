"use client"

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, Eye, Package, DollarSign, Star, ShoppingCart } from "lucide-react"

type Product = {
  id: string
  title: string
  description: string
  image_url: string
  sku: string
  category: string
  price: number | null
}

const PAGE_SIZE = 9

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1518779578993-ec3579fee39f?w=1200&h=675&fit=crop&crop=center"

const fmtBRL = (v: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v)

const getWhatsAppUrl = (text: string) => {
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_PHONE || "5511992138829"
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`
}

const Stars = ({ score = 5 }: { score?: number }) => (
  <div className="flex items-center gap-1" aria-label={`Avaliação ${score} de 5`}>
    {Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < Math.round(score) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/40"}`}
        aria-hidden="true"
      />
    ))}
  </div>
)

/* ---------------- Skeletons ---------------- */

const ProductSkeleton = () => (
  <Card className="overflow-hidden border-border/50 bg-background/60 backdrop-blur">
    <div className="relative aspect-video">
      <div className="h-full w-full animate-pulse bg-muted" />
    </div>
    <CardHeader className="pb-4">
      <div className="h-6 w-3/4 animate-pulse bg-muted rounded mb-3" />
      <div className="h-4 w-full animate-pulse bg-muted rounded mb-2" />
      <div className="h-4 w-2/3 animate-pulse bg-muted rounded" />
    </CardHeader>
    <CardContent className="pt-0">
      <div className="flex gap-3">
        <div className="h-9 w-full animate-pulse bg-muted rounded" />
        <div className="h-9 w-28 animate-pulse bg-muted rounded" />
      </div>
    </CardContent>
  </Card>
)

const RowSkeleton = () => (
  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
    {Array.from({ length: 3 }).map((_, i) => (
      <div key={i} className="h-[280px] animate-pulse rounded-lg bg-muted/40" />
    ))}
  </div>
)

/* ---------------- Card ---------------- */

const ProductCard = React.memo(function ProductCard({
  product,
  onConsult,
}: {
  product: Product
  onConsult: (p: Product) => void
}) {
  const hasPrice = product.price != null
  const imgSrc = product.image_url || FALLBACK_IMAGE

  return (
    <Card className="group overflow-hidden border border-border/50 bg-background/60 backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:shadow-lg">
      {/* Cover */}
      <div className="relative aspect-video">
        <Image
          src={imgSrc}
          alt={product.title ? `Imagem de ${product.title}` : "Imagem do produto"}
          fill
          sizes="(max-width:768px) 100vw, (max-width:1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          priority={false}
        />

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />

        <div className="absolute top-3 left-3">
          <Badge variant="secondary" className="backdrop-blur bg-white/15 text-white border-white/25">
            <Package className="mr-1 h-3 w-3" />
            {product.category || "Produto"}
          </Badge>
        </div>

        <div className="absolute top-3 right-3">
          <Badge variant="outline" className="backdrop-blur bg-white/15 text-white border-white/25">
            {product.sku}
          </Badge>
        </div>

        {hasPrice && (
          <div className="absolute bottom-3 left-3">
            <div className="rounded-md bg-white/90 px-2.5 py-1 text-sm font-semibold text-green-700 ring-1 ring-green-200">
              <div className="flex items-center gap-1">
                <DollarSign className="h-4 w-4" />
                {fmtBRL(product.price as number)}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Body */}
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg md:text-xl tracking-tight group-hover:text-primary transition-colors">
            {product.title}
          </CardTitle>
          <Stars score={5} />
        </div>
        {product.description && (
          <CardDescription className="mt-1 text-sm leading-relaxed line-clamp-3">
            {product.description}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex gap-3">
          <Button asChild className="flex-1" size="sm" aria-label={`Ver detalhes de ${product.title}`}>
            <Link href={`/produto/${product.id}`}>
              <Eye className="mr-2 h-4 w-4" />
              Ver detalhes
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onConsult(product)}
            className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
            aria-label={`Consultar ${product.title} no WhatsApp`}
          >
            <MessageCircle className="mr-2 h-4 w-4" />
            Consultar
          </Button>
        </div>
      </CardContent>
    </Card>
  )
})

/* ---------------- Section ---------------- */

export function ProductsSection() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)          // loading da primeira página
  const [loadingMore, setLoadingMore] = useState(false) // loading incremental
  const [error, setError] = useState<string | null>(null)
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const acRef = useRef<AbortController | null>(null)

  const fetchPage = useCallback(
    async (newOffset: number, append = false) => {
      acRef.current?.abort()
      const ac = new AbortController()
      acRef.current = ac

      try {
        if (append) setLoadingMore(true)
        else setLoading(true)

        setError(null)

        // ⬇️ ajuste se sua API usar page/pageSize ao invés de limit/offset
        const url = `/api/products?category=product&limit=${PAGE_SIZE}&offset=${newOffset}`
        const res = await fetch(url, { signal: ac.signal, cache: "no-store" })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = (await res.json()) as Product[]

        // evita sobrescrever durante abort
        if (ac.signal.aborted) return

        setProducts((prev) => (append ? [...prev, ...data] : data))
        setOffset(newOffset)
        setHasMore(data.length === PAGE_SIZE) // se veio menos que PAGE_SIZE, acabou
      } catch (e: any) {
        if (!ac.signal.aborted) {
          console.error("Error fetching products:", e)
          setError("Não foi possível carregar os produtos.")
        }
      } finally {
        if (!ac.signal.aborted) {
          setLoading(false)
          setLoadingMore(false)
        }
      }
    },
    []
  )

  useEffect(() => {
    // primeira página
    fetchPage(0, false)
    return () => acRef.current?.abort()
  }, [fetchPage])

  const handleLoadMore = () => {
    if (!hasMore || loadingMore) return
    // próximo offset
    const nextOffset = offset + PAGE_SIZE
    fetchPage(nextOffset, true)
  }

  const handleQuickConsult = useMemo(
    () => (product: Product) => {
      const message = `Olá! Gostaria de saber mais sobre o produto: ${product.title} (SKU: ${product.sku}).`
      const whatsappUrl = getWhatsAppUrl(message)
      if (typeof window !== "undefined") window.open(whatsappUrl, "_blank", "noopener,noreferrer")
    },
    []
  )

  return (
    <section id="produtos" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-14 text-center">
          <div className="mx-auto mb-4 inline-flex items-center gap-3 rounded-full border px-4 py-1.5 text-sm text-muted-foreground bg-muted/30">
            <Package className="h-4 w-4" />
            Catálogo
          </div>
        </div>

        <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
          Nossos <span className="gradient-text">Produtos</span>
        </h2>
        <p className="mx-auto mt-3 max-w-3xl text-center text-lg md:text-xl text-muted-foreground">
          Soluções tecnológicas selecionadas para desempenho e confiabilidade no seu negócio.
        </p>

        {/* Content */}
        <div className="mt-10">
          {loading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <ProductSkeleton key={i} />
              ))}
            </div>
          ) : error ? (
            <div className="py-16 text-center text-muted-foreground">{error}</div>
          ) : products.length === 0 ? (
            <div className="py-16 text-center">
              <div className="relative mx-auto mb-6 h-24 w-24">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-500/15 to-red-500/15 animate-pulse" />
                <Package className="relative mx-auto mt-6 h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="mb-2 text-2xl font-semibold">Catálogo em breve</h3>
              <p className="mx-auto mb-8 max-w-md text-muted-foreground">
                Estamos preparando novas opções. Fale com a gente para conhecer as soluções disponíveis.
              </p>
              <Button
                size="lg"
                onClick={() =>
                  handleQuickConsult({
                    id: "temp",
                    title: "Consulta de Produtos",
                    description: "",
                    image_url: "",
                    sku: "CATALOGO",
                    category: "product",
                    price: null,
                  })
                }
              >
                <MessageCircle className="mr-2 h-5 w-5" />
                Consultar produtos
              </Button>
            </div>
          ) : (
            <>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} onConsult={handleQuickConsult} />
                ))}
              </div>

              {/* Load more */}
              {hasMore && (
                <div className="mt-10 flex justify-center">
                  <Button onClick={handleLoadMore} disabled={loadingMore}>
                    {loadingMore ? "Carregando..." : "Ver mais"}
                  </Button>
                </div>
              )}

              {/* Skeleton ao carregar mais */}
              {loadingMore && (
                <div className="mt-6">
                  <RowSkeleton />
                </div>
              )}
            </>
          )}
        </div>

        {/* Highlights (clean) */}
        <div className="mt-16">
          <div className="rounded-xl border border-border/50 bg-background/60 p-6 md:p-8">
            <ul className="grid gap-6 md:grid-cols-3">
              <li className="flex items-start gap-3">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10">
                  <Star className="h-5 w-5 text-blue-600" />
                </span>
                <div>
                  <h4 className="mb-1 font-semibold leading-none">Qualidade premium</h4>
                  <p className="text-sm text-muted-foreground">
                    Produtos selecionados com rigor técnico para máxima durabilidade e performance.
                  </p>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10">
                  <ShoppingCart className="h-5 w-5 text-emerald-600" />
                </span>
                <div>
                  <h4 className="mb-1 font-semibold leading-none">Custo-benefício</h4>
                  <p className="text-sm text-muted-foreground">
                    Preços competitivos com suporte próximo e transparente.
                  </p>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/10">
                  <Package className="h-5 w-5 text-violet-600" />
                </span>
                <div>
                  <h4 className="mb-1 font-semibold leading-none">Suporte completo</h4>
                  <p className="text-sm text-muted-foreground">
                    Acompanhamento da escolha à implementação, sem dor de cabeça.
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
