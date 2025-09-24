import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server" // <— troque aqui
import { AdminHeader } from "@/components/admin/admin-header"
import { ReviewsModeration } from "@/components/admin/reviews-moderation"

export const revalidate = 0
export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"

export default async function AdminReviewsPage() {
  const supabase = createClient() // <— e aqui

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError) console.error("auth.getUser error:", userError)

  if (!user) redirect("/admin/login?next=/admin/reviews")

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, role, full_name")
    .eq("id", user!.id) // ajuste para "user_id" se sua tabela usar esse campo
    .maybeSingle()

  if (profileError) console.error("profiles query error:", profileError)
  if (!profile || profile.role !== "admin") redirect("/dashboard")

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader user={user} profile={profile} />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-balance">
              Moderar <span className="gradient-text">Avaliações</span>
            </h1>
            <p className="text-muted-foreground mt-2">
              Aprove, oculte ou exclua avaliações de produtos e serviços.
            </p>
          </div>
          <ReviewsModeration />
        </div>
      </main>
    </div>
  )
}
