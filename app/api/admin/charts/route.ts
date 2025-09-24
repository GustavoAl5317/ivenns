import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()

    // Verify admin access
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
    if (!profile || profile.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    // Get interactions by day (last 7 days)
    const { data: interactions } = await supabase
      .from("contact_interactions")
      .select("type, created_at")
      .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

    // Process interactions by day
    const interactionsByDay = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000)
      const dateStr = date.toLocaleDateString("pt-BR", { month: "short", day: "numeric" })
      const dayInteractions = interactions?.filter((int) => {
        const intDate = new Date(int.created_at)
        return intDate.toDateString() === date.toDateString()
      })
      return {
        date: dateStr,
        whatsapp: dayInteractions?.filter((int) => int.type === "whatsapp").length || 0,
        email: dayInteractions?.filter((int) => int.type === "email").length || 0,
      }
    })

    // Get products by category
    const { data: products } = await supabase.from("products").select("category")
    const productsByCategory = [
      {
        category: "Produtos",
        count: products?.filter((p) => p.category === "product").length || 0,
      },
      {
        category: "Serviços",
        count: products?.filter((p) => p.category === "service").length || 0,
      },
    ]

    // Get reviews by rating
    const { data: reviews } = await supabase.from("reviews").select("rating")
    const reviewsRating = Array.from({ length: 5 }, (_, i) => ({
      rating: i + 1,
      count: reviews?.filter((r) => r.rating === i + 1).length || 0,
    }))

    return NextResponse.json({
      interactionsByDay,
      productsByCategory,
      reviewsRating,
    })
  } catch (error) {
    console.error("Error in admin charts API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
