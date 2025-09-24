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

    // Get admin metrics using the database function
    const { data: metrics, error } = await supabase.rpc("get_admin_metrics")

    if (error) {
      console.error("Error fetching admin metrics:", error)
      return NextResponse.json({ error: "Failed to fetch metrics" }, { status: 500 })
    }

    return NextResponse.json(metrics)
  } catch (error) {
    console.error("Error in admin metrics API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
