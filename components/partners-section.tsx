"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { Handshake } from "lucide-react"

type Partner = {
  id: string
  name: string
  description: string
  logo_url: string
  website_url?: string | null
  location?: string | null
  partnership_type: string | null
  created_at: string
  display?: "circle" | "normal"
}

/* =========================
 *  LOGOS MANUAIS
 * =========================
 */
const MANUAL_PARTNERS: Array<
  Pick<Partner, "name" | "logo_url" | "website_url" | "display"> & { order?: number }
> = [
  { name: "HP", logo_url: "/images/hp.png", website_url: "https://www.hp.com", order: 1, display: "circle" },
  { name: "IBM", logo_url: "/images/ibm.png", website_url: "https://www.ibm.com", order: 2, display: "normal" },
  { name: "NetApp", logo_url: "/images/net.png", website_url: "https://www.netapp.com", order: 3, display: "normal" },
  
]

/** Tamanho base dos logos */
const DOT = {
  base: "h-20 w-20",       // mobile
  sm: "sm:h-24 sm:w-24",   // >= 640px
  md: "md:h-28 md:w-28",   // >= 768px
}

/** Converte manuais para Partner */
function manualToPartner(items: typeof MANUAL_PARTNERS): Partner[] {
  return items
    .filter(p => p.logo_url && p.name)
    .sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999))
    .map((p, idx) => ({
      id: `manual-${idx}-${p.name}`,
      name: p.name,
      description: "",
      logo_url: p.logo_url,
      website_url: p.website_url ?? null,
      location: null,
      partnership_type: null,
      created_at: new Date().toISOString(),
      display: p.display ?? "circle",
    }))
}

/** Remove duplicatas por nome+logo (prioriza manuais) */
function mergePartners(manual: Partner[], fetched: Partner[]): Partner[] {
  const seen = new Set<string>()
  const out: Partner[] = []
  const push = (p: Partner) => {
    const key =
      (p.name || "").toLowerCase().trim() + "|" + (p.logo_url || "").toLowerCase().trim()
    if (seen.has(key)) return
    seen.add(key)
    out.push(p)
  }
  manual.forEach(push)
  fetched.forEach(push)
  return out
}

export default function PartnersSection() {
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

        // 1) converte os manuais
        const manual = manualToPartner(MANUAL_PARTNERS)

        // 2) busca os do painel
        const res = await fetch("/api/partners", { signal: ac.signal, cache: "no-store" })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = (await res.json()) as Partner[]
        const fetched = Array.isArray(data) ? data : []

        // 3) mescla (manuais têm prioridade e evitam duplicatas)
        const merged = mergePartners(manual, fetched)

        if (mounted.current) setPartners(merged)
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
    <section
      id="parceiros"
      className="
        relative mt-20
        bg-gradient-to-b from-background to-background
        dark:from-[#0A0F1F] dark:to-[#0B1226]
      "
    >
      {/* filete superior sutil */}
      <div
        aria-hidden
        className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent"
      />

      <div className="container mx-auto px-6 py-14">
        {/* título */}
        <div className="text-center mb-10">
          <h3 className="text-lg font-semibold tracking-tight text-foreground">
            Trabalhamos com as principais marcas do mercado
          </h3>
        </div>

        {/* loading */}
        {loading && (
          <div className="flex flex-wrap justify-center items-center gap-16">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className={`${DOT.base} ${DOT.sm} ${DOT.md} rounded-full ring-1 ring-border/50 bg-muted/30 animate-pulse`}
              />
            ))}
          </div>
        )}

        {/* erro */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center gap-3 py-10">
            <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <span className="text-destructive">!</span>
            </div>
            <p className="text-muted-foreground">{error}</p>
          </div>
        )}

        {/* lista */}
        {!loading && !error && partners.length > 0 && (
          <div className="flex flex-wrap justify-center items-center gap-16">
            {partners.map((p) => (
              <a
                key={p.id}
                href={p.website_url || "#"}
                target={p.website_url ? "_blank" : undefined}
                rel={p.website_url ? "noopener noreferrer" : undefined}
                className="text-center group"
                aria-label={p.name}
                title={p.name}
              >
                <div
                  className={`
                    relative flex items-center justify-center
                    ${DOT.base} ${DOT.sm} ${DOT.md}
                    ${p.display === "circle" ? "rounded-full overflow-hidden ring-1 ring-border/60" : ""}
                    transition-transform duration-200 group-hover:-translate-y-0.5
                  `}
                >
                  <Image
                    src={p.logo_url}
                    alt={p.name}
                    fill
                    sizes="(max-width: 768px) 72px, (max-width: 1024px) 96px, 112px"
                    className={p.display === "circle" ? "object-cover" : "object-contain p-2"}
                    priority={false}
                  />
                </div>
                <span className="mt-2 block text-xs text-muted-foreground">{p.name}</span>
              </a>
            ))}
          </div>
        )}

        {/* vazio */}
        {!loading && !error && partners.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-4 py-10">
            <div className="h-20 w-20 rounded-full bg-muted/40 ring-1 ring-border/50 flex items-center justify-center">
              <Handshake className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">Em breve, novos parceiros por aqui.</p>
          </div>
        )}
      </div>

      {/* base de rodapé sutil */}
      <div className="h-6 w-full bg-primary/5 dark:bg-primary/10" />
    </section>
  )
}
