"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { EmailModal } from "@/components/email-modal"
import { ArrowRight, MessageCircle, Mail } from "lucide-react"

/**
 * HERO SECTION — variante GRADIENT com métricas dinâmicas (SLA/Latency/etc)
 * - Tudo em um único arquivo
 * - Visual profissional com gradientes, spotlight e transições suaves
 */
export default function HeroSection() {
  const rootRef = useRef<HTMLDivElement>(null)
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false)

  // Parallax global + spotlight
  const target = useRef({ x: 0, y: 0 })
  const current = useRef({ x: 0, y: 0 })
  useEffect(() => {
    const el = rootRef.current
    if (!el) return
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect()
      target.current.x = (e.clientX - r.left) / r.width - 0.5
      target.current.y = (e.clientY - r.top) / r.height - 0.5
      el.style.setProperty("--gx", `${e.clientX - r.left}px`)
      el.style.setProperty("--gy", `${e.clientY - r.top}px`)
    }
    const onLeave = () => (target.current = { x: 0, y: 0 })
    el.addEventListener("mousemove", onMove, { passive: true })
    el.addEventListener("mouseleave", onLeave)
    let raf = 0
    const tick = () => {
      current.current.x += (target.current.x - current.current.x) * 0.08
      current.current.y += (target.current.y - current.current.y) * 0.08
      el.style.setProperty("--mx", String(current.current.x))
      el.style.setProperty("--my", String(current.current.y))
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      el.removeEventListener("mousemove", onMove)
      el.removeEventListener("mouseleave", onLeave)
    }
  }, [])

  // Scroll reveal
  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const items = Array.from(root.querySelectorAll<HTMLElement>("[data-animate]"))
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && (e.target as HTMLElement).classList.add("is-in")),
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" },
    )
    items.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  // Métricas com odômetro suave
  const metricsSeed = useMemo(
    () => [
      { label: "Clientes", value: 512, suffix: "+" },
      { label: "Satisfação", value: 98, suffix: "%" },
      { label: "SLA", value: 15, suffix: "m" },
    ],
    [],
  )
  const [metricVals, setMetricVals] = useState(metricsSeed.map(() => 0))
  useEffect(() => {
    let raf = 0
    const start = performance.now()
    const dur = 1100
    const ease = (t: number) => 1 - Math.pow(1 - t, 3)
    const loop = () => {
      const p = Math.min(1, (performance.now() - start) / dur)
      const e = ease(p)
      setMetricVals(metricsSeed.map((m) => Math.floor(m.value * e)))
      if (p < 1) raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [metricsSeed])

  const handleWhatsAppClick = () => {
    window.open(
      "https://wa.me/5511992138829?text=Olá! Gostaria de saber mais sobre seus produtos e serviços.",
      "_blank",
      "noopener,noreferrer",
    )
  }

  return (
    <section
      ref={rootRef}
      className="relative overflow-hidden bg-white text-neutral-900 [--mx:0] [--my:0] [--tilt:6]"
      aria-label="Seção principal com gradiente e métricas"
    >
      <GradientBackground />

      <div className="relative z-[2] mx-auto grid w-full max-w-7xl gap-16 px-6 py-20 lg:grid-cols-2">
        {/* Coluna esquerda — texto e CTAs */}
        <div>
          <div
            data-animate
            className="reveal inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white/70 px-3 py-1 text-xs text-neutral-700 shadow-sm backdrop-blur"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500" />
            Infra • Cloud • Segurança • Enterprise-grade
          </div>

       <h1
  data-animate
  className="reveal mt-6 text-4xl font-semibold tracking-tight md:text-6xl leading-tight md:leading-[1.08]"
  style={{
    background:
      "linear-gradient(90deg,#111 0%,#111 10%,#4338CA 45%,#A855F7 60%,#111 90%,#111 100%)",
    WebkitBackgroundClip: "text",
    color: "transparent",
    transitionDelay: "80ms",
  }}
>
  Tecnologia de <span className="whitespace-nowrap">ponta com suporte</span> de elite.
  <small className="block mt-1 md:mt-2 text-xs md:text-sm font-normal text-neutral-600/80 leading-snug tracking-[0.01em] max-w-[55ch]">
    Servidores • Storage • Robôs de Backup • Switch
  </small>
</h1>



          <p
            data-animate
            className="reveal mt-5 max-w-xl text-lg leading-relaxed text-neutral-600 md:text-xl"
            style={{ transitionDelay: "140ms" }}
          >
           Performance, confiabilidade e inovação para sua infraestrutura rodar sem limites.
          </p>

          <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
            <GradientCTA onClick={handleWhatsAppClick} />
            <Button
              data-animate
              size="lg"
              variant="ghost"
              className="reveal h-12 rounded-full px-6 text-neutral-900 transition-transform hover:-translate-y-0.5 hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
              style={{ transitionDelay: "260ms" }}
              onClick={() => setIsEmailModalOpen(true)}
              aria-label="Enviar e-mail"
            >
              <Mail className="mr-2 h-5 w-5" aria-hidden />
              Enviar e-mail
            </Button>
          </div>

          {/* Métricas com odômetro */}
          <div className="mt-10 grid grid-cols-3 gap-6 text-center">
            {metricsSeed.map((m, i) => (
              <div key={m.label} data-animate className="reveal" style={{ transitionDelay: `${300 + i * 80}ms` }}>
                <div
                  className="text-2xl font-semibold tracking-tight md:text-3xl"
                  style={{
                    background: "linear-gradient(90deg, #1F2937, #4338CA, #A855F7)",
                    WebkitBackgroundClip: "text",
                    color: "transparent",
                  }}
                >
                  <span className="tabular-nums">{metricVals[i]}</span>
                  <small className="ml-0.5 text-base align-top" style={{ color: "currentColor" }}>
                    {m.suffix}
                  </small>
                </div>
                <div className="mt-1 text-xs text-neutral-600">{m.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Coluna direita — Tela de computador com gradiente e palavras rotativas */}
        <div data-animate className="reveal" style={{ transitionDelay: "120ms" }}>
          <GradientComputer />
        </div>
      </div>

      <EmailModal isOpen={isEmailModalOpen} onClose={() => setIsEmailModalOpen(false)} />

      <style jsx global>{`
        .reveal {
          opacity: 0;
          transform: translateY(12px);
          transition: opacity 600ms cubic-bezier(0.2, 0.6, 0, 1), transform 600ms cubic-bezier(0.2, 0.6, 0, 1);
        }
        .reveal.is-in {
          opacity: 1;
          transform: translateY(0);
        }
        @keyframes meshDrift {
          0% { transform: translate3d(0,0,0) scale(1); }
          50% { transform: translate3d(0,-10px,0) scale(1.01); }
          100% { transform: translate3d(0,0,0) scale(1); }
        }
        @keyframes gridMove {
          0% { transform: translateX(0) translateY(0); }
          100% { transform: translateX(-80px) translateY(-80px); }
        }
        @keyframes ticker { 0% { transform: translateY(0) } 100% { transform: translateY(-50%) } }
        @media (prefers-reduced-motion: reduce) {
          * { animation: none !important; transition: none !important; }
        }
      `}</style>
    </section>
  )
}

/* ============================ Background com Gradiente ============================ */
function GradientBackground() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      {/* gradient mesh */}
      <div className="absolute inset-0 animate-[meshDrift_24s_ease-in-out_infinite] bg-[radial-gradient(1000px_700px_at_80%_-10%,rgba(99,102,241,0.18),transparent_60%),radial-gradient(900px_600px_at_12%_110%,rgba(168,85,247,0.18),transparent_55%)]" />
      {/* grid técnica */}
      <div className="absolute inset-0 opacity-35 [mask-image:radial-gradient(72%_60%_at_50%_45%,#000,transparent_72%)]">
        <div className="h-full w-full animate-[gridMove_26s_linear_infinite] bg-[linear-gradient(to_right,rgba(0,0,0,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.06)_1px,transparent_1px)] bg-[size:34px_34px]" />
      </div>
      {/* spotlight global sutil */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(360px 240px at var(--gx,50%) var(--gy,50%), rgba(99,102,241,0.10), transparent 70%)",
          transition: "background 220ms ease",
        }}
      />
    </div>
  )
}

/* ============================ CTA Gradiente ============================ */
function GradientCTA({ onClick }: { onClick: () => void }) {
  const btnRef = useRef<HTMLButtonElement>(null)
  const onMove = (e: React.MouseEvent) => {
    const el = btnRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    el.style.setProperty("--x", `${e.clientX - r.left}px`)
    el.style.setProperty("--y", `${e.clientY - r.top}px`)
  }
  return (
    <Button
      data-animate
      ref={btnRef}
      onMouseMove={onMove}
      size="lg"
      className="reveal relative h-12 rounded-full bg-gradient-to-r from-indigo-600 via-fuchsia-600 to-violet-600 bg-[length:200%_100%] px-7 text-white shadow-lg shadow-fuchsia-500/25 transition-[transform,background-position] hover:-translate-y-0.5 hover:bg-[position:100%_0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-600/40"
      style={{ transitionDelay: "220ms" }}
      onClick={onClick}
      aria-label="Falar no WhatsApp"
    >
      {/* highlight que segue o mouse */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-full opacity-0 transition-opacity duration-200 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(140px 90px at var(--x,50%) var(--y,50%), rgba(255,255,255,.22), transparent 70%)",
        }}
      />
      <MessageCircle className="mr-2 h-5 w-5" aria-hidden />
      Falar no WhatsApp
      <ArrowRight className="ml-2 h-5 w-5" aria-hidden />
    </Button>
  )
}

