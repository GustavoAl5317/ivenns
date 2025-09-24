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

    const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()
    if (!profile || profile.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    // Return only the current admin user information
    const adminInfo = {
      id: user.id,
      email: user.email,
      full_name: profile.full_name || "Administrador ivenns",
      role: profile.role,
      created_at: profile.created_at,
      company: "ivenns",
      department: "Vendas e Marketing"
    }

    return NextResponse.json([adminInfo])
  } catch (error) {
    console.error("Error fetching admin info:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
