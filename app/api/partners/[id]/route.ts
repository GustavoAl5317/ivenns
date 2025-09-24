import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
      .update({
        name,
        description,
        logo_url,
        website_url: website_url || null,
        whatsapp: whatsapp || null,
        category,
      })
      .eq("id", params.id)
      .select()
      .single()

    if (error) {
      console.error("Error updating partner:", error)
      return NextResponse.json({ error: "Failed to update partner" }, { status: 500 })
    }

    return NextResponse.json(partner)
  } catch (error) {
    console.error("Error in partners PUT API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
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

    const { error } = await supabase
      .from("partners")
      .delete()
      .eq("id", params.id)

    if (error) {
      console.error("Error deleting partner:", error)
      return NextResponse.json({ error: "Failed to delete partner" }, { status: 500 })
    }

    return NextResponse.json({ message: "Partner deleted successfully" })
  } catch (error) {
    console.error("Error in partners DELETE API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}