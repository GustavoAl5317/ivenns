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
  const mountedRef = useRef(false)
  const router = useRouter()

  useEffect(() => {
    mountedRef.current = true
    const supabase = createClient()

    // Usuário atual
    supabase.auth.getUser().then(({ data, error }) => {
      if (!mountedRef.current) return
      if (!error) setUser(data.user ?? null)
    })

    // Listener de auth com cleanup
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mountedRef.current) return
      setUser(session?.user ?? null)
    })

    return () => {
      mountedRef.current = false
      sub?.subscription?.unsubscribe()
    }
  }, [])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setUser(null)
    router.push("/")
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-3 ml-2">
  <div className="relative w-11 h-11">
    <Image
      src="/images/ivenns-logo.png"
      alt="ivenns"
      width={70}
      height={70}
      className="object-contain"
      priority
    />
  </div>
  <span className="text-xl font-bold gradient-text">ivenns</span>
</Link>

        {/* Navegação desktop */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link href="#produtos" className="text-sm font-medium hover:text-primary transition-colors">
            Produtos
          </Link>
          <Link href="#servicos" className="text-sm font-medium hover:text-primary transition-colors">
            Serviços
          </Link>
          <Link href="#parceiros" className="text-sm font-medium hover:text-primary transition-colors">
            Parceiros
          </Link>
          <Link href="#contato" className="text-sm font-medium hover:text-primary transition-colors">
            Contato
          </Link>
        </nav>

        {/* Ações do usuário (desktop) */}
        <div className="hidden md:flex items-center space-x-4">
          {user ? (
            <div className="flex items-center space-x-2">
              {/* Removido o botão "Dashboard" */}
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin/login">
                  <User className="mr-2 h-4 w-4" />
                  Entrar
                </Link>
              </Button>
            </div>
          )}
        </div>

        {/* Botão menu mobile */}
        <button
          className="md:hidden"
          onClick={() => setIsMenuOpen(v => !v)}
          aria-label="Abrir menu"
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Navegação mobile */}
      {isMenuOpen && (
        <div className="md:hidden border-t bg-background">
          <nav className="container py-4 space-y-4">
            <Link
              href="#produtos"
              className="block text-sm font-medium hover:text-primary transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Produtos
            </Link>
            <Link
              href="#servicos"
              className="block text-sm font-medium hover:text-primary transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Serviços
            </Link>
            <Link
              href="#parceiros"
              className="block text-sm font-medium hover:text-primary transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Parceiros
            </Link>
            <Link
              href="#contato"
              className="block text-sm font-medium hover:text-primary transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Contato
            </Link>

            <div className="pt-4 border-t space-y-2">
              {user ? (
                <>
                  {/* Removido o botão "Dashboard" no mobile também */}
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
                </>
              ) : (
                <>
                  <Button variant="ghost" size="sm" className="w-full" asChild onClick={() => setIsMenuOpen(false)}>
                    <Link href="/admin/login">
                      <User className="mr-2 h-4 w-4" />
                      Entrar
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
