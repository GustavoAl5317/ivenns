"use client"

import { useEffect, useRef, useState, useTransition } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Search, Loader2, X, Package, Wrench } from "lucide-react"
import { Button } from "@/components/ui/button"

function qsToString(sp: URLSearchParams) {
  const s = sp.toString()
  return s ? `?${s}` : ""
}

export default function FiltersBar() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const inputRef = useRef<HTMLInputElement | null>(null)

  const [q, setQ] = useState(searchParams.get("q") || "")
  const [category, setCategory] = useState(searchParams.get("category") || "product")
  const [isPending, startTransition] = useTransition()

  // mantém o estado local em sincronia com a URL
  useEffect(() => {
    setQ(searchParams.get("q") || "")
    setCategory(searchParams.get("category") || "product")
  }, [searchParams])

  const replaceWith = (next: { q?: string; category?: string }) => {
    const sp = new URLSearchParams(Array.from(searchParams.entries()))
    if (next.q !== undefined) next.q ? sp.set("q", next.q) : sp.delete("q")
    if (next.category !== undefined) next.category ? sp.set("category", next.category) : sp.delete("category")
    sp.delete("page")
    startTransition(() => router.replace(`${pathname}${qsToString(sp)}`, { scroll: false }))
  }

  // debounce de 350ms
  useEffect(() => {
    const h = setTimeout(() => replaceWith({ q }), 350)
    return () => clearTimeout(h)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q])

  const onCategory = (value: string) => {
    setCategory(value)
    replaceWith({ category: value })
  }

  const clearAll = () => {
    setQ("")
    onCategory("product")
    inputRef.current?.focus()
  }

  const hasQuery = q.trim().length > 0

  // atalho: "/" foca o input
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "/" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const tag = (e.target as HTMLElement)?.tagName?.toLowerCase()
        if (!["input", "textarea", "select"].includes(tag)) {
          e.preventDefault()
          inputRef.current?.focus()
        }
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  return (
    <div
      className="mb-8 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
      role="search"
      aria-label="Filtros do catálogo"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Busca */}
        <div className="w-full lg:max-w-[560px]">
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar por nome, SKU"
              aria-label="Busca de produtos por nome ou SKU"
              className="w-full rounded-xl border border-white/15 bg-white/10 px-11 py-3 pr-20 text-white placeholder-white/60 outline-none transition focus:border-white/30 focus:bg-white/15"
            />
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/60" />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {hasQuery && (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => setQ("")}
                  aria-label="Limpar busca"
                  className="h-8 w-8 rounded-full text-white/80 hover:bg-white/10"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
              {isPending && (
                <div className="h-8 w-8 inline-flex items-center justify-center rounded-full">
                  <Loader2 className="h-4 w-4 animate-spin text-white/70" />
                </div>
              )}
            </div>
          </div>
          <p className="mt-2 text-xs text-white/60">
            Dica: pressione <kbd className="rounded bg-white/10 px-1">/</kbd> para focar a busca.
          </p>
        </div>

        {/* Segmento Produtos/Serviços */}
        <div className="flex items-center gap-3">
          <div
            role="tablist"
            aria-label="Tipo de catálogo"
            className="inline-flex rounded-xl border border-white/15 bg-white/10 p-1 backdrop-blur shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
          >
            <button
              role="tab"
              aria-selected={category === "product"}
              onClick={() => onCategory("product")}
              className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
                category === "product" ? "bg-white/20 text-white ring-1 ring-inset ring-white/25" : "text-white/80 hover:bg-white/10"
              }`}
            >
              <Package className="h-4 w-4" />
              Produtos
            </button>

            <button
              role="tab"
              aria-selected={category === "service"}
              onClick={() => onCategory("service")}
              className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
                category === "service" ? "bg-white/20 text-white ring-1 ring-inset ring-white/25" : "text-white/80 hover:bg-white/10"
              }`}
            >
              <Wrench className="h-4 w-4" />
              Serviços
            </button>
          </div>

          <Button type="button" onClick={clearAll} variant="outline" className="rounded-xl border-white/20 text-white hover:bg-white/10">
            Limpar
          </Button>
        </div>
      </div>
    </div>
  )
}
