import type React from "react"
import type { Metadata } from "next"
import { Poppins } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import "./globals.css"

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
})

export const metadata: Metadata = {
  title: "Minha Empresa - Produtos e Serviços de Qualidade",
  description:
    "Apresentamos os melhores produtos e serviços para você. Consultoria, desenvolvimento e soluções personalizadas.",
  generator: "v0.app",
  keywords: ["produtos", "serviços", "consultoria", "marketing digital", "desenvolvimento"],
  openGraph: {
    title: "Minha Empresa - Produtos e Serviços de Qualidade",
    description: "Apresentamos os melhores produtos e serviços para você",
    type: "website",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <body className={`font-sans ${poppins.variable}`}>
        <Suspense fallback={null}>{children}</Suspense>
        <Analytics />
      </body>
    </html>
  )
}
