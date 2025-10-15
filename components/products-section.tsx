"use client"

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MessageCircle, Eye, Package, DollarSign, Star, ShoppingCart } from "lucide-react"

/* ==================== TIPOS ==================== */
type Product = {
  id: string
  title: string
  description: string
  image_url: string
  sku: string
  category: string
  price: number | null
}

/* ==================== CONSTANTES ==================== */
const COLS_DESKTOP = 3
const ROWS_PER_LAYER = 2
const CARDS_PER_LAYER = COLS_DESKTOP * ROWS_PER_LAYER // 6
const PAGE_SIZE = 9 // sua API

const fmtBRL = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v)

const getWhatsAppUrl = (text: string) => {
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_PHONE || "5511992138829"
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`
}

/* ==================== HELPERS ==================== */
function slugify(s: string) {
  return (s || "")
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

function hasValidImageUrl(input?: string | null) {
  const raw = (input || "").trim()
  if (!raw) return false
  return /^https?:\/\//i.test(raw) || /^data:image\//i.test(raw)
}

/* ==================== UI Auxiliar ==================== */
const Stars = ({ score = 5 }: { score?: number }) => (
  <div className="flex items-center gap-1" aria-label={`Avaliação ${score} de 5`}>
    {Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < Math.round(score) ? "fill-yellow-400 text-yellow-400" : "text-white/30 md:text-muted-foreground/40"}`}
        aria-hidden="true"
      />
    ))}
  </div>
)

/* ==================== Skeletons ==================== */
const ProductSkeleton = () => (
  <Card className="overflow-hidden border-white/10 bg-white/5 backdrop-blur">
    <div className="relative aspect-video">
      <div className="h-full w-full animate-pulse bg-white/10" />
    </div>
    <CardHeader className="pb-4">
      <div className="mb-3 h-6 w-3/4 animate-pulse rounded bg-white/10" />
      <div className="mb-2 h-4 w-full animate-pulse rounded bg-white/10" />
      <div className="h-4 w-2/3 animate-pulse rounded bg-white/10" />
    </CardHeader>
    <CardContent className="pt-0">
      <div className="flex gap-3">
        <div className="h-9 w-full animate-pulse rounded bg-white/10" />
        <div className="h-9 w-28 animate-pulse rounded bg-white/10" />
      </div>
    </CardContent>
  </Card>
)

const RowSkeleton = () => (
  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
    {Array.from({ length: 3 }).map((_, i) => (
      <div key={i} className="h-[280px] animate-pulse rounded-lg bg-white/10" />
    ))}
  </div>
)

