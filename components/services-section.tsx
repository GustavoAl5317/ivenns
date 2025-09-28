"use client"

import {
  useEffect,
  useMemo,
  useState,
  type ComponentType,
} from "react"
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
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

/* =========================
   Tipos (inalterados)
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
  limit?: number
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
   Helpers HTML
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

/* =========================
   Seção (LIGHT: branco + gradiente cinza + animações)
========================= */
export default function ServicesSection({
  id = "servicos",
  heading = "Nossos Serviços",
  subheading = "Soluções completas de ponta a ponta",
  ctaLabel = "Fale com um especialista",
  ctaHref = "/#contato",
  limit = 6,
  api = "/api/products?category=service",
}: ServicesSectionProps) {
  const prefersReduced = useReducedMotion()
  const [services, setServices] = useState<Service[] | null>(null)
  const [loading, setLoading] = useState(true)

  const DEBUG = useMemo(() => {
    if (typeof window === "undefined") return false
    return new URLSearchParams(window.location.search).has("debug")
  }, [])

  useEffect(() => {
    let mounted = true
    const ac = new AbortController()
    const delays = [0, 300, 800]
    const t0 = performance.now()

    const load = async () => {
      for (let i = 0; i < delays.length; i++) {
        try {
          if (delays[i]) await new Promise((r) => setTimeout(r, delays[i]))
          const res = await fetch(api, { cache: "no-store", credentials: "same-origin", signal: ac.signal })
          if (!res.ok) throw new Error(`HTTP ${res.status}`)
          const textBody = await res.text()
          let parsed: unknown = []
          if (textBody && textBody.trim().length > 0) parsed = JSON.parse(textBody)
          if (!mounted) return

          const list = Array.isArray(parsed) ? (parsed as Service[]) : []
          const filtered = (list || [])
            .filter((s) => s?.category?.toLowerCase?.() === "service")
            .filter((s) => s?.metadata?.visible !== false)
            .sort((a, b) => (a?.metadata?.order ?? 9999) - (b?.metadata?.order ?? 9999))
            .slice(0, limit)

          setServices(filtered)
          setLoading(false)
          break
        } catch (e: any) {
          if (e?.name === "AbortError") {
            setLoading(false)
            return
          }
        } finally {
          if (i === delays.length - 1 && mounted) setLoading(false)
        }
      }
    }

    load()
    return () => {
      mounted = false
      ac.abort()
    }
  }, [api, limit])

  // Motion presets
  const container: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.06 } },
  }
  const springTransition: Transition = { type: "spring", stiffness: 120, damping: 16, mass: 0.9 }
  const item: Variants = {
    hidden: { opacity: 0, y: prefersReduced ? 0 : 14 },
    show: { opacity: 1, y: 0, transition: springTransition },
  }

  const cards = (services ?? []).map((s, idx) => {
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
  })

  return (
    <section id={id} className="relative overflow-hidden py-20 sm:py-28 text-neutral-900">
      {/* ===== Background LIGHT com animações tech ===== */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {/* base branca → cinza clarinho */}
        <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_0%,#ffffff_0%,#fafafa_55%,#f5f6f8_100%)]" />

        {/* grid técnica animada (cinza sutil) */}
        <div className="absolute inset-0 opacity-70 [mask-image:radial-gradient(70%_60%_at_50%_40%,#000,transparent_72%)]">
          <div className="h-full w-full animate-[gridMove_24s_linear_infinite] bg-[linear-gradient(to_right,rgba(2,6,23,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(2,6,23,0.05)_1px,transparent_1px)] bg-[size:34px_34px]" />
        </div>

        {/* linhas “circuito” claras (são visíveis) */}
        <div className="absolute inset-0 opacity-70">
          <div className="absolute left-[-10%] top-1/3 h-[2px] w-[120%] animate-[dashMove_11s_linear_infinite] bg-[repeating-linear-gradient(90deg,rgba(15,23,42,0)_0,rgba(15,23,42,0)_10px,rgba(2,6,23,.12)_10px,rgba(2,6,23,.12)_18px)]" />
          <div className="absolute left-[-10%] top-2/3 h-[2px] w-[120%] animate-[dashMove_reverse_16s_linear_infinite] bg-[repeating-linear-gradient(90deg,rgba(2,6,23,0)_0,rgba(2,6,23,0)_12px,rgba(2,6,23,.10)_12px,rgba(2,6,23,.10)_20px)]" />
        </div>

        {/* varredura diagonal (brilho branco) */}
        <div className="absolute inset-0 opacity-70 [mask-image:linear-gradient(110deg,transparent,black_30%,black_70%,transparent)]">
          <div className="h-full w-full animate-[sweep_10s_ease-in-out_infinite] bg-[linear-gradient(110deg,rgba(255,255,255,0)_0%,rgba(255,255,255,.55)_50%,rgba(255,255,255,0)_100%)]" />
        </div>

        {/* pontos cintilantes discretos */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <span
              key={i}
              className="absolute h-[3px] w-[3px] rounded-full bg-neutral-400"
              style={{
                top: `${(i * 37) % 100}%`,
                left: `${(i * 53) % 100}%`,
                animation: `twinkle ${(5 + (i % 5))}s ease-in-out ${i * 0.25}s infinite`,
                filter: "drop-shadow(0 0 8px rgba(2,6,23,.25))",
                opacity: 0.55,
              }}
            />
          ))}
        </div>
      </div>

      <div className="container relative z-[1] mx-auto px-6">
        {/* Header */}
        <motion.div variants={container} initial="hidden" animate="show" className="mx-auto mb-14 max-w-3xl text-center">
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

          <motion.div variants={item} className="mt-6">
            <Button
              asChild
              size="lg"
              className="
                group relative overflow-hidden rounded-full
                bg-[linear-gradient(90deg,#0f172a,#1f2937)]
                text-white
                shadow-[0_18px_60px_-24px_rgba(2,6,23,.25)]
                hover:bg-[linear-gradient(90deg,#0b1320,#111827)]
              "
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
          </motion.div>
        </motion.div>

        {/* Grid */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {loading &&
            Array.from({ length: limit }).map((_, i) => (
              <div
                key={i}
                className="h-60 animate-pulse rounded-2xl border border-neutral-200/80 bg-white/80 shadow-[inset_0_1px_0_rgba(255,255,255,.7)]"
              />
            ))}

          {!loading && services && services.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center gap-3 rounded-2xl border border-neutral-200 bg-white/80 p-10 text-center shadow-sm">
              <Package className="h-6 w-6 text-neutral-400" />
              <p className="text-sm text-neutral-600">Nenhum serviço publicado ainda.</p>
            </div>
          )}

          {!loading && services && cards}
        </motion.div>
      </div>

      {/* keyframes / utilidades globais */}
      <style jsx global>{`
        @keyframes gridMove {
          0% { transform: translateX(0) translateY(0) }
          100% { transform: translateX(-80px) translateY(-80px) }
        }
        @keyframes sweep {
          0% { transform: translateX(-30%) }
          50% { transform: translateX(30%) }
          100% { transform: translateX(-30%) }
        }
        @keyframes twinkle {
          0%, 100% { opacity: .15; transform: scale(1) }
          50% { opacity: .7; transform: scale(1.35) }
        }
        @keyframes floatCard {
          0% { transform: translateY(0px) }
          50% { transform: translateY(-6px) }
          100% { transform: translateY(0px) }
        }
        @media (prefers-reduced-motion: reduce) {
          * { animation: none !important; transition: none !important; }
        }
      `}</style>
    </section>
  )
}

/* =========================
   Card (white/grey + “anti-branco” nas fotos + animações)
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
        ${prefersReduced ? "" : "motion-safe:animate-[floatCard_7s_ease-in-out_infinite]"}
      `}
      style={{ transform: "translateZ(0)" }}
    >
      {/* Moldura cinza gradiente no hover */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          padding: 1,
          borderRadius: 16,
          background: "linear-gradient(90deg, rgba(2,6,23,.18), rgba(2,6,23,.10), rgba(2,6,23,.18))",
          mask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
          WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
        }}
      />

      {/* Mídia: “anti-branco” em páginas claras */}
      {imageUrl ? (
        <div className="relative aspect-[16/8] overflow-hidden bg-neutral-200/60">
          {/* bg cinza claro por trás ajuda o multiply a “sumir” com brancos */}
          <img
            src={imageUrl}
            alt="capa do serviço"
            className="
              h-full w-full object-contain
              mix-blend-multiply
              [filter:brightness(0.92)_contrast(1.22)_saturate(1.05)]
            "
          />
          {/* sweep de brilho leve */}
          <div
            className="pointer-events-none absolute inset-0 -translate-x-1/3 opacity-0 transition-[opacity,transform] duration-[900ms] ease-out group-hover:translate-x-1/3 group-hover:opacity-100
            [mask-image:linear-gradient(to_right,transparent,black_40%,transparent_60%)]"
            style={{ background: "linear-gradient(110deg, transparent 35%, rgba(255,255,255,.75) 50%, transparent 65%)" }}
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

        {/* Barra de ações */}
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
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 translate-x-[-120%] bg-gradient-to-r from-transparent via-white/35 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-[120%] [mask-image:linear-gradient(90deg,transparent,white,transparent)]"
              />
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
