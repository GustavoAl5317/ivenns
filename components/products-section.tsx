"use client"

import React from "react"
import Link from "next/link"
import { Package, Eye } from "lucide-react"

type ProductsSectionProps = {
  title?: string
  subtitle?: string
  ctaHref?: string
  ctaLabel?: string
}

export function ProductsSection({
  title = "Nossos Produtos",
  subtitle = "Soluções tecnológicas selecionadas para desempenho e confiabilidade no seu negócio.",
  ctaHref = "/produtos",         // <- é pra cá que o botão vai
  ctaLabel = "Ver produtos",
}: ProductsSectionProps) {
  return (
    <section id="produtos" className="relative overflow-hidden text-white bg-transparent">
      <div className="relative z-[2] container mx-auto px-4 py-24">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-sm text-white/80 backdrop-blur">
            <Package className="h-4 w-4" />
            Catálogo
          </div>

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl text-transparent bg-clip-text bg-[linear-gradient(90deg,#fff,#cbd5e1,#ffffff)]">
            {title}
          </h1>

          {subtitle && (
            <p className="mx-auto mt-3 max-w-3xl text-lg text-white/70 md:text-xl">
              {subtitle}
            </p>
          )}

          {/* CTA (Link puro estilizado) */}
          <div className="mt-8 flex justify-center">
            <Link
              href={ctaHref}
              prefetch={false}
              className="relative inline-flex items-center gap-2 rounded-full px-6 py-3 font-medium
                         text-neutral-900 bg-[linear-gradient(135deg,#ffffff_0%,#f3f4f6_100%)]
                         shadow-[0_8px_30px_-12px_rgba(255,255,255,.35)]
                         hover:shadow-[0_14px_40px_-10px_rgba(255,255,255,.45)]
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 transition-all"
            >
              <Eye className="h-4 w-4" />
              {ctaLabel}
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
