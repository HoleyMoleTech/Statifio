import { AdminNav } from "@/components/admin/admin-nav"
import { AdminSecurityMonitor } from "@/components/admin/admin-security-monitor"

export default function AdminSecurityPage() {
  return (
    <div className="space-y-6">
      <AdminNav />

      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Security Monitor</h2>
        <p className="text-muted-foreground">Monitor system security, access logs, and potential threats</p>
      </div>

      <AdminSecurityMonitor />
    </div>
  )
}
