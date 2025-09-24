"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, MessageCircle, Mail, Zap, Shield, Users, Code, Smartphone, Cloud } from "lucide-react"
import { useState } from "react"
import { EmailModal } from "@/components/email-modal"
import Link from "next/link"
import Image from "next/image"

export function HeroSection() {
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false)

  const handleWhatsAppClick = () => {
    // Track WhatsApp click
    fetch("/api/track-interaction", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "whatsapp" }),
    }).catch(() => {
      /* ignore tracking errors */
    })

    // Open WhatsApp
    window.open(
      "https://wa.me/5511913211958?text=Olá! Gostaria de saber mais sobre seus produtos e serviços.",
      "_blank",
    )
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-background to-muted/20">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 opacity-20">
        <Code className="w-20 h-20 text-blue-500 animate-pulse" />
      </div>
      <div className="absolute top-40 right-20 opacity-20">
        <Smartphone className="w-16 h-16 text-purple-500 animate-bounce" />
      </div>
      <div className="absolute bottom-40 left-20 opacity-20">
        <Cloud className="w-15 h-15 text-green-500 animate-pulse" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-5xl mx-auto">
          {/* Logo */}
          <div className="flex items-center justify-center mb-8">
            <div className="relative w-20 h-20 mr-4">
<div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-0 rounded-2xl opacity-1 z-0" />
 

              <Image
                src="/images/ivenns-logo.png"
                alt="ivenns"
                width={80}
                height={80}
                className="relative object-contain rounded-2xl"
                priority
              />
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold">
              <span className="gradient-text">ivenns</span>
            </h1>
          </div>

          {/* Tagline */}
          <div className="mb-8">
            <h2 className="text-2xl md:text-4xl font-bold text-balance mb-4">
              Infraestrutura de rede, periféricos e suporte de elite. <span className="gradient-text">Transformam Negócios</span>
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Da escolha de switches e servidores à instalação de pontos de rede e manutenção de equipamentos — a Ivens entrega performance e confiabilidade pra sua operação rodar no talo, sem dor de cabeça.
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
            <div className="flex items-center justify-center space-x-3 p-4 rounded-lg bg-muted/30 backdrop-blur">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-600/20 rounded-full animate-pulse"></div>
                <Zap className="relative w-6 h-6 text-blue-600" />
              </div>
              <span className="font-semibold">Inovação Constante</span>
            </div>
            <div className="flex items-center justify-center space-x-3 p-4 rounded-lg bg-muted/30 backdrop-blur">
              <div className="relative">
                <div className="absolute inset-0 bg-green-600/20 rounded-full animate-pulse"></div>
                <Shield className="relative w-6 h-6 text-green-600" />
              </div>
              <span className="font-semibold">Segurança Garantida</span>
            </div>
            <div className="flex items-center justify-center space-x-3 p-4 rounded-lg bg-muted/30 backdrop-blur">
              <div className="relative">
                <div className="absolute inset-0 bg-purple-600/20 rounded-full animate-pulse"></div>
                <Users className="relative w-6 h-6 text-purple-600" />
              </div>
              <span className="font-semibold">Suporte Especializado</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" className="text-lg px-8 py-6 group" onClick={handleWhatsAppClick}>
              <MessageCircle className="mr-2 h-5 w-5" />
              Falar no WhatsApp
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 py-6 border-primary/50 hover:bg-primary/10 bg-transparent"
              onClick={() => setIsEmailModalOpen(true)}
            >
              <Mail className="mr-2 h-5 w-5" />
              Enviar E-mail
            </Button>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold gradient-text">500+</div>
              <div className="text-muted-foreground">Clientes Satisfeitos</div>
            </div>
            <div>
              <div className="text-3xl font-bold gradient-text">98%</div>
              <div className="text-muted-foreground">Taxa de Satisfação</div>
            </div>
            <div>
              <div className="text-3xl font-bold gradient-text">24/7</div>
              <div className="text-muted-foreground">Suporte Disponível</div>
            </div>
          </div>
        </div>
      </div>

      <EmailModal isOpen={isEmailModalOpen} onClose={() => setIsEmailModalOpen(false)} />
    </section>
  )
}
