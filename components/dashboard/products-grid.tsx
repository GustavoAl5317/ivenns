"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Eye } from "lucide-react"
import { ProductModal } from "@/components/dashboard/product-modal"
import { Package } from "lucide-react" // Import Package component

interface Product {
  id: string
  title: string
  description: string
  image_url: string
  sku: string
  category: "product" | "service"
  price: number | null
  is_active: boolean
  click_count: number
  created_at: string
}

interface ProductsGridProps {
  userId: string
}

export function ProductsGrid({ userId }: ProductsGridProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  useEffect(() => {
    fetchProducts()
  }, [userId])

  const fetchProducts = async () => {
    try {
      const response = await fetch(`/api/dashboard/products?userId=${userId}&category=product`)
      if (response.ok) {
        const data = await response.json()
        setProducts(data)
      }
    } catch (error) {
      console.error("Error fetching products:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setIsModalOpen(true)
  }

  const handleDelete = async (productId: string) => {
    if (!confirm("Tem certeza que deseja excluir este produto?")) return

    try {
      const response = await fetch(`/api/dashboard/products/${productId}`, {
        method: "DELETE",
      })
      if (response.ok) {
        setProducts(products.filter((p) => p.id !== productId))
      }
    } catch (error) {
      console.error("Error deleting product:", error)
    }
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setEditingProduct(null)
    fetchProducts() // Refresh products after modal closes
  }

  if (loading) {
    return (
      <Card className="bg-card border-border/50">
        <CardHeader>
          <CardTitle>Meus Produtos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-pulse">Carregando produtos...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="bg-card border-border/50">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Meus Produtos</CardTitle>
            <CardDescription>Gerencie seus produtos e serviços</CardDescription>
          </div>
          <Button onClick={() => setIsModalOpen(true)} className="gradient-primary">
            <Plus className="mr-2 h-4 w-4" />
            Novo Produto
          </Button>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <div className="text-center py-8">
              <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum produto cadastrado</h3>
              <p className="text-muted-foreground mb-4">Comece criando seu primeiro produto ou serviço.</p>
              <Button onClick={() => setIsModalOpen(true)} className="gradient-primary">
                <Plus className="mr-2 h-4 w-4" />
                Criar Produto
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {products.map((product) => (
                <Card key={product.id} className="bg-background border-border/50">
                  <CardHeader className="p-0">
                    <div className="aspect-video relative overflow-hidden rounded-t-lg">
                      <img
                        src={product.image_url || "/placeholder.svg"}
                        alt={product.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 left-2">
                        <Badge variant={product.category === "product" ? "default" : "secondary"}>
                          {product.category === "product" ? "Produto" : "Serviço"}
                        </Badge>
                      </div>
                      <div className="absolute top-2 right-2">
                        <Badge variant={product.is_active ? "default" : "destructive"}>
                          {product.is_active ? "Ativo" : "Inativo"}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <CardTitle className="text-lg mb-2 text-balance">{product.title}</CardTitle>
                    <CardDescription className="text-sm mb-3 text-pretty line-clamp-2">
                      {product.description}
                    </CardDescription>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>SKU: {product.sku}</span>
                      {product.price && (
                        <span className="font-semibold text-primary">
                          R$ {product.price.toFixed(2).replace(".", ",")}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        <span>{product.click_count} cliques</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 pt-0 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(product)}
                      className="flex-1 bg-transparent"
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(product.id)}
                      className="flex-1 bg-transparent border-destructive/50 text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Excluir
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <ProductModal isOpen={isModalOpen} onClose={handleModalClose} product={editingProduct} userId={userId} />
    </>
  )
}
