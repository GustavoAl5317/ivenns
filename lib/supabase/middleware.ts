import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  const response = NextResponse.next({ request })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseAnonKey) return response

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookies) => cookies.forEach(({ name, value, options }) => {
        response.cookies.set(name, value, options)
      }),
    },
  })

  try {
    const { data: { user } } = await supabase.auth.getUser()
    const path = request.nextUrl.pathname

    // defina claramente o que é auth page e o que é protegido
    const isAuthPage =
      path === "/admin/login" ||
      path === "/auth/sign-up"

    const isProtected =
      (path.startsWith("/admin") && !isAuthPage) ||
      path.startsWith("/dashboard")

    // 1) Usuário não logado tentando acessar área protegida → manda para login
    if (!user && isProtected) {
      const url = request.nextUrl.clone()
      url.pathname = "/admin/login"
      url.searchParams.set("redirectedFrom", path)
      return NextResponse.redirect(url)
    }

    // 2) Usuário logado acessando página de auth → manda para /admin
    if (user && isAuthPage) {
      const url = request.nextUrl.clone()
      // opcional: volte para o destino original se existir e não for página de auth
      const from = request.nextUrl.searchParams.get("redirectedFrom")
      if (from && !["/admin/login", "/auth/sign-up"].includes(from)) {
        url.pathname = from
      } else {
        url.pathname = "/admin"
      }
      url.search = "" // evita ficar carregando redirectedFrom
      return NextResponse.redirect(url)
    }
  } catch (e) {
    console.error("Erro no auth middleware:", e)
  }

  return response
}
