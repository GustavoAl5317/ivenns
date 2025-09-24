import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data: partners, error } = await supabase
      .from("partners")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching partners:", error)
      return NextResponse.json({ error: "Failed to fetch partners" }, { status: 500 })
    }

    return NextResponse.json(partners)
  } catch (error) {
    console.error("Error in partners API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check if user is authenticated and is admin
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (!profile || profile.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { name, description, logo_url, website_url, whatsapp, category } = body

    if (!name || !description || !logo_url || !category) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const { data: partner, error } = await supabase
      .from("partners")
      .insert([
        {
          name,
          description,
          logo_url,
          website_url: website_url || null,
          whatsapp: whatsapp || null,
          category,
        }
      ])
      .select()
      .single()

    if (error) {
      console.error("Error creating partner:", error)
      return NextResponse.json({ error: "Failed to create partner" }, { status: 500 })
    }

    return NextResponse.json(partner, { status: 201 })
  } catch (error) {
    console.error("Error in partners POST API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}