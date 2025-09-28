"use client"

import { useMemo, type MouseEvent as ReactMouseEvent, type TouchEvent as ReactTouchEvent } from "react"
import { motion, useReducedMotion, type Variants } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { CheckCircle, Users, Zap, Shield, Clock, Award, type LucideIcon } from "lucide-react"

// =========================
// Dados
// =========================
const benefits: Array<{ icon: LucideIcon; title: string; description: string }> = [
  { icon: CheckCircle, title: "Qualidade Garantida", description: "Todos os nossos produtos e serviços passam por rigoroso controle de qualidade." },
  { icon: Users, title: "Atendimento Personalizado", description: "Cada cliente recebe atenção individual e soluções customizadas para suas necessidades." },
  { icon: Zap, title: "Resultados Rápidos", description: "Implementação ágil e resultados visíveis em pouco tempo de parceria." },
  { icon: Shield, title: "Segurança Total", description: "Seus dados e informações estão protegidos com os mais altos padrões de segurança." },
  { icon: Clock, title: "Suporte 24/7", description: "Nossa equipe está sempre disponível para ajudar quando você precisar." },
  { icon: Award, title: "Experiência Comprovada", description: "Anos de experiência no mercado com centenas de projetos bem-sucedidos." },
]

// =========================
// Auxiliares
// =========================
function GradientText({ children }: { children: React.ReactNode }) {
  return (
    <span className="bg-[conic-gradient(at_50%_50%,theme(colors.indigo.700),theme(colors.violet.700),theme(colors.slate.800),theme(colors.indigo.700))] bg-clip-text text-transparent">
      {children}
    </span>
  )
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.06 },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 110, damping: 18 } },
}

// Loop sutil de flutuação por card
const floatLoop: Variants = {
  animate: (i: number) => ({
    y: [0, -6, 0],
    transition: { duration: 6 + i * 0.4, repeat: Infinity, ease: "easeInOut" },
  }),
}

// Shimmer periódico cruzando o card (visível sem interação) — só transform/opacity (suave em GPU)
const glint: Variants = {
  animate: { x: ["-130%", "130%"], opacity: [0, 0.16, 0] },
}