/* ==================== Botões ==================== */
function PrimaryButton({ children, ...props }: React.ComponentProps<typeof Button>) {
  return (
    <Button
      {...props}
      className="relative overflow-hidden rounded-full px-5 py-2 font-medium
      bg-[linear-gradient(135deg,#ffffff_0%,#f3f4f6_100%)]
      text-neutral-900 shadow-[0_8px_30px_-12px_rgba(255,255,255,.35)]
      hover:shadow-[0_14px_40px_-10px_rgba(255,255,255,.45)]
      focus-visible:ring-2 focus-visible:ring-white/70"
    >
      <span className="relative z-[1] flex items-center">{children}</span>
    </Button>
  )
}

function PrimaryLinkButton({ href, children, className = "" }: { href: string; children: React.ReactNode; className?: string }) {
  return (
    <Button
      asChild
      className={`relative overflow-hidden rounded-full px-5 py-2 font-medium
      bg-[linear-gradient(135deg,#ffffff_0%,#f3f4f6_100%)]
      text-neutral-900 shadow-[0_8px_30px_-12px_rgba(255,255,255,.35)]
      hover:shadow-[0_14px_40px_-10px_rgba(255,255,255,.45)]
      focus-visible:ring-2 focus-visible:ring-white/70 ${className}`}
    >
      <Link href={href} className="relative block rounded-full">
        <span className="relative z-[1] flex items-center">{children}</span>
      </Link>
    </Button>
  )
}

function SubtleButton({ children, ...props }: React.ComponentProps<"button">) {
  return (
    <button
      {...props}
      className="rounded-full border border-white/30 bg-white/10 px-5 py-2 text-white hover:bg-white/15
      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 inline-flex items-center"
    >
      {children}
    </button>
  )
}

/* ==================== Card Produto ==================== */
const ProductCard = React.memo(function ProductCard({
  product,
  onConsult,
}: {
  product: Product
  onConsult: (p: Product) => void
}) {
  // preço só aparece se > 0
  const hasPrice = product.price != null && Number(product.price) > 0

  const [showPlaceholder, setShowPlaceholder] = useState(!hasValidImageUrl(product.image_url))
  const href = `/produto/${slugify(product.title)}-${product.sku}`

  return (
    <article
      className="
        group relative overflow-hidden rounded-2xl
        border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))]
        shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur
        transition-all hover:-translate-y-1 hover:shadow-[0_26px_80px_-24px_rgba(0,0,0,0.55)]
      "
    >
      {/* MEDIA */}
      <Link href={href} aria-label={`Abrir detalhes de ${product.title}`} className="relative block aspect-video overflow-hidden">
        {showPlaceholder ? (
          <div className="relative flex h-full w-full items-center justify-center">
            <div aria-hidden className="absolute inset-0 bg-[radial-gradient(1200px_400px_at_50%_-10%,rgba(255,255,255,0.10),transparent_60%),linear-gradient(180deg,rgba(0,0,0,0.6),rgba(0,0,0,0.35))]" />
            <div aria-hidden className="absolute inset-0 opacity-[.18] [mask-image:radial-gradient(70%_60%_at_50%_45%,#000,transparent_72%)]">
              <div className="h-full w-full bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:34px_34px]" />
            </div>
            <div className="relative z-[1] flex flex-col items-center text-center">
              <Package className="mb-3 h-10 w-10 text-white/70" />
              <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs text-white/80 backdrop-blur">
                Imagem em breve
              </span>
            </div>
            {/* chips */}
            <div className="absolute left-3 top-3 flex gap-2">
              <span className="inline-flex items-center gap-1 rounded-full border border-white/25 bg-white/15 px-2 py-0.5 text-[11px] text-white backdrop-blur">
                <Package className="h-3 w-3" /> {product.category || "Produto"}
              </span>
            </div>
            <div className="absolute right-3 top-3">
              <span className="rounded-full border border-white/25 bg-white/15 px-2 py-0.5 text-[11px] text-white backdrop-blur">
                {product.sku}
              </span>
            </div>
          </div>
        ) : (
          <Image
            src={product.image_url as string}
            alt={product.title ? `Imagem de ${product.title}` : "Imagem do produto"}
            fill
            sizes="(max-width:768px) 100vw, (max-width:1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-600 will-change-transform group-hover:scale-[1.045]"
            priority={false}
            onError={() => setShowPlaceholder(true)}
          />
        )}
      </Link>

      {/* CONTENT */}
      <div className="p-5">
        <div className="mb-1 flex items-start justify-between gap-3">
          <h3 className="text-[1.05rem] font-semibold tracking-tight text-white">
            <Link href={href} className="hover:text-white/90">
              {product.title}
            </Link>
          </h3>
          <div className="shrink-0 translate-y-[1px]">
            <Stars score={5} />
          </div>
        </div>

        {product.description && (
          <p className="text-sm leading-relaxed text-white/70 line-clamp-2">{product.description}</p>
        )}

        <div className="my-5 h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        {/* CTAs */}
        <div className="flex flex-wrap items-center gap-3">
          <PrimaryLinkButton href={href} className="px-4 py-2">
            <Eye className="mr-2 h-4 w-4" />
            Ver detalhes
          </PrimaryLinkButton>

          <SubtleButton
            onClick={() => onConsult(product)}
            aria-label={`Consultar ${product.title} no WhatsApp`}
            className="px-4 py-2"
          >
            <MessageCircle className="mr-2 h-4 w-4" />
            Consultar
          </SubtleButton>
        </div>

        {hasPrice && (
          <div className="mt-4 text-emerald-400 font-semibold inline-flex items-center gap-1">
            <DollarSign className="h-4 w-4" />
            {fmtBRL(product.price as number)}
          </div>
        )}
      </div>
    </article>
  )
})

