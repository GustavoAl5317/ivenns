"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X, User, LogOut } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Image from "next/image"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [scrolled, setScrolled] = useState(false)
  const mountedRef = useRef(false)
  const router = useRouter()
  const headerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    mountedRef.current = true
    const supabase = createClient()

    supabase.auth.getUser().then(({ data, error }) => {
      if (!mountedRef.current) return
      if (!error) setUser(data.user ?? null)
    })

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mountedRef.current) return
      setUser(session?.user ?? null)
    })

    return () => {
      mountedRef.current = false
      sub?.subscription?.unsubscribe()
    }
  }, [])

  // sombra ao rolar
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 6)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  // spotlight segue mouse
  const onMouseMoveHeader = (e: React.MouseEvent) => {
    const el = headerRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    el.style.setProperty("--hx", `${e.clientX - r.left}px`)
    el.style.setProperty("--hy", `${e.clientY - r.top}px`)
  }

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setUser(null)
    router.push("/")
  }

  return (
    <header
      ref={headerRef}
      onMouseMove={onMouseMoveHeader}
      className={[
        "sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        "transition-shadow duration-300",
        scrolled ? "shadow-[0_8px_28px_-12px_rgba(0,0,0,.55)]" : "shadow-none",
        "relative"
      ].join(" ")}
    >
      {/* barra de brilho animada */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[3px] overflow-hidden"
      >
        <div className="h-full w-[200%] animate-[headerShine_4s_linear_infinite] bg-[linear-gradient(90deg,rgba(99,102,241,.0),rgba(99,102,241,.9),rgba(217,70,239,.9),rgba(139,92,246,.9),rgba(99,102,241,.0))]" />
      </div>

      {/* spotlight mais perceptível */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(300px 220px at var(--hx,50%) var(--hy,50%), rgba(168,85,247,0.16), transparent 80%)",
          transition: "background 150ms ease"
        }}
      />

      <div className="container flex h-16 items-center justify-between relative">
        <Link href="/" className="flex items-center space-x-3 ml-2 group" aria-label="Página inicial">
          <div className="relative w-11 h-11">
            <Image
              src="/images/ivenns-logo.png"
              alt="ivenns"
              width={70}
              height={70}
              className="object-contain transition-transform duration-300 group-hover:scale-105"
              priority
            />
          </div>
          <span className="text-xl font-bold gradient-text select-none">ivenns</span>
        </Link>

        {/* Navegação desktop */}
        <nav className="hidden md:flex items-center space-x-8">
          {[
            { href: "#produtos", label: "Produtos" },
            { href: "#servicos", label: "Serviços" },
            { href: "#parceiros", label: "Parceiros" },
            { href: "#contato", label: "Contato" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="navlink relative text-sm font-medium hover:text-primary transition-colors"
            >
              {item.label}
              <span
                aria-hidden
                className="nav-ink absolute -bottom-1 left-0 h-[3px] w-full origin-left scale-x-0 rounded-full bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-violet-500 transition-transform duration-500"
              />
            </Link>
          ))}
        </nav>

        {/* Ações do usuário */}
        <div className="hidden md:flex items-center space-x-4">
          {user ? (
            <Button variant="ghost" size="sm" onClick={handleSignOut} className="transition-transform hover:-translate-y-[1px]">
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
          ) : (
            <Button variant="ghost" size="sm" asChild className="transition-transform hover:-translate-y-[1px]">
              <Link href="/admin/login">
                <User className="mr-2 h-4 w-4" />
                Entrar
              </Link>
            </Button>
          )}
        </div>

        {/* Botão menu mobile */}
        <button
          className="md:hidden active:scale-90 transition-transform"
          onClick={() => setIsMenuOpen(v => !v)}
          aria-label="Abrir menu"
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Navegação mobile */}
      {isMenuOpen && (
        <div className="md:hidden border-t bg-background animate-[mobileIn_.25s_ease]">
          <nav className="container py-4 space-y-4">
            {["Produtos","Serviços","Parceiros","Contato"].map((label, i) => (
              <Link
                key={i}
                href={`#${label.toLowerCase()}`}
                className="block text-sm font-medium hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {label}
              </Link>
            ))}

            <div className="pt-4 border-t space-y-2">
              {user ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    setIsMenuOpen(false)
                    handleSignOut()
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  asChild
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Link href="/admin/login">
                    <User className="mr-2 h-4 w-4" />
                    Entrar
                  </Link>
                </Button>
              )}
            </div>
          </nav>
        </div>
      )}

      <style jsx global>{`
        @keyframes headerShine {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes mobileIn {
          from { opacity: 0; transform: translateY(-10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .navlink:hover .nav-ink { transform: scaleX(1); }
      `}</style>
    </header>
  )
}
