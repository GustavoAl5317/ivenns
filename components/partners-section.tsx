"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Handshake, ExternalLink, MapPin, Globe, Users, Award } from "lucide-react"

type Partner = {
  id: string
  name: string
  description: string
  logo_url: string
  website_url?: string | null
  location?: string | null
  partnership_type: string | null
  created_at: string
}

const TYPE_ICON: Record<string, any> = {
  tecnologia: Globe,
  distribuidor: Users,
  certificado: Award,
}

const TYPE_TONE: Record<
  string,
  { bg: string; fg: string; ring: string; subtle: string }
> = {
  tecnologia:   { bg: "bg-blue-50/50",      fg: "text-blue-700",      ring: "ring-blue-200/60",      subtle: "from-blue-500/10 to-blue-400/5" },
  distribuidor: { bg: "bg-emerald-50/50",   fg: "text-emerald-700",   ring: "ring-emerald-200/60",   subtle: "from-emerald-500/10 to-emerald-400/5" },
  certificado:  { bg: "bg-violet-50/50",    fg: "text-violet-700",    ring: "ring-violet-200/60",    subtle: "from-violet-500/10 to-violet-400/5" },
  default:      { bg: "bg-neutral-50/50",   fg: "text-neutral-700",   ring: "ring-neutral-200/60",   subtle: "from-neutral-500/10 to-neutral-400/5" },
}

function getTone(type?: string | null) {
  if (!type) return TYPE_TONE.default
  return TYPE_TONE[type.toLowerCase()] ?? TYPE_TONE.default
}
function getIcon(type?: string | null) {
  if (!type) return Handshake
  return TYPE_ICON[type.toLowerCase()] ?? Handshake
}

export function PartnersSection() {
  const [partners, setPartners] = useState<Partner[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const mounted = useRef(true)

  useEffect(() => {
    mounted.current = true
    const ac = new AbortController()

    ;(async () => {
      try {
        setLoading(true)
        const res = await fetch("/api/partners", { signal: ac.signal })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = (await res.json()) as Partner[]
        if (mounted.current) setPartners(Array.isArray(data) ? data : [])
      } catch (e: any) {
        if (!ac.signal.aborted) {
          console.error("Error fetching partners:", e)
          if (mounted.current) setError("Não foi possível carregar os parceiros.")
        }
      } finally {
        if (mounted.current) setLoading(false)
      }
    })()

    return () => {
      mounted.current = false
      ac.abort()
    }
  }, [])

  return (
    <section id="parceiros" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Título */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-3 rounded-full border px-4 py-1.5 text-sm text-muted-foreground mb-4 bg-muted/30">
            <Handshake className="h-4 w-4" />
            Parceiros de confiança
          </div>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Nossos <span className="gradient-text">Parceiros</span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mt-3">
            Trabalhamos ao lado de marcas que elevam o padrão de qualidade para entregar soluções completas.
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="overflow-hidden border-border/50">
                <div className="aspect-video bg-muted/40 animate-pulse" />
                <CardHeader className="space-y-2">
                  <div className="h-5 w-2/3 bg-muted/50 animate-pulse rounded" />
                  <div className="h-4 w-1/3 bg-muted/40 animate-pulse rounded" />
                  <div className="h-14 w-full bg-muted/30 animate-pulse rounded" />
                </CardHeader>
                <CardContent>
                  <div className="h-9 w-full bg-muted/30 animate-pulse rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Erro */}
        {!loading && error && (
          <div className="text-center py-16">
            <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <span className="text-destructive">!</span>
            </div>
            <p className="text-muted-foreground">{error}</p>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && partners.length === 0 && (
          <div className="text-center py-16">
            <div className="relative w-24 h-24 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400/15 to-violet-400/15 animate-pulse" />
              <Handshake className="relative w-12 h-12 text-muted-foreground mx-auto mt-6" />
            </div>
            <h3 className="text-2xl font-semibold mb-2">Parcerias em construção</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Em breve, novos parceiros estratégicos aparecerão aqui. Fique de olho!
            </p>
          </div>
        )}

        {/* Lista */}
        {!loading && !error && partners.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {partners.map((p) => {
              const tone = getTone(p.partnership_type)
              const Icon = getIcon(p.partnership_type)

              return (
                <Card
                  key={p.id}
                  className="group overflow-hidden border border-border/50 bg-background/60 backdrop-blur-sm transition-all hover:shadow-lg hover:-translate-y-0.5"
                >
                  {/* Logo */}
                  <div
                    className={`relative aspect-video overflow-hidden ring-1 ${tone.ring} rounded-b-none`}
                  >
                    {p.logo_url ? (
                      <Image
                        src={p.logo_url}
                        alt={p.name}
                        fill
                        sizes="(max-width: 768px) 50vw, 33vw"
                        className="object-contain p-6 transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Icon className="h-14 w-14 text-muted-foreground" />
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-t-lg
                                    from-transparent via-transparent to-transparent" />

                    <div className="absolute top-3 right-3">
                      <Badge className={`border ${tone.bg} ${tone.fg} backdrop-blur`}>
                        {p.partnership_type ?? "Parceria"}
                      </Badge>
                    </div>
                  </div>

                  {/* Conteúdo */}
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xl tracking-tight group-hover:text-primary transition-colors">
                      {p.name}
                    </CardTitle>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {p.location && (
                        <>
                          <MapPin className="h-4 w-4" />
                          <span>{p.location}</span>
                        </>
                      )}
                    </div>

                    {p.description && (
                      <CardDescription className="mt-2 text-sm leading-relaxed line-clamp-3">
                        {p.description}
                      </CardDescription>
                    )}
                  </CardHeader>

                  <CardContent className="pt-0">
                    {p.website_url && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => window.open(p.website_url as string, "_blank", "noopener,noreferrer")}
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Visitar site
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* Benefícios / CTA secundário */}
        <div className="mt-16">
          <div className="rounded-2xl border border-border/50 bg-gradient-to-r from-primary/5 via-primary/5 to-transparent p-8">
            <h3 className="text-2xl font-bold text-center mb-8">Por que firmamos parcerias?</h3>
            <div className="grid gap-6 md:grid-cols-3">
              <Benefit
                iconBg="bg-blue-500/15"
                icon={<Award className="h-6 w-6 text-blue-600" />}
                title="Qualidade Garantida"
                desc="Trabalhamos com fabricantes e distribuidores certificados para manter o padrão de excelência."
              />
              <Benefit
                iconBg="bg-emerald-500/15"
                icon={<Globe className="h-6 w-6 text-emerald-600" />}
                title="Tecnologia de Ponta"
                desc="Acesso às inovações mais recentes para entregar soluções modernas e eficientes."
              />
              <Benefit
                iconBg="bg-violet-500/15"
                icon={<Users className="h-6 w-6 text-violet-600" />}
                title="Suporte Especializado"
                desc="Equipe com certificações e treinamentos contínuos para te acompanhar em cada etapa."
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Benefit({
  icon,
  iconBg,
  title,
  desc,
}: {
  icon: React.ReactNode
  iconBg: string
  title: string
  desc: string
}) {
  return (
    <div className="text-center">
      <div className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full ${iconBg}`}>
        {icon}
      </div>
      <h4 className="font-semibold mb-1">{title}</h4>
      <p className="text-sm text-muted-foreground">{desc}</p>
    </div>
  )
}
