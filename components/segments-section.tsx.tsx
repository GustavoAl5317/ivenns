"use client"

import { motion, type Variants } from "framer-motion"
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

const container: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.06 } },
}
const item: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 140, damping: 18 } },
}

export function SegmentsSection() {
  return (
    <section id="segmentos" className="relative py-24 text-slate-100">
      {/* ===== FUNDO DARK COM ANIMAÇÕES VISÍVEIS ===== */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* base dark em gradiente */}
        <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_0%,#0f172a_0%,#0b1223_35%,#090f1d_60%,#070c18_100%)]" />

        {/* grade técnica animada */}
        <div className="absolute inset-0 opacity-50 [mask-image:radial-gradient(70%_60%_at_50%_38%,#000,transparent_72%)]">
          <div className="h-full w-full animate-[gridMove_24s_linear_infinite] bg-[linear-gradient(to_right,rgba(148,163,184,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.10)_1px,transparent_1px)] bg-[size:36px_36px]" />
        </div>

        {/* faixas “circuito” (linhas denteadas correndo) */}
        <div className="absolute inset-0 opacity-60">
          <div className="absolute left-[-10%] top-1/3 h-[2px] w-[120%] animate-[dashMove_10s_linear_infinite] bg-[repeating-linear-gradient(90deg,rgba(56,189,248,0)_0,rgba(56,189,248,0)_10px,rgba(56,189,248,.45)_10px,rgba(56,189,248,.45)_18px)]" />
          <div className="absolute left-[-10%] top-2/3 h-[2px] w-[120%] animate-[dashMove_reverse_14s_linear_infinite] bg-[repeating-linear-gradient(90deg,rgba(139,92,246,0)_0,rgba(139,92,246,0)_12px,rgba(139,92,246,.45)_12px,rgba(139,92,246,.45)_20px)]" />
        </div>

        {/* brilho diagonal varrendo (bem presente) */}
        <div className="absolute inset-0 opacity-70 [mask-image:linear-gradient(110deg,transparent,black_30%,black_70%,transparent)]">
          <div className="h-full w-full animate-[sweep_9s_ease-in-out_infinite] bg-[linear-gradient(110deg,rgba(99,102,241,0)_0%,rgba(99,102,241,.16)_45%,rgba(56,189,248,.16)_55%,rgba(56,189,248,0)_100%)]" />
        </div>

        {/* estrelas/pixels cintilantes visíveis */}
        <div className="absolute inset-0">
          {[...Array(24)].map((_, i) => (
            <span
              key={i}
              className="absolute h-[3px] w-[3px] rounded-full"
              style={{
                background: i % 3 === 0 ? "rgba(56,189,248,.7)" : "rgba(99,102,241,.7)",
                top: `${(i * 37) % 100}%`,
                left: `${(i * 53) % 100}%`,
                animation: `twinkle ${(4 + (i % 6))}s ease-in-out ${i * 0.25}s infinite`,
                filter: "drop-shadow(0 0 6px rgba(99,102,241,.8))",
              }}
            />
          ))}
        </div>
      </div>

      <div className="container relative mx-auto px-4">
        {/* Header */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="mb-14 text-center"
        >
          <motion.div
            variants={item}
            className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-slate-700/70 bg-slate-900/70 px-4 py-1.5 text-sm text-slate-300 shadow-[0_0_0_1px_rgba(255,255,255,.02)_inset] backdrop-blur"
          >
            <span className="inline-block h-2 w-2 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 shadow-[0_0_12px_rgba(56,189,248,.7)]" />
            Segmentos
          </motion.div>

          <motion.h2
            variants={item}
            className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl bg-clip-text text-transparent bg-[linear-gradient(90deg,#e2e8f0,#60a5fa_35%,#a78bfa_65%,#e2e8f0)]"
          >
            Segmentos de Atuação
          </motion.h2>

          <motion.p variants={item} className="mx-auto mt-3 max-w-3xl text-lg text-slate-300/90">
            A Ivenns alavanca negócios com tecnologia em diversos setores estratégicos.
          </motion.p>
        </motion.div>

        {/* Grid */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
          className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
        >
          {segments.map(({ icon: Icon, label }) => (
            <motion.article
              key={label}
              variants={item}
              whileHover={{ y: -8 }}
              transition={{ type: "spring", stiffness: 180, damping: 18 }}
              className="
                group relative overflow-hidden rounded-2xl border border-slate-800/90
                bg-slate-900/80 p-6 text-center backdrop-blur
                shadow-[inset_0_1px_0_rgba(255,255,255,.03)]
              "
            >
              {/* moldura gradiente viva */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{
                  padding: 1,
                  borderRadius: 16,
                  background:
                    "linear-gradient(90deg, rgba(56,189,248,.55), rgba(99,102,241,.55))",
                  mask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
                  WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
                  filter: "drop-shadow(0 0 12px rgba(99,102,241,.35))",
                }}
              />

              {/* ícone com pulse-ring e aura neon */}
              <div className="relative mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl ring-1 ring-slate-700/80 bg-gradient-to-br from-indigo-500/15 via-cyan-400/10 to-transparent">
                <span className="absolute inset-0 rounded-2xl ring-2 ring-cyan-400/35 animate-[pulseRing_1.8s_ease-out_infinite]" />
                <Icon className="relative z-[1] h-8 w-8 text-cyan-300 transition-transform duration-300 group-hover:scale-110 drop-shadow-[0_0_12px_rgba(56,189,248,.6)]" />
                <span
                  className="pointer-events-none absolute -inset-7 rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{ background: "radial-gradient(40% 40% at 50% 50%, rgba(56,189,248,.22), transparent 70%)" }}
                />
              </div>

              <h3 className="text-base font-semibold tracking-tight transition-colors group-hover:text-cyan-300">
                {label}
              </h3>

              {/* linha decorativa com brilho transversal */}
              <div className="relative mx-auto mt-3 h-px w-12 overflow-hidden rounded-full bg-gradient-to-r from-cyan-400/70 via-indigo-400/70 to-cyan-400/70">
                <span className="absolute inset-0 translate-x-[-120%] bg-gradient-to-r from-transparent via-white/70 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-[120%]" />
              </div>

              {/* scanline permanente sutil para “tech feel” */}
              <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(180deg,rgba(255,255,255,.04)_0px,rgba(255,255,255,.04)_1px,transparent_1px,transparent_3px)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

              {/* brilho diagonal varrendo o card */}
              <span
                aria-hidden
                className="pointer-events-none absolute -inset-24 translate-x-[-120%] bg-gradient-to-r from-transparent via-white/12 to-transparent opacity-0 transition-all duration-700 ease-out group-hover:translate-x-[120%] group-hover:opacity-100"
              />
            </motion.article>
          ))}
        </motion.div>
      </div>

      {/* ===== KEYFRAMES GLOBAIS (animações visíveis) ===== */}
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
        @keyframes dashMove {
          0% { transform: translateX(0) }
          100% { transform: translateX(20%) }
        }
        @keyframes dashMove_reverse {
          0% { transform: translateX(0) }
          100% { transform: translateX(-20%) }
        }
        @keyframes pulseRing {
          0% { box-shadow: 0 0 0 0 rgba(56,189,248,.35) }
          70% { box-shadow: 0 0 0 16px rgba(56,189,248,0) }
          100% { box-shadow: 0 0 0 0 rgba(56,189,248,0) }
        }
        @keyframes twinkle {
          0%, 100% { opacity: .18; transform: scale(1) }
          50% { opacity: .9; transform: scale(1.45) }
        }
        .animate-[dashMove_reverse_14s_linear_infinite] {
          animation: dashMove_reverse 14s linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          * { animation: none !important; transition: none !important; }
        }
      `}</style>
    </section>
  )
}
