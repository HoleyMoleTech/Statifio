import { redirect } from "next/navigation"

// Redirect admin root to users page
export default function AdminPage() {
  redirect("/admin/users")
}
