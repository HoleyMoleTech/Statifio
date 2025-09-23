"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface User {
  id: string
  email: string
  username: string
  first_name: string
  last_name: string
  is_admin: boolean
  is_premium: boolean
  premium_expires_at: string
}

interface UserEditDialogProps {
  user: User
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UserEditDialog({ user, open, onOpenChange }: UserEditDialogProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    first_name: user.first_name || "",
    last_name: user.last_name || "",
    username: user.username || "",
    is_admin: user.is_admin || false,
    is_premium: user.is_premium || false,
    premium_expires_at: user.premium_expires_at ? new Date(user.premium_expires_at).toISOString().split("T")[0] : "",
  })

  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const updateData: any = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        username: formData.username,
        is_admin: formData.is_admin,
        is_premium: formData.is_premium,
        updated_at: new Date().toISOString(),
      }

      if (formData.premium_expires_at) {
        updateData.premium_expires_at = new Date(formData.premium_expires_at).toISOString()
      }

      const { error } = await supabase.from("users").update(updateData).eq("id", user.id)

      if (error) throw error

      router.refresh()
      onOpenChange(false)
    } catch (error) {
      console.error("Error updating user:", error)
      alert("Failed to update user. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name</Label>
              <Input
                id="first_name"
                value={formData.first_name}
                onChange={(e) => setFormData((prev) => ({ ...prev, first_name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name</Label>
              <Input
                id="last_name"
                value={formData.last_name}
                onChange={(e) => setFormData((prev) => ({ ...prev, last_name: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={formData.username}
              onChange={(e) => setFormData((prev) => ({ ...prev, username: e.target.value }))}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="is_admin">Admin Access</Label>
              <Switch
                id="is_admin"
                checked={formData.is_admin}
                onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, is_admin: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="is_premium">Premium Account</Label>
              <Switch
                id="is_premium"
                checked={formData.is_premium}
                onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, is_premium: checked }))}
              />
            </div>

            {formData.is_premium && (
              <div className="space-y-2">
                <Label htmlFor="premium_expires_at">Premium Expires</Label>
                <Input
                  id="premium_expires_at"
                  type="date"
                  value={formData.premium_expires_at}
                  onChange={(e) => setFormData((prev) => ({ ...prev, premium_expires_at: e.target.value }))}
                />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
