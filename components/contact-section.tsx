"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageCircle, Mail, MapPin, Phone } from "lucide-react"
import { useState } from "react"
import { EmailModal } from "@/components/email-modal"

export function ContactSection() {
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false)

  const handleWhatsAppClick = () => {
    // Track WhatsApp click
    fetch("/api/track-interaction", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "whatsapp" }),
    })

    window.open("https://wa.me/5511913211958?text=Olá! Gostaria de mais informações sobre seus serviços.", "_blank")
  }

  return (
    <section id="contato" className="py-20 bg-card/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">
            Entre em <span className="gradient-text">Contato</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
            Estamos prontos para ajudar você a alcançar seus objetivos. Fale conosco!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Contact Info */}
          <div className="space-y-8">
            <Card className="bg-card border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <MessageCircle className="h-6 w-6 text-primary" />
                  WhatsApp
                </CardTitle>
                <CardDescription>
                  Fale conosco diretamente pelo WhatsApp para um atendimento rápido e personalizado.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full gradient-primary" onClick={handleWhatsAppClick}>
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Iniciar Conversa
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-card border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Mail className="h-6 w-6 text-primary" />
                  E-mail
                </CardTitle>
                <CardDescription>Envie-nos um e-mail detalhado sobre seu projeto ou dúvida.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  className="w-full border-primary/50 hover:bg-primary/10 bg-transparent"
                  onClick={() => setIsEmailModalOpen(true)}
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Enviar E-mail
                </Button>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Card className="bg-card border-border/50">
                <CardContent className="p-6 text-center">
                  <Phone className="h-8 w-8 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Telefone</h3>
                  <p className="text-muted-foreground">(11) 91321-1958</p>
                </CardContent>
              </Card>

              <Card className="bg-card border-border/50">
                <CardContent className="p-6 text-center">
                  <MapPin className="h-8 w-8 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Localização</h3>
                  <p className="text-muted-foreground">São Paulo, SP</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* CTA Section */}
          <div className="flex items-center">
            <Card className="w-full bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
              <CardContent className="p-8 text-center">
                <h3 className="text-2xl font-bold mb-4 text-balance">Pronto para Começar?</h3>
                <p className="text-muted-foreground mb-6 text-pretty">
                  Transforme suas ideias em realidade. Nossa equipe está pronta para criar soluções personalizadas que
                  impulsionem seu sucesso.
                </p>
                <div className="space-y-4">
                  <Button size="lg" className="w-full gradient-primary" onClick={handleWhatsAppClick}>
                    <MessageCircle className="mr-2 h-5 w-5" />
                    Começar Agora
                  </Button>
                  <p className="text-sm text-muted-foreground">Resposta em até 2 horas úteis</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <EmailModal isOpen={isEmailModalOpen} onClose={() => setIsEmailModalOpen(false)} />
    </section>
  )
}
