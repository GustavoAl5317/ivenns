// app/produtos/page.tsx
import Image from "next/image"
import Link from "next/link"
import { headers } from "next/headers"
import type { Metadata } from "next"
import {
  Package,
  Eye,
  MessageCircle,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import FiltersBar from "@/components/FiltersBar"

/* ==================== SEO ==================== */
export const metadata: Metadata = {
  title: "Produtos | Ivenns",
  description: "Catálogo de soluções tecnológicas Ivenns. Explore produtos selecionados para desempenho e confiabilidade.",
}

/* ==================== Tipos ==================== */
type Product = {
  id: string
  title: string
  description: string
  image_url: string
  sku: string
  category: string
  price: number | null
}
type PageInfo = { hasMore: boolean; offset: number; returned: number; total?: number; limit: number }

/* ==================== Constantes/Utils ==================== */
const PAGE_SIZE = 12
const fmtBRL = (v: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v)

function slugify(s: string) {
  return (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}
function whatsappUrl(text: string) {
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_PHONE || "5511992138829"
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`
}
function buildQuery(params: Record<string, string | number | undefined>) {
  const sp = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== null && v !== "") sp.set(k, String(v))
  const s = sp.toString()
  return s ? `?${s}` : ""
}

// normalização para busca (sem acento/caixa/espaço)
const norm = (s?: string) =>
  (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "")
// SKU “provável”
const looksLikeSku = (s: string) => /^[a-z0-9][a-z0-9/_-]*$/i.test((s || "").trim())
// detectar “service/services/servico/serviços…”
const isServiceCat = (s?: string) => /servic/.test(norm(s))

/* ==================== Server Fetch ==================== */
async function fetchProducts({
  page,
  q,
  category,
}: {
  page: number
  q?: string
  category?: "product" | "service" | ""
}): Promise<{ items: Product[]; page: PageInfo }> {
  const offset = (page - 1) * PAGE_SIZE
  const params = new URLSearchParams()
  params.set("limit", String(PAGE_SIZE))
  params.set("offset", String(offset))
  params.set("category", category && (category === "product" || category === "service") ? category : "product")
  if (q && q.trim()) params.set("q", q.trim()) // se a API não filtrar, faremos abaixo

  const hdrs = headers()
  const host = hdrs.get("x-forwarded-host") || hdrs.get("host")
  const proto = (hdrs.get("x-forwarded-proto") || "http").split(",")[0]
  const base = process.env.NEXT_PUBLIC_SITE_URL || `${proto}://${host}`

  const res = await fetch(`${base}/api/products?${params.toString()}`, { cache: "no-store" })
  if (!res.ok) throw new Error(`Falha ao carregar produtos (HTTP ${res.status})`)

  const payload = (await res.json()) as { items: Product[]; page: PageInfo } | Product[]
  if (Array.isArray(payload)) {
    return {
      items: payload,
      page: { hasMore: payload.length === PAGE_SIZE, offset, returned: payload.length, limit: PAGE_SIZE },
    }
  }
  return payload
}

/* ==================== UI ==================== */
function EmptyState({ q }: { q?: string }) {
  return (
    <div className="py-24 text-center text-white/80">
      <div className="relative mx-auto mb-6 h-24 w-24">
        <div className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-r from-fuchsia-500/15 to-indigo-500/15" />
        <Package className="relative mx-auto mt-6 h-12 w-12 text-white/60" />
      </div>
      <h3 className="mb-2 text-2xl font-semibold">Nada por aqui… ainda</h3>
      <p className="mx-auto max-w-md text-white/70">
        {q ? <>Não encontramos resultados para “<span className="font-semibold">{q}</span>”.</> : <>Estamos preparando novas opções.</>}
      </p>
      <div className="mt-6 flex items-center justify-center gap-3">
        <Button asChild className="rounded-full">
          <Link href="/contato"><MessageCircle className="mr-2 h-4 w-4" />Falar com especialista</Link>
        </Button>
        <Button variant="outline" asChild className="rounded-full border-white/20 text-white">
          <a href={whatsappUrl("Olá! Gostaria de conhecer as soluções do catálogo.")} target="_blank" rel="noopener noreferrer">
            WhatsApp rápido
          </a>
        </Button>
      </div>
    </div>
  )
}

function ProductCard({ p }: { p: Product }) {
  const href = `/produto/${slugify(p.title)}-${p.sku}`
  const hasImg = !!(p.image_url && /^https?:\/\//i.test(p.image_url))
  const hasPrice = p.price != null && Number(p.price) > 0

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur transition-all hover:-translate-y-1 hover:shadow-[0_26px_80px_-24px_rgba(0,0,0,0.55)]">
      <Link href={href} aria-label={`Abrir detalhes de ${p.title}`} className="relative block aspect-[16/10] overflow-hidden">
        {hasImg ? (
          <Image
            src={p.image_url}
            alt={p.title || "Imagem do produto"}
            fill
            sizes="(max-width:768px) 100vw, (max-width:1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 will-change-transform group-hover:scale-[1.04]"
          />
        ) : (
          <div className="relative flex h-full w-full items-center justify-center">
            <div aria-hidden className="absolute inset-0 bg-[radial-gradient(1200px_400px_at_50%_-10%,rgba(255,255,255,0.10),transparent_60%),linear-gradient(180deg,rgba(0,0,0,0.6),rgba(0,0,0,0.35))]" />
            <div aria-hidden className="absolute inset-0 opacity-[.18] [mask-image:radial-gradient(70%_60%_at_50%_45%,#000,transparent_72%)]">
              <div className="h-full w-full bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:34px_34px]" />
            </div>
            <div className="relative z-[1] flex flex-col items-center text-center">
              <Package className="mb-3 h-10 w-10 text-white/70" />
              <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs text-white/80 backdrop-blur">Imagem em breve</span>
            </div>
            <div className="absolute left-3 top-3 flex gap-2">
              <span className="inline-flex items-center gap-1 rounded-full border border-white/25 bg-white/15 px-2 py-0.5 text-[11px] text-white backdrop-blur">
                <Package className="h-3 w-3" /> {p.category || "Produto"}
              </span>
            </div>
            <div className="absolute right-3 top-3">
              <span className="rounded-full border border-white/25 bg-white/15 px-2 py-0.5 text-[11px] text-white backdrop-blur">{p.sku}</span>
            </div>
          </div>
        )}
      </Link>

      <div className="p-5">
        <h3 className="mb-1 text-[1.05rem] font-semibold tracking-tight text-white">
          <Link href={href} className="hover:text-white/90">{p.title}</Link>
        </h3>

        {p.description && <p className="text-sm leading-relaxed text-white/70 line-clamp-2">{p.description}</p>}

        <div className="my-5 h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        <div className="flex flex-wrap items-center gap-3">
          <Button asChild className="rounded-full px-4 py-2">
            <Link href={href}><Eye className="mr-2 h-4 w-4" />Ver detalhes</Link>
          </Button>

          <Button variant="outline" className="rounded-full border-white/30 bg-white/10 text-white hover:bg-white/15 px-4 py-2" asChild>
            <a href={whatsappUrl(`Olá! Gostaria de saber mais sobre o produto: ${p.title} (SKU: ${p.sku}).`)} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="mr-2 h-4 w-4" />Consultar
            </a>
          </Button>
        </div>

        {hasPrice && (
          <div className="mt-4 inline-flex items-center gap-1 font-semibold text-emerald-400">
            <DollarSign className="h-4 w-4" />
            {fmtBRL(p.price as number)}
          </div>
        )}
      </div>
    </article>
  )
}

function Pagination({
  page,
  total,
  hasMore,
  q,
  category,
}: {
  page: number
  total?: number
  hasMore: boolean
  q?: string
  category?: string
}) {
  const prev = page > 1 ? page - 1 : 1
  const next = hasMore ? page + 1 : page
  const totalPages = typeof total === "number" && total >= 0 ? Math.max(1, Math.ceil(total / PAGE_SIZE)) : undefined

  return (
    <div className="mt-10 flex items-center justify-center gap-2">
      <Button asChild variant="outline" className="rounded-full border-white/20 text-white disabled:opacity-50" disabled={page <= 1}>
        <Link href={`/produtos${buildQuery({ page: prev, q, category })}`}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Anterior
        </Link>
      </Button>

      <div className="px-3 text-sm text-white/80">
        {totalPages ? <>Página <span className="font-semibold">{page}</span> de <span className="font-semibold">{totalPages}</span></> : <>Página <span className="font-semibold">{page}</span></>}
      </div>

      <Button asChild className="rounded-full disabled:opacity-50" disabled={!hasMore && (!totalPages || page >= totalPages)}>
        <Link href={`/produtos${buildQuery({ page: next, q, category })}`}>
          Próxima
          <ChevronRight className="ml-2 h-4 w-4" />
        </Link>
      </Button>
    </div>
  )
}

/* ==================== Página (Server Component) ==================== */
export default async function ProductsPage({
  searchParams,
}: {
  searchParams?: { page?: string; q?: string; category?: "product" | "service" | "" }
}) {
  const page = Math.max(1, Number(searchParams?.page ?? 1) || 1)
  const q = (searchParams?.q || "").trim()
  const category = (searchParams?.category as "product" | "service" | "") || "product"

  // 1) Busca no backend (com q + category na URL, caso o backend filtre)
  let data: { items: Product[]; page: PageInfo }
  try {
    data = await fetchProducts({ page, q, category })
  } catch {
    return (
      <section className="relative overflow-hidden text-white">
        <div className="container mx-auto px-4 py-20">
          <h1 className="mb-2 text-3xl font-bold">Catálogo</h1>
          <p className="mb-8 text-white/70">Houve um problema ao carregar os produtos. Tente novamente.</p>
          <Button asChild className="rounded-full"><Link href="/produtos">Recarregar</Link></Button>
        </div>
      </section>
    )
  }

  const { items: itemsAll, page: pg } = data

  // 2) Filtro LOCAL garantido (mesmo se a API ignorar q/category)
  let filtered = itemsAll
  const qNormalized = norm(q)

  if (qNormalized) {
    const exactSku = looksLikeSku(q) ? filtered.find(p => norm(p.sku) === qNormalized) : undefined
    filtered = exactSku
      ? [exactSku] // SKU exato → 1 item
      : filtered.filter(p => norm(p.title).includes(qNormalized) || norm(p.sku).includes(qNormalized))
  }

  if (category === "service") {
    filtered = filtered.filter(p => isServiceCat(p.category))
  } else {
    filtered = filtered.filter(p => !isServiceCat(p.category))
  }

  // 3) Ordena com imagem primeiro
  const withImg: Product[] = []
  const withoutImg: Product[] = []
  for (const p of filtered) {
    const img = (p.image_url || "").trim()
    if (img && /^https?:\/\//i.test(img)) withImg.push(p)
    else withoutImg.push(p)
  }
  const sorted = [...withImg, ...withoutImg]

  // 4) Contadores e paginação (desliga se estiver buscando)
  const clientFiltering = !!qNormalized
  const totalShown = sorted.length
  const totalAll = clientFiltering ? totalShown : (pg?.total ?? totalShown)
  const hasMore = clientFiltering ? false : !!pg?.hasMore

  return (
    <section className="relative overflow-hidden text-white">
      {/* BG decorativo */}
      <div className="absolute inset-x-0 top-0 -z-10 h-72 bg-[radial-gradient(600px_200px_at_50%_0%,rgba(99,102,241,0.28),transparent_60%)]" />

      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-sm text-white/80 backdrop-blur">
            <Package className="h-4 w-4" />
            Catálogo Ivenns
          </div>
        </div>

        {/* Botão Home, título e contagem */}
        <div className="mb-6 flex flex-col items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl text-transparent bg-clip-text bg-[linear-gradient(90deg,#fff,#cbd5e1,#ffffff)]">
            Produtos
          </h1>
          <div className="text-sm text-white/60">
            {typeof totalAll === "number"
              ? <>Exibindo <span className="text-white">{totalShown}</span> de <span className="text-white">{totalAll}</span> resultados</>
              : <>Exibindo <span className="text-white">{totalShown}</span> resultados</>}
          </div>
          <Button asChild variant="outline" className="rounded-full border-white/20 text-white hover:bg-white/10">
            <Link href="/"><ArrowLeft className="mr-2 h-4 w-4" />Voltar para página principal</Link>
          </Button>
        </div>

        {/* Filtros (client-side lê da URL) */}
        <FiltersBar />

        {/* Grid */}
        {sorted.length === 0 ? (
          <EmptyState q={q} />
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {sorted.map(p => <ProductCard key={p.id} p={p} />)}
            </div>

            {/* Paginação (desligada quando há q) */}
            <Pagination page={Math.max(1, Number(searchParams?.page ?? 1) || 1)} total={pg?.total} hasMore={hasMore} q={q} category={category} />
          </>
        )}
      </div>
    </section>
  )
}