/* ==================== Seção de Produtos ==================== */
export function ProductsSection() {
  const rootRef = useRef<HTMLDivElement>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [visibleCount, setVisibleCount] = useState(CARDS_PER_LAYER) // 2 linhas

  const acRef = useRef<AbortController | null>(null)

  // Fetch paginado
  const fetchPage = useCallback(
    async (newOffset: number, append = false): Promise<number> => {
      acRef.current?.abort()
      const ac = new AbortController()
      acRef.current = ac

      try {
        if (append) setLoadingMore(true)
        else setLoading(true)
        setError(null)

        const url = `/api/products?category=product&limit=${PAGE_SIZE}&offset=${newOffset}`
        const res = await fetch(url, { signal: ac.signal, cache: "no-store" })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = (await res.json()) as Product[]

        if (ac.signal.aborted) return 0

        setProducts((prev) => (append ? [...prev, ...data] : data))
        setOffset(newOffset)
        setHasMore(data.length === PAGE_SIZE)
        return data.length
      } catch (e: any) {
        if (!ac.signal.aborted) {
          console.error("Error fetching products:", e)
          setError("Não foi possível carregar os produtos.")
        }
        return 0
      } finally {
        if (!ac.signal.aborted) {
          setLoading(false)
          setLoadingMore(false)
        }
      }
    },
    [],
  )

  useEffect(() => {
    fetchPage(0, false)
    return () => acRef.current?.abort()
  }, [fetchPage])

  // Ordena: com imagem primeiro
  const sortedProducts = useMemo(() => {
    return [...products].sort((a, b) => {
      const aHas = hasValidImageUrl(a.image_url) ? 1 : 0
      const bHas = hasValidImageUrl(b.image_url) ? 1 : 0
      return bHas - aHas
    })
  }, [products])

  // Garante visibilidade mínima de 2 linhas e não passa do total
  useEffect(() => {
    setVisibleCount((v) => Math.min(Math.max(CARDS_PER_LAYER, v), sortedProducts.length || CARDS_PER_LAYER))
  }, [sortedProducts.length])

  // Ver mais (6 em 6). Se faltar local, busca próxima página.
  const handleShowMore = useCallback(async () => {
    const step = CARDS_PER_LAYER
    const localAvailable = sortedProducts.length - visibleCount

    if (localAvailable >= step) {
      setVisibleCount((v) => v + step)
      return
    }

    if (hasMore && !loadingMore) {
      const nextOffset = offset + PAGE_SIZE
      const added = await fetchPage(nextOffset, true)
      if (added > 0) {
        setVisibleCount((v) => Math.min(v + step, sortedProducts.length + added))
      }
    }
  }, [sortedProducts.length, visibleCount, hasMore, loadingMore, offset, fetchPage])

  // Ver menos (recolhe 2 linhas), nunca abaixo de 2 linhas
  const handleShowLess = useCallback(() => {
    setVisibleCount((v) => Math.max(CARDS_PER_LAYER, v - CARDS_PER_LAYER))
    // opcional: dar scroll suave até o topo da grade
    const el = document.getElementById("produtos-grid")
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" })
  }, [])

  const canShowMore = (visibleCount < sortedProducts.length) || hasMore
  const canShowLess = visibleCount > CARDS_PER_LAYER

  const handleQuickConsult = useMemo(
    () => (product: Product) => {
      const message = `Olá! Gostaria de saber mais sobre o produto: ${product.title} (SKU: ${product.sku}).`
      const whatsappUrl = getWhatsAppUrl(message)
      if (typeof window !== "undefined") window.open(whatsappUrl, "_blank", "noopener,noreferrer")
    },
    [],
  )

  return (
    <section id="produtos" ref={rootRef} className="relative overflow-hidden text-white">
      {/* fundo escuro */}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,#0f1115_0%,#14161c_35%,#0f1115_100%)]" />
      <div aria-hidden className="pointer-events-none absolute inset-0 animate-[meshDrift_24s_ease-in-out_infinite] bg-[radial-gradient(1000px_700px_at_82%_-10%,rgba(255,255,255,0.06),transparent_60%),radial-gradient(900px_600px_at_12%_110%,rgba(255,255,255,0.05),transparent_55%)]" />

      <div className="relative z-[2] container mx-auto px-4 py-24">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-sm text-white/80 backdrop-blur">
            <Package className="h-4 w-4" />
            Catálogo
          </div>
          <h1
            className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl"
            style={{ background: "linear-gradient(90deg,#fff,#cbd5e1,#ffffff)", WebkitBackgroundClip: "text", color: "transparent" }}
          >
            Nossos <span className="whitespace-nowrap">Produtos</span>
          </h1>
          <p className="mx-auto mt-3 max-w-3xl text-lg text-white/70 md:text-xl">
            Soluções tecnológicas selecionadas para desempenho e confiabilidade no seu negócio.
          </p>
        </div>

        {/* Grade / Conteúdo */}
        <div className="mt-8">
          {loading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <ProductSkeleton key={i} />
              ))}
            </div>
          ) : error ? (
            <div className="py-16 text-center text-white/70">{error}</div>
          ) : sortedProducts.length === 0 ? (
            <div className="py-16 text-center">
              <div className="relative mx-auto mb-6 h-24 w-24">
                <div className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-r from-fuchsia-500/15 to-indigo-500/15" />
                <Package className="relative mx-auto mt-6 h-12 w-12 text-white/60" />
              </div>
              <h3 className="mb-2 text-2xl font-semibold">Catálogo em breve</h3>
              <p className="mx-auto mb-8 max-w-md text-white/70">
                Estamos preparando novas opções. Fale com a gente para conhecer as soluções disponíveis.
              </p>
              <PrimaryButton onClick={() =>
                handleQuickConsult({
                  id: "temp", title: "Consulta de Produtos", description: "", image_url: "", sku: "CATALOGO", category: "product", price: null,
                })
              }>
                <MessageCircle className="mr-2 h-5 w-5" />
                Consultar produtos
              </PrimaryButton>
            </div>
          ) : (
            <>
              <div id="produtos-grid" className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {sortedProducts.slice(0, visibleCount).map((p) => (
                  <div key={p.id}>
                    <ProductCard
                      product={p}
                      onConsult={(prod) => {
                        const message = `Olá! Gostaria de saber mais sobre o produto: ${prod.title} (SKU: ${prod.sku}).`
                        const whatsappUrl = getWhatsAppUrl(message)
                        if (typeof window !== "undefined") window.open(whatsappUrl, "_blank", "noopener,noreferrer")
                      }}
                    />
                  </div>
                ))}
              </div>

              {/* Controles */}
              <div className="mt-10 flex items-center justify-center gap-3">
                {canShowLess && (
                  <FancyButton onClick={handleShowLess} loading={false}>
                    Ver menos
                  </FancyButton>
                )}
                {canShowMore && (
                  <FancyButton onClick={handleShowMore} loading={loadingMore}>
                    {loadingMore ? "Carregando..." : "Ver mais"}
                  </FancyButton>
                )}
              </div>

              {/* Skeleton ao carregar mais da API */}
              {loadingMore && (
                <div className="mt-6">
                  <RowSkeleton />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* prefer-reduced-motion (só para segurança) */}
      <style jsx global>{`
        @keyframes meshDrift { 0% { transform: translate3d(0,0,0) } 50% { transform: translate3d(0,-10px,0) } 100% { transform: translate3d(0,0,0) } }
        @media (prefers-reduced-motion: reduce) { * { animation: none !important; transition: none !important; } }
      `}</style>
    </section>
  )
}

