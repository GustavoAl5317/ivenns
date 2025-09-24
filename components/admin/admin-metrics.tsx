"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

interface MetricsData {
  interactionsByDay: Array<{ date: string; whatsapp: number; email: number }>
  productsByCategory: Array<{ category: string; count: number }>
  reviewsRating: Array<{ rating: number; count: number }>
}

export function AdminMetrics() {
  const [metrics, setMetrics] = useState<MetricsData>({
    interactionsByDay: [],
    productsByCategory: [],
    reviewsRating: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMetrics()
  }, [])

  const fetchMetrics = async () => {
    try {
      const response = await fetch("/api/admin/charts")
      if (response.ok) {
        const data = await response.json()
        setMetrics(data)
      }
    } catch (error) {
      console.error("Error fetching metrics:", error)
    } finally {
      setLoading(false)
    }
  }

  const COLORS = ["#3b82f6", "#8b5cf6", "#06d6a0", "#f72585", "#ffbe0b"]

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card border-border/50">
          <CardContent className="p-6">
            <div className="animate-pulse h-64 bg-muted rounded"></div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border/50">
          <CardContent className="p-6">
            <div className="animate-pulse h-64 bg-muted rounded"></div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Interactions Chart */}
      <Card className="bg-card border-border/50">
        <CardHeader>
          <CardTitle>Interações por Dia</CardTitle>
          <CardDescription>Cliques em WhatsApp e E-mail nos últimos 7 dias</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={metrics.interactionsByDay}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="whatsapp" fill="#25d366" name="WhatsApp" />
              <Bar dataKey="email" fill="#8b5cf6" name="E-mail" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Products by Category */}
      <Card className="bg-card border-border/50">
        <CardHeader>
          <CardTitle>Produtos por Categoria</CardTitle>
          <CardDescription>Distribuição entre produtos e serviços</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={metrics.productsByCategory}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ category, count }) => `${category}: ${count}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {metrics.productsByCategory.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Reviews Rating Distribution */}
      <Card className="bg-card border-border/50 lg:col-span-2">
        <CardHeader>
          <CardTitle>Distribuição de Avaliações</CardTitle>
          <CardDescription>Quantidade de avaliações por nota (estrelas)</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={metrics.reviewsRating}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="rating" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#fbbf24" name="Avaliações" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
