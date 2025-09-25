"use client"

import { useEffect, useMemo, useState } from "react"
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

/* =========================
   Ícones
========================= */
const ICONS: Record<string, React.ComponentType<any>> = {
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
        text-sm text-muted-foreground space-y-2
        [&_ul]:list-disc [&_ul]:pl-5
        [&_ol]:list-decimal [&_ol]:pl-5
        [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-foreground [&_h2]:mt-3
        [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:text-foreground
        [&_a]:underline [&_a]:underline-offset-2
        [&_p]:leading-relaxed
      "
      dangerouslySetInnerHTML={{ __html: safe }}
    />
  )
}

/* =========================
   Seção
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
    const label = `[ServicesSection]`
    const t0 = performance.now()

    const load = async () => {
      for (let i = 0; i < delays.length; i++) {
        const attempt = i + 1
        try {
          if (delays[i]) await new Promise((r) => setTimeout(r, delays[i]))

          const res = await fetch(api, {
            cache: "no-store",
            credentials: "same-origin",
            signal: ac.signal,
          })

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
          if (DEBUG) console.log(`${label} success in ${attempt} after ${(performance.now() - t0).toFixed(1)}ms`)
          break
        } catch (e: any) {
          if (e?.name === "AbortError") {
            setLoading(false)
            return
          }
          if (DEBUG) console.error(`${label} attempt ${attempt}:`, e)
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
  }, [api, limit, DEBUG])

  const container: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
  }

  const springTransition: Transition = { type: "spring", stiffness: 120, damping: 16 }
  const item: Variants = {
    hidden: { opacity: 0, y: prefersReduced ? 0 : 18 },
    show: { opacity: 1, y: 0, transition: springTransition },
  }

  let cards: JSX.Element[] = []
  try {
    cards = (services ?? []).map((s, idx) => {
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
  } catch (e) {
    if (DEBUG) console.error(`[ServicesSection] erro ao montar cards:`, e)
  }

  return (
    <section id={id} className="relative py-16 sm:py-24">
      {/* Fundo animado sutil */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="motion-ok absolute -top-24 -left-24 h-64 w-64 rounded-full blur-3xl opacity-20 bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 [animation:gradient-pan_12s_ease-in-out_infinite]" />
        <div className="motion-ok absolute -bottom-24 -right-20 h-64 w-64 rounded-full blur-3xl opacity-15 bg-gradient-to-tr from-fuchsia-500 via-sky-500 to-violet-500 [animation:gradient-pan_14s_ease-in-out_infinite_reverse]" />
      </div>

      <div className="container relative mx-auto px-6">
        <motion.div variants={container} initial="hidden" animate="show" className="mx-auto max-w-3xl text-center">
          <motion.h2 variants={item} className="text-3xl/tight font-semibold tracking-tight sm:text-4xl">
            {heading}
          </motion.h2>
          <motion.p variants={item} className="mt-2 text-muted-foreground">
            {subheading}
          </motion.p>

          <motion.div variants={item} className="mt-6">
            <Button asChild size="lg" className="group relative overflow-hidden bg-primary text-primary-foreground">
              <a href={ctaHref}>
                <span className="relative z-10 flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  {ctaLabel}
                </span>
                <span className="pointer-events-none absolute inset-0 translate-x-[-120%] group-hover:translate-x-[120%] transition-transform duration-700 ease-out [mask-image:linear-gradient(90deg,transparent,white,transparent)] bg-gradient-to-r from-transparent via-white/30 to-transparent" />
              </a>
            </Button>
          </motion.div>
        </motion.div>

        {/* Grid com cartões de mesma altura */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="mt-12 grid grid-cols-1 gap-6 sm:mt-14 sm:grid-cols-2 lg:grid-cols-3"
        >
          {loading && Array.from({ length: limit }).map((_, i) => (
            <div key={i} className="h-60 rounded-xl border bg-muted/40 animate-pulse" />
          ))}

          {!loading && services && services.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center gap-3 rounded-xl border p-10 text-center">
              <Package className="h-6 w-6 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Nenhum serviço publicado ainda.</p>
            </div>
          )}

          {!loading && services && cards}
        </motion.div>
      </div>
    </section>
  )
}

/* =========================
   Card (altura uniforme + botão alinhado)
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
  Icon: any
  title: string
  desc: string
  bullets: string[]
  href: string
  imageUrl?: string
  highlight?: boolean
  price?: number | null
}) {
  const hasHtml = isProbablyHtml(desc)

  return (
    <Card className="group relative h-full flex flex-col overflow-hidden border-border/60 bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/70">
      {/* imagem um pouco mais baixa para reduzir o card */}
      {imageUrl ? (
        <div className="relative aspect-[16/8] overflow-hidden">
          <img src={imageUrl} alt="capa do serviço" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-background/20 to-transparent" />
        </div>
      ) : null}

      {/* brilho da borda no hover */}
      <div className="pointer-events-none absolute inset-0 rounded-[calc(var(--radius)_+_6px)] opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="absolute inset-[-1px] rounded-[inherit] bg-[conic-gradient(from_180deg_at_50%_50%,theme(colors.indigo.500/.35),theme(colors.purple.500/.35),theme(colors.pink.500/.35),theme(colors.indigo.500/.35))] [mask:linear-gradient(#000_0_0)_content-box,linear-gradient(#000_0_0)] [mask-composite:exclude] p-[1px]" />
      </div>

      <CardHeader className="relative pb-2">
        <div className="mb-2 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white shadow-sm ring-1 ring-white/10">
          <Icon className="h-5 w-5" />
        </div>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>

      {/* Conteúdo vira coluna flex: o botão fica alinhado no rodapé via mt-auto */}
      <CardContent className="flex flex-1 flex-col gap-4 pt-0 pb-5">
        <div className="text-sm text-muted-foreground">
          {hasHtml ? <HtmlDescription html={desc} /> : <p className="leading-relaxed">{desc}</p>}
        </div>

        {bullets.length > 0 && (
          <ul className="space-y-2 text-sm">
            {bullets.map((b) => (
              <li key={b} className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span className="text-foreground/90">{b}</span>
              </li>
            ))}
          </ul>
        )}

        {/* spacer automático */}
        <div className="mt-auto" />

        {/* barra de ações (sempre no mesmo lugar) */}
        <div className="flex items-center gap-3">
          <Button
            asChild
            variant={highlight ? "default" : "secondary"}
            className={`group flex-1 ${highlight ? "" : "bg-green-600 hover:bg-green-700 text-white border-0"}`}
          >
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Abrir conversa no WhatsApp"
              className="inline-flex items-center justify-center gap-2"
            >
              <MessageCircle className="h-4 w-4" />
              Consultar
            </a>
          </Button>

          {typeof price === "number" && (
            <span className="rounded-md border px-3 py-1 text-xs text-muted-foreground">R$ {price.toFixed(2)}</span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
