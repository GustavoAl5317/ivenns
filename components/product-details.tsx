"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, MessageCircle, Phone, Package, DollarSign, Share2 } from "lucide-react"

export interface Product {
  id: string
  title: string
  description: string
  image_url: string
  sku: string
  category: string
  price: number | null
  created_at: string
  // opcionais
  additional_images?: string[]
  specifications?: string
  features?: string[]
  warranty?: string
}

interface ProductDetailsProps {
  product: Product
}

export function ProductDetails({ product }: ProductDetailsProps) {
  const [selectedImage, setSelectedImage] = useState(product.image_url)

  const images = product.additional_images?.length ? [...product.additional_images] : [product.image_url]
  if (!images.includes(product.image_url)) images.unshift(product.image_url)

  const handleConsultProduct = () => {
    const message = `Olá! Gostaria de saber mais sobre o produto: ${product.title} (Código: ${product.sku})`
    const phone = process.env.NEXT_PUBLIC_WHATSAPP_PHONE || "5511992138829"
    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, "_blank", "noopener,noreferrer")
  }

  const handleContactProduct = () => {
    window.location.href = "/#contato"
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.title,
          text: product.description,
          url: window.location.href,
        })
      } catch (error) {
        console.log("Error sharing:", error)
      }
    } else {
      await navigator.clipboard.writeText(window.location.href)
      alert("Link copiado para a área de transferência!")
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/#produtos" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
              Voltar aos Produtos
            </Link>
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-2" />
              Compartilhar
            </Button>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Galeria */}
          <div className="space-y-4">
            <div className="aspect-square overflow-hidden rounded-lg border">
              <img src={selectedImage} alt={product.title} className="object-cover w-full h-full" />
            </div>
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(image)}
                    className={`aspect-square overflow-hidden rounded border-2 transition-colors ${
                      selectedImage === image ? "border-primary" : "border-muted"
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.title} - Imagem ${index + 1}`}
                      className="object-cover w-full h-full"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Infos */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">
                  <Package className="mr-1 h-3 w-3" />
                  {product.sku}
                </Badge>
                <Badge variant="outline">{product.category || "Produto"}</Badge>
              </div>

              <h1 className="text-3xl font-bold tracking-tight mb-4">{product.title}</h1>

              {product.price != null && (
                <div className="flex items-center gap-2 mb-4">
                  <DollarSign className="h-5 w-5 text-primary" />
                  <span className="text-2xl font-bold text-primary">
                    {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(product.price)}
                  </span>
                  <span className="text-sm text-muted-foreground">ou consulte condições</span>
                </div>
              )}

              <p className="text-lg text-muted-foreground leading-relaxed">{product.description}</p>
            </div>

            <Separator />

            {/* Especificações */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Informações do Produto</h3>
              <div className="grid gap-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Código:</span>
                  <span className="font-medium">{product.sku}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Categoria:</span>
                  <span className="font-medium">{product.category || "Produto"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Disponível desde:</span>
                  <span className="font-medium">
                    {product.created_at ? new Date(product.created_at).toLocaleDateString("pt-BR") : "—"}
                  </span>
                </div>
                {product.warranty && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Garantia:</span>
                    <span className="font-medium">{product.warranty}</span>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Ações */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Interessado neste produto?</h3>
              <div className="grid gap-3">
                <Button onClick={handleConsultProduct} size="lg" className="w-full bg-green-600 hover:bg-green-700">
                  <MessageCircle className="mr-2 h-5 w-5" />
                  Consultar via WhatsApp
                </Button>
                <Button variant="outline" onClick={handleContactProduct} size="lg" className="w-full">
                  <Phone className="mr-2 h-5 w-5" />
                  Entrar em Contato
                </Button>
              </div>
              <p className="text-sm text-muted-foreground text-center">
                Entre em contato para mais informações, preços especiais e condições de pagamento.
              </p>
            </div>
          </div>
        </div>

        {/* Seção extra */}
        <div className="mt-16">
          <Card>
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <h3 className="text-xl font-semibold">Precisa de mais informações?</h3>
                <p className="text-muted-foreground">
                  Nossa equipe está pronta para esclarecer todas as suas dúvidas e oferecer a melhor solução para sua necessidade.
                </p>
                <div className="flex gap-4 justify-center">
                  <Button onClick={handleConsultProduct} className="bg-green-600 hover:bg-green-700">
                    <MessageCircle className="mr-2 h-4 w-4" />
                    WhatsApp
                  </Button>
                  <Button variant="outline" onClick={handleContactProduct}>
                    <Phone className="mr-2 h-4 w-4" />
                    Contato
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

export default ProductDetails
