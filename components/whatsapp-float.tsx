"use client"

import { MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export function WhatsAppFloat() {
  const handleClick = () => {
    // Track WhatsApp click
    fetch("/api/track-interaction", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "whatsapp" }),
    })

    window.open("https://wa.me/5511913211958?text=Olá! Gostaria de mais informações.", "_blank")
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Button
        size="lg"
        className="rounded-full w-14 h-14 gradient-primary shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
        onClick={handleClick}
      >
        <MessageCircle className="h-6 w-6" />
        <span className="sr-only">Falar no WhatsApp</span>
      </Button>
    </div>
  )
}
