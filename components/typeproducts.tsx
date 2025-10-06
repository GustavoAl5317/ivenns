"use client"

import React from "react"

const MANUFACTURERS: Record<string, string[]> = {
  STORAGE: ["IBM", "HPE", "DELLEMC", "DELL", "FUJITSU", "NETAPP"],
  "SERVIDORES / BLADES": ["IBM", "HPE", "DELLEMC", "DELL", "CISCO", "SUPERMICRO"],
  SWITCH: ["CISCO", "BROCADE", "DELL", "EMULEX", "JUNIPER", "HPE"],
}

export default function ManufacturersSection() {
  return (
    <section className="bg-[#0d0d0f] py-20 text-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Fabricantes Homologados
        </h2>
        <p className="mt-2 text-white/60">
          Ecossistema completo para cada necessidade.
        </p>

        {/* Divisor sutil */}
        <div className="mx-auto my-8 h-px w-24 bg-white/10" />

        <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
          {Object.entries(MANUFACTURERS).map(([category, brands]) => (
            <div key={category} className="flex flex-col items-center">
              <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-white/70">
                {category}
              </p>
              <ul className="flex flex-wrap justify-center gap-2">
                {brands.map((b) => (
                  <li key={b}>
                    <span className="inline-block rounded-full border border-white/15 bg-white/[0.04] px-3 py-1 text-sm text-white/80 hover:bg-white/[0.1] transition">
                      {b}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="mt-10 text-sm text-white/50 max-w-2xl mx-auto">
          Precisa de um modelo específico? Fale com a gente e indicamos a melhor opção em cada fabricante.
        </p>
      </div>
    </section>
  )
}
