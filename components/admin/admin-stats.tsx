"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Package, Star, MessageCircle, Mail, Eye } from "lucide-react"

interface AdminStatsData {
  total_products: number
  total_reviews: number
  pending_reviews: number
  total_users: number
  whatsapp_clicks: number
  email_clicks: number
  email_captures: number
}

export function AdminStats() {
  const [stats, setStats] = useState<AdminStatsData>({
    total_products: 0,
    total_reviews: 0,
    pending_reviews: 0,
    total_users: 0,
    whatsapp_clicks: 0,
    email_clicks: 0,
    email_captures: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/admin/metrics")
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error("Error fetching admin stats:", error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: "Usuários",
      value: stats.total_users,
      icon: Users,
      description: "Total de usuários cadastrados",
      color: "text-blue-500",
    },
    {
      title: "Produtos",
      value: stats.total_products,
      icon: Package,
      description: "Produtos e serviços ativos",
      color: "text-green-500",
    },
    {
      title: "Avaliações",
      value: stats.total_reviews,
      icon: Star,
      description: "Total de avaliações",
      color: "text-yellow-500",
    },
    {
      title: "Pendentes",
      value: stats.pending_reviews,
      icon: Eye,
      description: "Avaliações para moderar",
      color: "text-orange-500",
    },
    {
      title: "WhatsApp",
      value: stats.whatsapp_clicks,
      icon: MessageCircle,
      description: "Cliques no WhatsApp",
      color: "text-green-600",
    },
    {
      title: "E-mails",
      value: stats.email_clicks,
      icon: Mail,
      description: "Cliques em e-mail",
      color: "text-purple-500",
    },
  ]

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="bg-card border-border/50">
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-muted rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-muted rounded w-3/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {statCards.map((stat, index) => {
        const Icon = stat.icon
        return (
          <Card key={index} className="bg-card border-border/50 hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <Icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold gradient-text">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