/* ==================== Botão de ação (Ver mais / Ver menos) ==================== */
function FancyButton({
  onClick,
  loading,
  children,
}: {
  onClick: () => void | Promise<void>
  loading: boolean
  children: React.ReactNode
}) {
  const ref = useRef<HTMLButtonElement>(null)
  const onMove = (e: React.MouseEvent) => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    el.style.setProperty("--x", `${e.clientX - r.left}px`)
    el.style.setProperty("--y", `${e.clientY - r.top}px`)
  }
  return (
    <button
      ref={ref}
      onMouseMove={onMove}
      onClick={onClick}
      disabled={loading}
      className="
        group relative inline-flex items-center justify-center rounded-full px-6 py-2
        text-sm font-medium text-neutral-900
        bg-[linear-gradient(135deg,#ffffff_0%,#f3f4f6_100%)]
        shadow-[0_8px_30px_-12px_rgba(255,255,255,.35)]
        transition disabled:opacity-50
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70
        hover:shadow-[0_14px_40px_-10px_rgba(255,255,255,.45)]
      "
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-full opacity-0 transition-opacity duration-200 group-hover:opacity-100"
        style={{ background: "radial-gradient(140px 90px at var(--x,50%) var(--y,50%), rgba(0,0,0,.08), transparent 70%)" }}
      />
      {loading ? "Carregando..." : children}
    </button>
  )
}
