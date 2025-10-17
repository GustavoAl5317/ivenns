// SERVICES-SECTION (traz TODOS os serviços, com paginação)
"use client"

import { useEffect, useMemo, useState, type ComponentType } from "react"
import { motion, useReducedMotion, type Variants, type Transition } from "framer-motion"
import {
  Check,
  Cloud,
  Headphones,
  Shield,
  Workflow,
  Layers,
  Rocket,
  Sparkles,
  Package,
  MessageCircle,
  MapPin,
  Clock,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

/* =========================
   Tipos
========================= */
export interface Service {
  id: string
  title: string
  description: string
  image_url: string
  sku: string
  category: string
  price: number | null
  created_at: string
  metadata?: {
    href?: string
    bullets?: string[]
    visible?: boolean
    highlight?: boolean
    order?: number
    icon?: string
  } | null
}
type PageInfo = { hasMore: boolean; offset: number; returned: number; total?: number; limit: number }

/* =========================
   Ícones
========================= */
const ICONS: Record<string, ComponentType<any>> = {
  cloud: Cloud,
  headphones: Headphones,
  shield: Shield,
  workflow: Workflow,
  layers: Layers,
  rocket: Rocket,
}
function pickIcon(name?: string) {
  if (!name) return Cloud
  return ICONS[name.toLowerCase()] ?? Cloud
}

/* =========================
   Props
========================= */
type ServicesSectionProps = {
  id?: string
  heading?: string
  subheading?: string
  ctaLabel?: string
  ctaHref?: string
  /** Limite de itens apenas para exibição; 0/undefined = mostrar todos */
  showLimit?: number
  /** Endpoint base. Pode trazer array ou { items, page }. */
  api?: string
}

/* =========================
   WhatsApp
========================= */
const WHATSAPP_PHONE = process.env.NEXT_PUBLIC_WHATSAPP_PHONE || "5511992138829"
function buildWhatsAppLink(serviceTitle: string) {
  const msg = encodeURIComponent(`Olá! Gostaria de consultar sobre: ${serviceTitle}`)
  return `https://wa.me/${WHATSAPP_PHONE}?text=${msg}`
}

/* =========================
   Helpers
========================= */
function isProbablyHtml(s?: string) {
  if (!s) return false
  return /<\/?[a-z][\s\S]*>/i.test(s)
}
function basicSanitize(html: string) {
  return html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/\son\w+="[^"]*"/gi, "")
    .replace(/\son\w+='[^']*'/gi, "")
    .replace(/javascript:\s*/gi, "")
}
function HtmlDescription({ html }: { html: string }) {
  const safe = basicSanitize(html)
  return (
    <div
      className="
        text-sm text-neutral-700 space-y-2
        [&_ul]:list-disc [&_ul]:pl-5
        [&_ol]:list-decimal [&_ol]:pl-5
        [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-neutral-900 [&_h2]:mt-3
        [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:text-neutral-900
        [&_a]:underline [&_a]:underline-offset-2
        [&_p]:leading-relaxed
      "
      dangerouslySetInnerHTML={{ __html: safe }}
    />
  )
}
const norm = (s?: string) =>
  (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
const isServiceCat = (s?: string) => /servic/.test(norm(s)) // service/services/servico/servicos…

/** Faz fetch de TODAS as páginas de um endpoint que aceita limit/offset e pode responder {items,page} */
async function fetchAllServices(apiBase: string, perPage = 200): Promise<Service[]> {
  const out: Service[] = []
  let offset = 0
  let hasMore = true

  // garante limit/offset na URL
  const base = new URL(apiBase, typeof window !== "undefined" ? window.location.origin : "http://localhost")
  // removemos limit/offset existentes para controlar aqui
  base.searchParams.delete("limit")
  base.searchParams.delete("offset")

  while (hasMore) {
    const url = new URL(base.toString())
    url.searchParams.set("limit", String(perPage))
    url.searchParams.set("offset", String(offset))

    const res = await fetch(url.toString(), { cache: "no-store", credentials: "same-origin" })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)

    const textBody = await res.text()
    const parsed = textBody && textBody.trim() ? JSON.parse(textBody) : []
    const items = Array.isArray(parsed) ? parsed : (parsed?.items ?? [])
    const page: PageInfo | undefined = Array.isArray(parsed) ? undefined : parsed?.page

    const batch = (items ?? []) as Service[]
    out.push(...batch)

    // critério de parada
    if (page) {
      hasMore = !!page.hasMore
      offset = page.offset + (page.returned ?? batch.length)
    } else {
      // quando API não oferece page.hasMore, paramos quando veio menos que o perPage
      hasMore = batch.length === perPage
      offset += batch.length
    }

    if (!hasMore) break
  }

  return out
}

/* =========================
   Itens adicionais (opcional)
========================= */
const EXTRA_SERVICES: Array<{ icon: ComponentType<any>; title: string; desc: string }> = [
  { icon: MapPin, title: "Atendimento no local", desc: "Enviamos um técnico até você para executar o atendimento." },
  { icon: Headphones, title: "Atendimento remoto", desc: "Engenheiros especializados para diagnóstico e resolução remota." },
  { icon: Clock, title: "Contratos 24x7 em todo o Brasil", desc: "Cobertura nacional com SLA contínuo." },
]

/* =========================
   Seção
========================= */
export default function ServicesSection({
  id = "servicos",
  heading = "Nossos Serviços",
  subheading = "Soluções completas de ponta a ponta",
  ctaLabel = "Fale com um especialista",
  ctaHref = "/#contato",
  showLimit, // SEM limite por padrão
  api = "/api/products?category=service",
}: ServicesSectionProps) {
  const prefersReduced = useReducedMotion()
  const [services, setServices] = useState<Service[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const DEBUG = useMemo(() => {
    if (typeof window === "undefined") return false
    return new URLSearchParams(window.location.search).has("debug")
  }, [])

  useEffect(() => {
    let mounted = true
    const ac = new AbortController()
    ;(async () => {
      try {
        setError(null)
        setLoading(true)

        const all = await fetchAllServices(api, 200) // busca TUDO em páginas de 200
        if (!mounted) return

        // se a URL já tem category=service, NÃO filtramos de novo;
        // senão, filtramos por categoria reconhecida como “serviço”
        const apiHasServiceCategory = /[?&]category=service\b/i.test(api)
        const onlyServices = apiHasServiceCategory ? all : all.filter((s) => isServiceCat(s.category))

        // respeita metadata.visible !== false
        const visible = onlyServices.filter((s) => (s?.metadata?.visible ?? true) !== false)

        // ordena por metadata.order (quando informado)
        const ordered = visible.sort(
          (a, b) => (a?.metadata?.order ?? 9999) - (b?.metadata?.order ?? 9999)
        )

        // aplica limite só de EXIBIÇÃO se showLimit vier > 0
        const finalList = showLimit && showLimit > 0 ? ordered.slice(0, showLimit) : ordered

        setServices(finalList)
        setLoading(false)

        if (DEBUG) {
          // eslint-disable-next-line no-console
          console.log({ totalAll: all.length, afterFilter: onlyServices.length, visible: visible.length, final: finalList.length })
        }
      } catch (e: any) {
        if (e?.name === "AbortError") return
        if (!mounted) return
        setError(e?.message || "Falha ao carregar serviços")
        setLoading(false)
      }
    })()

    return () => {
      mounted = false
      ac.abort()
    }
  }, [api, showLimit, DEBUG])

  // Motion presets
  const container: Variants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.06 } } }
  const springTransition: Transition = { type: "spring", stiffness: 120, damping: 16, mass: 0.9 }
  const item: Variants = { hidden: { opacity: 0, y: prefersReduced ? 0 : 14 }, show: { opacity: 1, y: 0, transition: springTransition } }

  return (
    <section id={id} className="relative overflow-hidden py-20 sm:py-28 text-neutral-900">
      {/* BG */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_0%,#ffffff_0%,#fafafa_55%,#f5f6f8_100%)]" />
        <div className="absolute inset-0 opacity-70 [mask-image:radial-gradient(70%_60%_at_50%_40%,#000,transparent_72%)]">
          <div className="h-full w-full animate-[gridMove_24s_linear_infinite] bg-[linear-gradient(to_right,rgba(2,6,23,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(2,6,23,0.05)_1px,transparent_1px)] bg-[size:34px_34px]" />
        </div>
      </div>

      <div className="container relative z-[1] mx-auto px-6">
        {/* Header */}
        <motion.div variants={container} initial="hidden" animate="show" className="mx-auto mb-12 max-w-3xl text-center">
          <motion.div
            variants={item}
            className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white/80 px-4 py-1.5 text-sm text-neutral-700 shadow-sm backdrop-blur"
          >
            <Sparkles className="h-4 w-4" />
            Serviços
          </motion.div>

          <motion.h2
            variants={item}
            className="text-3xl/tight font-semibold tracking-tight sm:text-4xl bg-clip-text text-transparent bg-[linear-gradient(90deg,#111827,#475569_35%,#6b7280_65%,#111827)]"
          >
            {heading}
          </motion.h2>

          <motion.p variants={item} className="mt-2 text-neutral-600">
            {subheading}
          </motion.p>
        </motion.div>

        {/* Grid */}
        <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {loading &&
            Array.from({ length: Math.max(6, showLimit || 12) }).map((_, i) => (
              <div key={i} className="h-60 animate-pulse rounded-2xl border border-neutral-200/80 bg-white/80 shadow-[inset_0_1px_0_rgba(255,255,255,.7)]" />
            ))}

          {!loading && error && (
            <div className="col-span-full flex flex-col items-center justify-center gap-3 rounded-2xl border border-neutral-200 bg-white/80 p-10 text-center shadow-sm">
              <Package className="h-6 w-6 text-neutral-400" />
              <p className="text-sm text-neutral-600">Não foi possível carregar os serviços.</p>
              <p className="text-xs text-neutral-500">Detalhes: {error}</p>
            </div>
          )}

          {!loading && !error && services && services.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center gap-3 rounded-2xl border border-neutral-200 bg-white/80 p-10 text-center shadow-sm">
              <Package className="h-6 w-6 text-neutral-400" />
              <p className="text-sm text-neutral-600">Nenhum serviço publicado ainda.</p>
            </div>
          )}

          {!loading && !error && services && services.length > 0 && services.map((s, idx) => {
            const Icon = pickIcon(s.metadata?.icon)
            const waHref = buildWhatsAppLink(s.title)
            return (
              <motion.div key={s.id ?? `s-${idx}`} variants={item} className="h-full">
                <ServiceCard
                  Icon={Icon}
                  title={s.title}
                  desc={s.description}
                  bullets={s.metadata?.bullets ?? []}
                  href={waHref}
                  imageUrl={s.image_url}
                  highlight={s.metadata?.highlight}
                  price={s.price}
                />
              </motion.div>
            )
          })}
        </motion.div>

        {/* CTA */}
        <div className="mt-10 text-center">
          <Button
            asChild
            size="lg"
            className="group relative overflow-hidden rounded-full bg-[linear-gradient(90deg,#0f172a,#1f2937)] text-white shadow-[0_18px_60px_-24px_rgba(2,6,23,.25)] hover:bg-[linear-gradient(90deg,#0b1320,#111827)]"
          >
            <a href={ctaHref}>
              <span className="relative z-10 inline-flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                {ctaLabel}
              </span>
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 translate-x-[-120%] bg-gradient-to-r from-transparent via-white/35 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-[120%] [mask-image:linear-gradient(90deg,transparent,white,transparent)]"
              />
            </a>
          </Button>
        </div>
      </div>

      <style jsx global>{`
        @keyframes gridMove { 0% { transform: translateX(0) translateY(0) } 100% { transform: translateX(-80px) translateY(-80px) } }
        @media (prefers-reduced-motion: reduce) { * { animation: none !important; transition: none !important; } }
      `}</style>
    </section>
  )
}

