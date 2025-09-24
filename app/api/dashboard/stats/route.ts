import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const supabase = await createClient()

    // Verify user authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user || user.id !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user's products count
    const { count: totalProducts } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)

    // Get reviews count for user's products
    const { count: totalReviews } = await supabase
      .from("reviews")
      .select("*, products!inner(*)", { count: "exact", head: true })
      .eq("products.user_id", userId)

    // Get total clicks for user's products
    const { data: clicksData } = await supabase.from("products").select("click_count").eq("user_id", userId)

    const totalClicks = clicksData?.reduce((sum, product) => sum + (product.click_count || 0), 0) || 0

    // Get contact interactions for user's products
    const { count: totalViews } = await supabase
      .from("contact_interactions")
      .select("*, products!inner(*)", { count: "exact", head: true })
      .eq("products.user_id", userId)

    return NextResponse.json({
      totalProducts: totalProducts || 0,
      totalReviews: totalReviews || 0,
      totalViews: totalViews || 0,
      totalClicks: totalClicks,
    })
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
