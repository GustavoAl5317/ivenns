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

    const { data: reviews, error } = await supabase
      .from("reviews")
      .select(`
        *,
        products!inner (
          title,
          user_id
        )
      `)
      .eq("products.user_id", userId)
      .order("created_at", { ascending: false })
      .limit(10)

    if (error) {
      console.error("Error fetching user reviews:", error)
      return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 })
    }

    // Transform the data to include product info
    const transformedReviews = reviews.map((review) => ({
      ...review,
      product: {
        title: review.products.title,
      },
    }))

    return NextResponse.json(transformedReviews)
  } catch (error) {
    console.error("Error in user reviews API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
