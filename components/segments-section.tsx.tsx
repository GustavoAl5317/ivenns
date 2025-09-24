"use client"

import {
  HeartPulse,
  Factory,
  ShoppingCart,
  Truck,
  Building,
  Landmark,
  Tv,
  Hotel,
  Banknote,
  GraduationCap,
  RadioTower,
} from "lucide-react"

const segments = [
  { icon: HeartPulse, label: "Saúde" },
  { icon: Factory, label: "Indústria" },
  { icon: ShoppingCart, label: "Varejo" },
  { icon: Truck, label: "Logística" },
  { icon: Building, label: "Serviços Públicos" },
  { icon: Landmark, label: "Governo" },
  { icon: Tv, label: "Mídia, Cultura e Esporte" },
  { icon: Hotel, label: "Hoteleira" },
  { icon: Banknote, label: "Instituição Financeira" },
  { icon: GraduationCap, label: "Educação" },
  { icon: RadioTower, label: "Operadoras & Provedores de Serviços" },
]

export function SegmentsSection() {
  return (
    <section id="segmentos" className="relative py-24">
      {/* fundo decorativo sutil */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-gradient-to-tr from-indigo-500/15 via-purple-500/15 to-pink-500/15 blur-3xl" />
        <div className="absolute -bottom-24 -right-20 h-72 w-72 rounded-full bg-gradient-to-tr from-fuchsia-500/10 via-sky-500/10 to-violet-500/10 blur-3xl" />
      </div>

      <div className="container relative mx-auto px-4">
        {/* Header */}
        <div className="mb-14 text-center">
          <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-border/50 bg-muted/30 px-4 py-1.5 text-sm text-muted-foreground">
            <span className="inline-block h-2 w-2 rounded-full bg-primary" />
            Segmentos
          </div>

          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Segmentos de <span className="gradient-text">Atuação</span>
          </h2>

          <p className="mx-auto mt-3 max-w-3xl text-lg text-muted-foreground">
            A Ivenns alavanca negócios com tecnologia em diversos setores estratégicos.
          </p>
        </div>

        {/* Grid */}
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {segments.map(({ icon: Icon, label }) => (
            <article
              key={label}
              className="
                group relative overflow-hidden rounded-2xl border border-border/60
                bg-background/60 p-6 text-center backdrop-blur
                transition-all hover:-translate-y-1 hover:shadow-xl
              "
            >
              {/* brilho de borda no hover */}
              <div
                className="
                  pointer-events-none absolute inset-0 rounded-[inherit] opacity-0
                  transition-opacity duration-300 group-hover:opacity-100
                "
              >
                <div className="
                  absolute inset-[-1px] rounded-[inherit]
                  bg-[conic-gradient(from_180deg_at_50%_50%,theme(colors.indigo.500/.35),theme(colors.purple.500/.35),theme(colors.pink.500/.35),theme(colors.indigo.500/.35))]
                  [mask:linear-gradient(#000_0_0)_content-box,linear-gradient(#000_0_0)]
                  [mask-composite:exclude] p-[1px]
                " />
              </div>

              {/* ícone com “aura” */}
              <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent ring-1 ring-border">
                <Icon className="h-8 w-8 text-primary transition-transform duration-300 group-hover:scale-110" />
              </div>

              <h3
                className="
                  text-base font-semibold tracking-tight
                  transition-colors group-hover:text-primary
                "
              >
                {label}
              </h3>

              {/* linha decorativa animada */}
              <div className="mx-auto mt-3 h-px w-10 origin-center scale-x-0 bg-primary/50 transition-transform duration-300 group-hover:scale-x-100" />

              {/* brilho diagonal sutil no hover */}
              <span
                aria-hidden
                className="
                  pointer-events-none absolute -inset-24 translate-x-[-120%]
                  bg-gradient-to-r from-transparent via-white/10 to-transparent
                  opacity-0 transition-all duration-700 ease-out
                  group-hover:translate-x-[120%] group-hover:opacity-100
                "
              />
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