// =========================
// BACKDROP: aurora + varreduras passando pela tela (transform-only)
// =========================
function SurrealBackdrop({ reduced }: { reduced: boolean }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Base branco/cinza */}
      <div className="absolute inset-0 bg-[radial-gradient(1200px_520px_at_50%_-10%,theme(colors.slate.50),white)]" />

      {/* Aurora orgânica (camadas) */}
      {!reduced && (
        <motion.div
          className="absolute -top-24 left-1/2 h-[60vh] w-[120vw] -translate-x-1/2 opacity-60 will-change-transform [mask-image:radial-gradient(60%_60%_at_50%_40%,black,transparent)]"
          initial={false}
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
          style={{
            background:
              "conic-gradient(from_0deg,rgba(99,102,241,.12),rgba(168,85,247,.12),rgba(15,23,42,.08),rgba(99,102,241,.12))",
            filter: "blur(40px)",
          }}
        />
      )}

      {/* SWEEP horizontal passando pela tela */}
      {!reduced && (
        <motion.div
          className="absolute inset-y-0 -left-[40%] w-[40%] will-change-transform"
          animate={{ x: ["-40%", "140%"] }}
          transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
          style={{
            background:
              "linear-gradient(90deg,rgba(99,102,241,0)_0%,rgba(99,102,241,.10)_35%,rgba(168,85,247,.10)_65%,rgba(168,85,247,0)_100%)",
            mixBlendMode: "screen",
          }}
        />
      )}

      {/* Grade pseudo-3D com distorção */}
      <motion.div
        className="absolute left-1/2 top-[30%] h-[50vh] w-[120vw] -translate-x-1/2 opacity-20 will-change-transform"
        initial={false}
        animate={{ backgroundPositionX: ["0px", "160px"], backgroundPositionY: ["0px", "160px"], rotate: [0, 1, 0] }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        style={{
          backgroundImage:
            "linear-gradient(to_right,rgba(100,116,139,.35)_1px,transparent_1px),linear-gradient(to_bottom,rgba(100,116,139,.35)_1px,transparent_1px)",
          backgroundSize: "40px 40px",
          transform: "perspective(1200px) rotateX(55deg) scale(1.1)",
          maskImage: "linear-gradient(to_bottom,black,black,transparent)",
        }}
      />

      {/* Scan cromático suave top->bottom */}
      {!reduced && (
        <motion.div
          className="absolute inset-x-0 top-0 h-20 opacity-60 will-change-transform"
          initial={{ y: -120, opacity: 0 }}
          animate={{ y: [-120, 1000, -120], opacity: [0, 1, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          style={{
            background:
              "linear-gradient(to_bottom,rgba(99,102,241,.25),rgba(255,255,255,0)_40%), linear-gradient(to_bottom,rgba(168,85,247,.25),rgba(255,255,255,0)_70%)",
          }}
        />
      )}

      {/* Ruído sutil para textura */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            'url("data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"100\" height=\"100\" viewBox=\"0 0 100 100\"><filter id=\"n\"><feTurbulence type=\"fractalNoise\" baseFrequency=\"0.9\" numOctaves=\"2\" stitchTiles=\"stitch\"/></filter><rect width=\"100%\" height=\"100%\" filter=\"url(%23n)\" opacity=\"0.35\"/></svg>")',
        }}
      />
    </div>
  )
}

// =========================
// Util: gradientes magnéticos (puro) + testes simples
// =========================
export function __computeMagnetBackground(x: number, y: number) {
  const bg = `radial-gradient(120px_120px_at_${x}px_${y}px,rgba(99,102,241,.35),transparent_70%), radial-gradient(120px_120px_at_${x + 60}px_${y + 30}px,rgba(168,85,247,.35),transparent_70%)`
  return bg
}

// Pequenos testes em dev (não roda no SSR nem em produção)
if (typeof window !== "undefined" && process.env.NODE_ENV !== "production") {
  console.assert(__computeMagnetBackground(10, 10).includes("radial-gradient"), "bg deve conter radial-gradient")
  console.assert(__computeMagnetBackground(0, 0).includes("0px_0px"), "usa coordenadas fornecidas sem NaN")
  console.assert(__computeMagnetBackground(40, 20).includes("100px_50px"), "aplica deslocamento +60/+30 corretamente")
}

// =========================
// Handlers sem hooks (evita regras de hooks dentro do map)
// =========================
function handleCardMouseMove(e: ReactMouseEvent<HTMLDivElement> | ReactTouchEvent<HTMLDivElement>) {
  const el = e.currentTarget as HTMLDivElement
  const r = el.getBoundingClientRect()
  let clientX: number
  let clientY: number
  if ("touches" in e && e.touches && e.touches[0]) {
    clientX = e.touches[0].clientX
    clientY = e.touches[0].clientY
  } else {
    const me = e as ReactMouseEvent<HTMLDivElement>
    clientX = me.clientX
    clientY = me.clientY
  }
  const x = clientX - r.left
  const y = clientY - r.top
  el.style.setProperty("--mx", `${x}px`)
  el.style.setProperty("--my", `${y}px`)
  el.style.background = __computeMagnetBackground(x, y)
}

// =========================
// Componente
// =========================
export function BenefitsSection({ className, forceMotion = false }: { className?: string; forceMotion?: boolean }) {
  const prefersReduced = useReducedMotion()
  const shouldReduce = prefersReduced && !forceMotion
  const computedContainer = useMemo(() => containerVariants, [])

  return (
    <section
      className={cn(
        "relative py-20",
        "bg-white text-slate-900",
        className
      )}
      suppressHydrationWarning
    >
      <SurrealBackdrop reduced={!!shouldReduce} />

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Título */}
        <motion.div
          initial={false}
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          variants={computedContainer}
          className="text-center mb-14"
        >
          <motion.h2 variants={itemVariants} className="text-3xl md:text-4xl font-bold text-balance">
            Por que escolher <GradientText>Nossa Empresa</GradientText>
          </motion.h2>
          <motion.div
            initial={false}
            animate={shouldReduce ? undefined : { width: [0, 96, 72, 96] }}
            transition={{ duration: 3, repeat: Infinity, repeatType: "mirror" }}
            className="mx-auto mt-3 h-1 w-24 rounded-full bg-[linear-gradient(90deg,theme(colors.indigo.500),theme(colors.violet.500))]"
          />
          <motion.p variants={itemVariants} className="mt-4 text-lg md:text-xl text-slate-600 max-w-2xl mx-auto text-pretty">
            Oferecemos muito mais que produtos e serviços. Somos seu parceiro estratégico para resultados consistentes.
          </motion.p>
        </motion.div>

        {/* Cards */}
        <motion.ul
          initial={false}
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
          variants={computedContainer}
          className="relative grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {benefits.map(({ icon: Icon, title, description }, idx) => (
            <motion.li key={idx} variants={itemVariants}>
              <motion.div custom={idx} animate={shouldReduce ? undefined : "animate"} variants={floatLoop}>
                <div
                  onMouseMove={handleCardMouseMove}
                  onTouchMove={handleCardMouseMove}
                  className="relative overflow-hidden rounded-2xl p-[1.5px] will-change-transform"
                  style={{
                    background:
                      "radial-gradient(120px_120px_at_var(--mx,_50%)_var(--my,_50%),rgba(99,102,241,.35),transparent_70%), radial-gradient(120px_120px_at_calc(var(--mx,_50%)+60px)_calc(var(--my,_50%)+30px),rgba(168,85,247,.35),transparent_70%)",
                    transition: "background 120ms ease",
                  }}
                >
                  {/* Shimmer periódico global por card */}
                  {!shouldReduce && (
                    <motion.span
                      aria-hidden
                      variants={glint}
                      animate="animate"
                      transition={{ duration: 2.8, repeat: Infinity, ease: "linear", delay: idx * 0.25 }}
                      className="pointer-events-none absolute inset-y-0 -left-1 block w-1/3 rotate-6 bg-gradient-to-r from-transparent via-white/60 to-transparent"
                    />
                  )}

                  <Card
                    className={cn(
                      "relative h-full rounded-2xl border-slate-200 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/70",
                      "transition-transform duration-300 hover:-translate-y-1",
                      "group text-slate-900"
                    )}
                  >
                    {/* Luz que segue o cursor (mask) — reduzida pra evitar travar */}
                    <div
                      className="pointer-events-none absolute inset-0 rounded-2xl will-change-transform"
                      style={{
                        background:
                          "radial-gradient(160px_160px_at_var(--mx,_50%)_var(--my,_50%),rgba(255,255,255,.75),rgba(255,255,255,0)_70%)",
                        mixBlendMode: "overlay",
                        opacity: shouldReduce ? 0.2 : 0.45,
                        transition: "opacity 150ms ease",
                      }}
                    />

                    <CardHeader className="text-center">
                      <div className="mx-auto mb-5 flex items-center justify-center">
                        <div className="relative">
                          {/* Ícone fixo (sem pulso) para suavizar FPS */}
                          <div className="relative rounded-full p-3 bg-white ring-1 ring-slate-300">
                            <Icon className="h-7 w-7 text-slate-900" />
                          </div>
                        </div>
                      </div>

                      <CardTitle className="text-lg font-semibold text-balance">{title}</CardTitle>
                    </CardHeader>

                    <CardContent className="text-center">
                      <CardDescription className="text-slate-600 text-pretty">{description}</CardDescription>
                    </CardContent>

                    <div className="pointer-events-none mt-6 h-px w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
                  </Card>
                </div>
              </motion.div>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  )
}

export default BenefitsSection
