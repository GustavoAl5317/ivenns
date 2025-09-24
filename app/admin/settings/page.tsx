import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminHeader } from "@/components/admin/admin-header"
import { SiteSettings } from "@/components/admin/site-settings"

export default async function AdminSettingsPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/admin/login")
  }

  // Check if user is admin
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()

  if (!profile || profile.role !== "admin") {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader user={data.user} profile={profile} />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-balance">
              Configurações do <span className="gradient-text">Site</span>
            </h1>
            <p className="text-muted-foreground mt-2">
              Configure informações globais como WhatsApp, e-mail e dados da empresa.
            </p>
          </div>

          <SiteSettings />
        </div>
      </main>
    </div>
  )
}
