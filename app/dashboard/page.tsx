import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { ProductsGrid } from "@/components/dashboard/products-grid"
import { RecentReviews } from "@/components/dashboard/recent-reviews"

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/admin/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={data.user} profile={profile} />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-balance">
              Bem-vindo, <span className="gradient-text">{profile?.full_name || data.user.email}</span>
            </h1>
            <p className="text-muted-foreground mt-2">
              Gerencie seus produtos e serviços, e acompanhe o desempenho do seu negócio.
            </p>
          </div>

          <DashboardStats userId={data.user.id} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <ProductsGrid userId={data.user.id} />
            </div>
            <div>
              <RecentReviews userId={data.user.id} />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
