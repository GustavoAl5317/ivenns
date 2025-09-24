import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminHeader } from "@/components/admin/admin-header"
import { PartnersManagement } from "@/components/admin/partners-management"

export default async function AdminPartnersPage() {
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
              Gerenciar <span className="gradient-text">Parceiros</span>
            </h1>
            <p className="text-muted-foreground mt-2">
              Adicione e gerencie parceiros e fornecedores que aparecerão no site.
            </p>
          </div>

          <PartnersManagement />
        </div>
      </main>
    </div>
  )
}