/* ============================ Tela de Computador (agora com palavras rotativas) ============================ */
function GradientComputer() {
  // Palavras/serviços para rotacionar no painel
  const terms: string[] = useMemo(
    () => [
      "Infraestrutura de Redes Completa",
      "Soluções de TI",
      "Suporte Técnico",
      "Consultoria",
      "Manutenção Preditiva",
      "Manutenção Preventiva",
      "Serviço de Backup",
      "Cabeamento",
      "Instalação",
    ],
    [],
  )

  const [idx, setIdx] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setIdx((i) => (i + 1) % terms.length), 1800)
    return () => clearInterval(id)
  }, [terms.length])

  // Spotlight dentro da tela
  const ref = useRef<HTMLDivElement>(null)
  const [hover, setHover] = useState(false)
  const onMove = (e: React.MouseEvent) => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const x = e.clientX - r.left
    const y = e.clientY - r.top
    el.style.setProperty("--sx", `${x}px`)
    el.style.setProperty("--sy", `${y}px`)
    el.style.setProperty("--nx", ((x / r.width) - 0.5).toString())
    el.style.setProperty("--ny", ((y / r.height) - 0.5).toString())
  }

  return (
    <div className="relative">
      <div aria-hidden className="absolute -inset-x-12 top[90%] h-24 rounded-[48px] bg-fuchsia-500/10 blur-2xl" />

      <div
        ref={ref}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onMouseMove={onMove}
        className="relative mx-auto w-full max-w-2xl rounded-[18px] border border-neutral-200/80 bg-neutral-950 shadow-[0_10px_60px_-20px_rgba(109,40,217,.45)] ring-1 ring-neutral-900/50"
        style={{
          transform:
            "perspective(1200px) rotateX(calc(var(--my)*-1deg*var(--tilt))) rotateY(calc(var(--mx)*1deg*var(--tilt)))",
          background: hover
            ? "radial-gradient(260px 180px at var(--sx,50%) var(--sy,50%), rgba(255,255,255,0.06), transparent 70%)"
            : "transparent",
          transition: "background 220ms ease",
        }}
      >
        {/* molduras degradê */}
        <div className="absolute -inset-0.5 -z-10 rounded-[20px] bg-gradient-to-b from-white to-neutral-200" />
        <div className="absolute -inset-[2px] -z-20 rounded-[22px] bg-gradient-to-b from-neutral-200 to-white opacity-60 blur-[2px]" />

        {/* vidro */}
        <div className="relative overflow-hidden rounded-[14px] border border-neutral-800/70 bg-black">
          {/* scanlines + glint com gradiente */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 transition-all duration-300"
            style={{
              background: "linear-gradient(rgba(255,255,255,.045) 1px, transparent 1px)",
              backgroundSize: "100% 3px",
              mixBlendMode: "soft-light",
              filter: hover ? "saturate(1.05) contrast(1.04) drop-shadow(0 0 18px rgba(99,102,241,.18))" : "none",
              opacity: 0.35,
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_bottom,black,transparent_75%)] will-change-transform"
            style={{
              background: "linear-gradient(110deg, transparent 20%, rgba(255,255,255,0.10) 50%, transparent 80%)",
              transform: "translate(calc(var(--nx,0) * 8px), calc(var(--ny,0) * 8px))",
              transition: "transform 120ms ease",
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background: hover
                ? "radial-gradient(200px 140px at var(--sx,50%) var(--sy,50%), rgba(168,85,247,0.18), transparent 60%)"
                : "transparent",
              transition: "background 200ms ease",
            }}
          />

          {/* HUD topo */}
          <div className="flex items-center justify-between border-b border-neutral-800/60 px-4 py-2 text-[11px] text-neutral-300/90">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(16,185,129,.8)]" />
              <span className="uppercase tracking-wide">Serviços • Especializados</span>
            </div>
            <div className="flex items-center gap-3 text-neutral-400">
              <span>Monit. 24/7</span>
              <span>v2.4</span>
            </div>
          </div>

          {/* Conteúdo da tela */}
          <div className="relative grid gap-4 p-4 md:grid-cols-[1.2fr_.8fr]">
            {/* Slide principal: frase grande rotativa */}
            <div className="relative flex min-h-[260px] items-center justify-center overflow-hidden rounded-lg border border-neutral-800/60 bg-neutral-950/60 p-4">
              {/* grade sutil */}
              <div className="pointer-events-none absolute inset-0 opacity-25">
                <div className="h-full w-full animate-[gridMove_26s_linear_infinite] bg-[linear-gradient(to_right,rgba(255,255,255,0.10)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:28px_28px]" />
              </div>

              <div key={idx} className="relative [animation:termIn_.55s_cubic-bezier(.2,.6,0,1)]">
                <div
                  className="mx-auto text-center text-3xl font-semibold leading-tight md:text-4xl"
                  style={{
                    background: "linear-gradient(90deg,#93C5FD,#6366F1,#A855F7,#EC4899)",
                    WebkitBackgroundClip: "text",
                    color: "transparent",
                    textShadow: "0 0 16px rgba(99,102,241,.15)",
                  }}
                >
                  {terms[idx]}
                </div>

                {/* aro sutil */}
                <div className="pointer-events-none absolute inset-0 rounded-lg ring-1 ring-white/5" />
              </div>
            </div>

            {/* Widgets laterais com gradiente */}
            <div className="grid gap-4">
              <Widget title="Eventos recentes">
                <ul className="max-h-[120px] animate-[ticker_10s_linear_infinite] space-y-2 text-[12px] text-neutral-300/90 [mask-image:linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)]">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <li key={i} className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-indigo-400 to-fuchsia-400 shadow-[0_0_8px_rgba(168,85,247,.8)]" />
                        {new Date().toLocaleTimeString().slice(0, 5)} • Check {i + 1}
                      </span>
                      <span className="text-neutral-500">OK</span>
                    </li>
                  ))}
                </ul>
              </Widget>

              <div className="grid grid-cols-3 gap-3">
                <MiniKPI title="LAT" value="2.1ms" />
                <MiniKPI title="UP" value="99.99%" />
                <MiniKPI title="NODES" value="128" />
              </div>
            </div>
          </div>

          {/* HUD rodapé */}
          <div className="flex items-center justify-between border-t border-neutral-800/60 px-4 py-2 text-[11px] text-neutral-300/70">
            <div className="flex items-center gap-3">
              <Tag>Servidores</Tag>
              <Tag>Switches</Tag>
              <Tag>Roteadores</Tag>
              <Tag>APs</Tag>
            </div>
            <div className="text-neutral-500">Gradient Console • tempo real</div>
          </div>

          <style jsx>{`
            @keyframes termIn {
              0% { opacity: 0; transform: translateY(8px) scale(0.98); }
              100% { opacity: 1; transform: translateY(0) scale(1); }
            }
          `}</style>
        </div>

        {/* base do monitor */}
        <div className="mx-auto h-2 w-40 rounded-b-xl bg-gradient-to-b from-neutral-300 to-neutral-200" />
        <div className="mx-auto h-1 w-56 rounded-b-lg bg-gradient-to-b from-neutral-200 to-neutral-100" />
      </div>
    </div>
  )
}

/* ============================ Subcomponentes da Tela ============================ */
function Widget({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-lg border border-neutral-800/60 bg-neutral-950/60">
      <div
        className="border-b border-neutral-800/60 px-3 py-2 text-[11px] uppercase tracking-wide"
        style={{
          background: "linear-gradient(90deg, rgba(99,102,241,.18), rgba(168,85,247,.18))",
          WebkitBackgroundClip: "text",
          color: "transparent",
        }}
      >
        {title}
      </div>
      <div className="px-3 py-2">{children}</div>
    </div>
  )
}

function MiniKPI({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-md border border-neutral-800/60 bg-neutral-950/60 p-3 text-center">
      <div
        className="text-[10px] tracking-wide"
        style={{ background: "linear-gradient(90deg,#C4B5FD,#F0ABFC)", WebkitBackgroundClip: "text", color: "transparent" }}
      >
        {title}
      </div>
      <div
        className="mt-1 text-sm font-semibold"
        style={{ background: "linear-gradient(90deg,#fff,#E9D5FF)", WebkitBackgroundClip: "text", color: "transparent" }}
      >
        {value}
      </div>
    </div>
  )
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-[10px] text-neutral-200">
      {children}
    </span>
  )
}