/* =========================
   Card
========================= */
function ServiceCard({
  Icon,
  title,
  desc,
  bullets,
  href,
  imageUrl,
  highlight,
  price,
}: {
  Icon: ComponentType<any>
  title: string
  desc: string
  bullets: string[]
  href: string
  imageUrl?: string
  highlight?: boolean
  price?: number | null
}) {
  const prefersReduced = useReducedMotion()
  const hasHtml = isProbablyHtml(desc)

  return (
    <Card
      className={`
        group relative flex h-full flex-col overflow-hidden rounded-2xl
        border ${highlight ? "border-neutral-300" : "border-neutral-200/90"}
        bg-white/90 shadow-[inset_0_1px_0_rgba(255,255,255,.75)]
        backdrop-blur supports-[backdrop-filter]:bg-white/80
        transition-all
        ${prefersReduced ? "" : "hover:shadow-[0_24px_60px_-24px_rgba(2,6,23,.18)]"}
      `}
      style={{ transform: "translateZ(0)" }}
    >
      {imageUrl ? (
        <div className="relative aspect-[16/8] overflow-hidden bg-neutral-200/60">
          <img
            src={imageUrl}
            alt="capa do serviço"
            className="h-full w-full object-contain mix-blend-multiply [filter:brightness(0.92)_contrast(1.22)_saturate(1.05)]"
          />
        </div>
      ) : null}

      <CardHeader className="relative pb-2">
        <div className="mb-2 inline-flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-sm ring-1 ring-black/5 bg-[linear-gradient(135deg,#111827,#475569)]">
          <Icon className="h-5 w-5" />
        </div>

        <CardTitle
          className={`text-lg ${highlight ? "bg-clip-text text-transparent bg-[linear-gradient(90deg,#111827,#475569_35%,#6b7280_65%,#111827)]" : "text-neutral-900"}`}
        >
          {title}
        </CardTitle>

        {highlight && (
          <span className="absolute right-3 top-3 rounded-full border border-neutral-300 bg-white/80 px-2 py-0.5 text-[11px] font-medium text-neutral-700 shadow-sm">
            Destaque
          </span>
        )}
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-4 pt-0 pb-5">
        <div className="text-sm text-neutral-700">
          {hasHtml ? <HtmlDescription html={desc} /> : <p className="leading-relaxed">{desc}</p>}
        </div>

        {bullets.length > 0 && (
          <ul className="space-y-2 text-sm">
            {bullets.map((b) => (
              <li key={b} className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-neutral-900" />
                <span className="text-neutral-800">{b}</span>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-auto" />

        <div className="flex items-center gap-3">
          <Button
            asChild
            size="sm"
            className="
              group relative flex-1 overflow-hidden rounded-full
              bg-[linear-gradient(90deg,#111827,#1f2937)]
              text-white
              shadow-[0_10px_30px_-12px_rgba(2,6,23,.24)]
              hover:bg-[linear-gradient(90deg,#0f172a,#111827)]
            "
          >
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Abrir conversa no WhatsApp"
              className="inline-flex w-full items-center justify-center gap-2"
            >
              <MessageCircle className="h-4 w-4" />
              Consultar
            </a>
          </Button>

          {typeof price === "number" && (
            <span className="rounded-full border border-neutral-300 bg-white/85 px-3 py-1 text-xs font-medium text-neutral-700 shadow-sm">
              R$ {price.toFixed(2)}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
