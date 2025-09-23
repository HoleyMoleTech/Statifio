import { createClient } from "@/lib/supabase/server"
import { UserManagementTable } from "@/components/admin/user-management-table"
import { AdminNav } from "@/components/admin/admin-nav"

export default async function AdminUsersPage() {
  const supabase = await createClient()

  // Fetch all users with their payment info
  const { data: users, error } = await supabase
    .from("users")
    .select(`
      *,
      payments(
        id,
        amount,
        status,
        created_at
      )
    `)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching users:", error)
    return (
      <div className="text-center py-8">
        <p className="text-destructive">Error loading users. Please try again.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <AdminNav />

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">User Management</h2>
          <p className="text-muted-foreground">Manage user accounts, permissions, and premium subscriptions</p>
        </div>
      </div>

      <div className="bg-card rounded-lg border p-6">
        <UserManagementTable users={users || []} />
      </div>
    </div>
  )
}
