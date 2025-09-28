"use client"

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, Eye, Package, DollarSign, Star, ShoppingCart } from "lucide-react"

/* ==================== TIPOS E CONSTANTES (inalterados) ==================== */

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

/* ==================== Botões com gradiente (corrigidos) ==================== */

/** Botão normal (sem asChild) para ações */
function PrimaryButton({ children, ...props }: React.ComponentProps<typeof Button>) {
  return (
    <Button
      {...props}
      className={`
        relative overflow-hidden rounded-full px-5 py-2 font-medium
        bg-[linear-gradient(135deg,#ffffff_0%,#f3f4f6_100%)]
        text-neutral-900 shadow-[0_8px_30px_-12px_rgba(255,255,255,.35)]
        transition-all hover:shadow-[0_14px_40px_-10px_rgba(255,255,255,.45)]
        focus-visible:ring-2 focus-visible:ring-white/70
        ${props.className ?? ""}
      `}
      onMouseMove={(e) => {
        const el = e.currentTarget as HTMLElement
        const r = el.getBoundingClientRect()
        el.style.setProperty("--x", `${e.clientX - r.left}px`)
        el.style.setProperty("--y", `${e.clientY - r.top}px`)
      }}
    >
      {/* efeito dentro do único filho (o conteúdo do Button) */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-full opacity-0 transition-opacity duration-200 hover:opacity-100"
        style={{ background: "radial-gradient(120px 80px at var(--x,50%) var(--y,50%), rgba(0,0,0,.08), transparent 70%)" }}
      />
      <span className="relative z-[1] flex items-center">{children}</span>
    </Button>
  )
}

/**
 * Botão de Link estilizado: usa Button asChild mas garante **um único filho** (o Link).
 * Os spans decorativos ficam *dentro* do Link, evitando o erro React.Children.only.
 */
function PrimaryLinkButton({ href, children, className = "" }: { href: string; children: React.ReactNode; className?: string }) {
  return (
    <Button
      asChild
      className={`
        relative overflow-hidden rounded-full px-5 py-2 font-medium
        bg-[linear-gradient(135deg,#ffffff_0%,#f3f4f6_100%)]
        text-neutral-900 shadow-[0_8px_30px_-12px_rgba(255,255,255,.35)]
        transition-all hover:shadow-[0_14px_40px_-10px_rgba(255,255,255,.45)]
        focus-visible:ring-2 focus-visible:ring-white/70
        ${className}
      `}
    >
      <Link
        href={href}
        className="relative block rounded-full"
        onMouseMove={(e) => {
          const el = e.currentTarget as HTMLElement
          const r = el.getBoundingClientRect()
          el.style.setProperty("--x", `${e.clientX - r.left}px`)
          el.style.setProperty("--y", `${e.clientY - r.top}px`)
        }}
        aria-label="Ver detalhes"
      >
        {/* overlay DENTRO do Link (continua 1 filho do Button) */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-full opacity-0 transition-opacity duration-200 hover:opacity-100"
          style={{ background: "radial-gradient(120px 80px at var(--x,50%) var(--y,50%), rgba(0,0,0,.08), transparent 70%)" }}
        />
        <span className="relative z-[1] flex items-center">{children}</span>
      </Link>
    </Button>
  )
}

function SubtleButton({ children, ...props }: React.ComponentProps<"button">) {
  return (
    <button
      {...props}
      className={`
        group relative inline-flex items-center justify-center rounded-full border border-white/30
        bg-white/10 px-5 py-2 text-white hover:bg-white/15
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60
      `}
      onMouseMove={(e) => {
        const el = e.currentTarget as HTMLElement
        const r = el.getBoundingClientRect()
        el.style.setProperty("--x", `${e.clientX - r.left}px`)
        el.style.setProperty("--y", `${e.clientY - r.top}px`)
      }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-full opacity-0 transition-opacity duration-200 group-hover:opacity-100"
        style={{ background: "radial-gradient(120px 80px at var(--x,50%) var(--y,50%), rgba(255,255,255,.08), transparent 70%)" }}
      />
      <span className="relative z-[1] flex items-center">{children}</span>
    </button>
  )
}

/* ==================== Card Produto (efeitos PRO) ==================== */

/* ==================== Card Produto (versão refinada) ==================== */
const ProductCard = React.memo(function ProductCard({
  product,
  onConsult,
}: {
  product: Product
  onConsult: (p: Product) => void
}) {
  const hasPrice = product.price != null
  const imgSrc = product.image_url || FALLBACK_IMAGE
  const cardRef = useRef<HTMLDivElement>(null)

  // Tilt 3D + spotlight sutil
  const onMove = (e: React.MouseEvent) => {
    const el = cardRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const x = e.clientX - r.left
    const y = e.clientY - r.top
    el.style.setProperty("--rotX", `${((y / r.height) - 0.5) * -4}deg`)
    el.style.setProperty("--rotY", `${((x / r.width) - 0.5) * 4}deg`)
    el.style.setProperty("--sx", `${x}px`)
    el.style.setProperty("--sy", `${y}px`)
  }
  const onLeave = () => {
    const el = cardRef.current
    if (!el) return
    el.style.setProperty("--rotX", `0deg`)
    el.style.setProperty("--rotY", `0deg`)
  }

  return (
    <article
      ref={cardRef}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className="
        group relative overflow-hidden rounded-2xl
        border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))]
        shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur
        transition-all hover:-translate-y-1 hover:shadow-[0_26px_80px_-24px_rgba(0,0,0,0.55)]
      "
      style={{
        transform: "perspective(1000px) rotateX(var(--rotX,0deg)) rotateY(var(--rotY,0deg))",
      }}
    >
      {/* anel/brilho de borda */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-40 transition-opacity duration-300 group-hover:opacity-70"
        style={{
          padding: 1,
          borderRadius: 16,
          background:
            "conic-gradient(from 220deg at 50% 50%, rgba(255,255,255,.0), rgba(255,255,255,.18), rgba(255,255,255,.0))",
          mask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
          WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
        }}
      />

      {/* spotlight que segue o mouse */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(240px 180px at var(--sx,50%) var(--sy,50%), rgba(255,255,255,.10), transparent 70%)",
        }}
      />

      {/* MEDIA */}
      <Link
        href={`/produto/${product.id}`}
        aria-label={`Abrir detalhes de ${product.title}`}
        className="relative block aspect-video overflow-hidden"
      >
        <Image
          src={imgSrc}
          alt={product.title ? `Imagem de ${product.title}` : "Imagem do produto"}
          fill
          sizes="(max-width:768px) 100vw, (max-width:1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-600 will-change-transform group-hover:scale-[1.045]"
          priority={false}
        />

        {/* máscara glass + brilho em “sweep” */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
        <div
          className="pointer-events-none absolute inset-0 translate-x-[-30%] opacity-0 transition-[opacity,transform] duration-[900ms] ease-out group-hover:translate-x-[30%] group-hover:opacity-100
          [mask-image:linear-gradient(to_right,transparent,black_40%,transparent_60%)]"
          style={{ background: "linear-gradient(110deg, transparent 35%, rgba(255,255,255,.14) 50%, transparent 65%)" }}
        />

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

        {/* Preço “glass” flutuante */}
        {hasPrice && (
          <div className="absolute bottom-3 right-3">
            <div
              className="animate-[popIn_.6s_ease-out] rounded-full border border-emerald-300/40 bg-white/90 px-3 py-1 text-[13px] font-semibold text-emerald-700 shadow-sm ring-1 ring-emerald-200/70"
              style={{ filter: "drop-shadow(0 8px 24px rgba(16,185,129,.25))" }}
            >
              <span className="inline-flex items-center gap-1">
                <DollarSign className="h-4 w-4" />
                {fmtBRL(product.price as number)}
              </span>
            </div>
          </div>
        )}
      </Link>

      {/* CONTENT */}
      <div className="p-5">
        <div className="mb-1 flex items-start justify-between gap-3">
          <h3 className="text-[1.05rem] font-semibold tracking-tight text-white">
            <Link href={`/produto/${product.id}`} className="hover:text-white/90">
              {product.title}
            </Link>
          </h3>
          <div className="shrink-0 translate-y-[1px]">
            <Stars score={5} />
          </div>
        </div>

        {/* descrição */}
        {product.description && (
          <p className="text-sm leading-relaxed text-white/70 line-clamp-2">{product.description}</p>
        )}

        {/* divisor com gradiente */}
        <div className="my-5 h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        {/* CTAs */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Botão principal (link) */}
          <PrimaryLinkButton href={`/produto/${product.id}`} className="px-4 py-2">
            <Eye className="mr-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            Ver detalhes
          </PrimaryLinkButton>

          {/* Secundário (ação) */}
          <SubtleButton
            onClick={() => onConsult(product)}
            aria-label={`Consultar ${product.title} no WhatsApp`}
            className="px-4 py-2"
          >
            <MessageCircle className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            Consultar
          </SubtleButton>
        </div>
      </div>

      {/* estilos extras locais */}
      <style jsx>{`
        @keyframes popIn {
          0% { transform: translateY(6px) scale(.96); opacity: 0 }
          100% { transform: translateY(0) scale(1); opacity: 1 }
        }
      `}</style>
    </article>
  )
})

/* ==================== Seção de Produtos (backend intacto) ==================== */

export function ProductsSection() {
  const rootRef = useRef<HTMLDivElement>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const acRef = useRef<AbortController | null>(null)

  // spotlight da seção (apenas visual)
  useEffect(() => {
    const el = rootRef.current
    if (!el) return
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect()
      el.style.setProperty("--gx", `${e.clientX - r.left}px`)
      el.style.setProperty("--gy", `${e.clientY - r.top}px`)
    }
    el.addEventListener("mousemove", onMove, { passive: true })
    return () => el.removeEventListener("mousemove", onMove)
  }, [])

  // reveal on scroll
  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const items = Array.from(root.querySelectorAll<HTMLElement>("[data-animate]"))
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && (e.target as HTMLElement).classList.add("is-in")),
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" },
    )
    items.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  // garante visibilidade quando chegam novos cards
  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const newOnes = Array.from(root.querySelectorAll<HTMLElement>("[data-animate].reveal:not(.is-in)"))
    newOnes.forEach((el) => el.classList.add("is-in"))
  }, [products, loading, loadingMore])

  // ====== BACKEND ORIGINAL (inalterado) ======
  const fetchPage = useCallback(
    async (newOffset: number, append = false) => {
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

        if (ac.signal.aborted) return

        setProducts((prev) => (append ? [...prev, ...data] : data))
        setOffset(newOffset)
        setHasMore(data.length === PAGE_SIZE)
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
    [],
  )

  useEffect(() => {
    fetchPage(0, false)
    return () => acRef.current?.abort()
  }, [fetchPage])

  const handleLoadMore = () => {
    if (!hasMore || loadingMore) return
    fetchPage(offset + PAGE_SIZE, true)
  }

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
      {/* fundo escuro elegante */}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,#0f1115_0%,#14161c_35%,#0f1115_100%)]" />
      <div aria-hidden className="pointer-events-none absolute inset-0 animate-[meshDrift_24s_ease-in-out_infinite] bg-[radial-gradient(1000px_700px_at_82%_-10%,rgba(255,255,255,0.06),transparent_60%),radial-gradient(900px_600px_at_12%_110%,rgba(255,255,255,0.05),transparent_55%)]" />
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[.18] [mask-image:radial-gradient(70%_60%_at_50%_45%,#000,transparent_72%)]">
        <div className="h-full w-full animate-[gridMove_26s_linear_infinite] bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:34px_34px]" />
      </div>
      {/* spotlight global */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(420px 280px at var(--gx,50%) var(--gy,50%), rgba(255,255,255,0.06), transparent 70%)", transition: "background 220ms ease" }}
      />

      <div className="relative z-[2] container mx-auto px-4 py-24">
        {/* Header simples */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-sm text-white/80 backdrop-blur">
            <Package className="h-4 w-4" />
            Catálogo
          </div>
          <h2
            className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl"
            style={{ background: "linear-gradient(90deg,#fff,#cbd5e1,#ffffff)", WebkitBackgroundClip: "text", color: "transparent" }}
          >
            Nossos <span className="whitespace-nowrap">Produtos</span>
          </h2>
          <p className="mx-auto mt-3 max-w-3xl text-lg text-white/70 md:text-xl">
            Soluções tecnológicas selecionadas para desempenho e confiabilidade no seu negócio.
          </p>
        </div>

        {/* Conteúdo */}
        <div className="mt-8">
          {loading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <ProductSkeleton key={i} />
              ))}
            </div>
          ) : error ? (
            <div className="py-16 text-center text-white/70">{error}</div>
          ) : products.length === 0 ? (
            <div className="py-16 text-center">
              <div className="relative mx-auto mb-6 h-24 w-24">
                <div className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-r from-fuchsia-500/15 to-indigo-500/15" />
                <Package className="relative mx-auto mt-6 h-12 w-12 text-white/60" />
              </div>
              <h3 className="mb-2 text-2xl font-semibold">Catálogo em breve</h3>
              <p className="mx-auto mb-8 max-w-md text-white/70">
                Estamos preparando novas opções. Fale com a gente para conhecer as soluções disponíveis.
              </p>
              <PrimaryButton
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
              </PrimaryButton>
            </div>
          ) : (
            <>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {products.map((p, i) => (
                  <div key={p.id} data-animate className="reveal" style={{ transitionDelay: `${60 + (i % 9) * 30}ms` }}>
                    <ProductCard product={p} onConsult={(prod)=> {
                      const message = `Olá! Gostaria de saber mais sobre o produto: ${prod.title} (SKU: ${prod.sku}).`
                      const whatsappUrl = getWhatsAppUrl(message)
                      if (typeof window !== "undefined") window.open(whatsappUrl, "_blank", "noopener,noreferrer")
                    }} />
                  </div>
                ))}
              </div>

              {/* Load more */}
              {hasMore && (
                <div className="mt-10 flex justify-center">
                  <FancyLoadMore onClick={() => fetchPage(offset + PAGE_SIZE, true)} loading={loadingMore} />
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

        {/* Highlights enxutos */}
        <div className="mt-16">
          <div className="rounded-xl border border-white/12 bg-white/5 p-6 backdrop-blur md:p-8">
            <ul className="grid gap-6 md:grid-cols-3">
              <li className="flex items-start gap-3">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/15">
                  <Star className="h-5 w-5 text-blue-300" />
                </span>
                <div>
                  <h4 className="mb-1 font-semibold leading-none">Qualidade premium</h4>
                  <p className="text-sm text-white/70">Seleção rigorosa para durabilidade e performance.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/15">
                  <ShoppingCart className="h-5 w-5 text-emerald-300" />
                </span>
                <div>
                  <h4 className="mb-1 font-semibold leading-none">Custo-benefício</h4>
                  <p className="text-sm text-white/70">Preços competitivos com suporte próximo.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/15">
                  <Package className="h-5 w-5 text-violet-300" />
                </span>
                <div>
                  <h4 className="mb-1 font-semibold leading-none">Suporte completo</h4>
                  <p className="text-sm text-white/70">Da escolha à implementação, sem dor de cabeça.</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* keyframes e prefers-reduced-motion */}
      <style jsx global>{`
        .reveal { opacity: 0; transform: translateY(12px); transition: opacity 600ms cubic-bezier(.2,.6,0,1), transform 600ms cubic-bezier(.2,.6,0,1); }
        .reveal.is-in { opacity: 1; transform: translateY(0); }
        @keyframes meshDrift { 0% { transform: translate3d(0,0,0) } 50% { transform: translate3d(0,-10px,0) } 100% { transform: translate3d(0,0,0) } }
        @keyframes gridMove { 0% { transform: translateX(0) translateY(0) } 100% { transform: translateX(-80px) translateY(-80px) } }
        @media (prefers-reduced-motion: reduce) { * { animation: none !important; transition: none !important; } }
      `}</style>
    </section>
  )
}

/* ==================== Botão "Ver mais" com ripple ==================== */
function FancyLoadMore({ onClick, loading }: { onClick: () => void; loading: boolean }) {
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
      {loading ? "Carregando..." : "Ver mais"}
    </button>
  )
}
