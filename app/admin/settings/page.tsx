import { AdminNav } from "@/components/admin/admin-nav"
import { ApiKeyManagement } from "@/components/admin/api-key-management"

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <AdminNav />
      <ApiKeyManagement />
    </div>
  )
}
