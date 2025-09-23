"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Search, Plus, Edit, Trash2, Key, Eye, EyeOff, Copy, AlertTriangle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

interface ApiKey {
  id: string
  name: string
  description: string
  key_type: string
  key_value: string
  is_active: boolean
  environment: string
  created_at: string
  updated_at: string
  last_used_at: string | null
  expires_at: string | null
}

const KEY_TYPES = [
  { value: "stripe", label: "Stripe" },
  { value: "paypal", label: "PayPal" },
  { value: "nexi_secret", label: "Nexi Secret Key" },
  { value: "nexi_checkout", label: "Nexi Checkout Key" },
  { value: "webhook", label: "Webhook" },
  { value: "api", label: "API Key" },
  { value: "oauth", label: "OAuth" },
]

const ENVIRONMENTS = [
  { value: "production", label: "Production" },
  { value: "test", label: "Test" },
  { value: "development", label: "Development" },
]

export function ApiKeyManagement() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingKey, setEditingKey] = useState<ApiKey | null>(null)
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set())
  const { toast } = useToast()

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    key_type: "",
    key_value: "",
    is_active: true,
    environment: "production",
    expires_at: "",
  })

  useEffect(() => {
    fetchApiKeys()
  }, [])

  const fetchApiKeys = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase.from("api_keys").select("*").order("created_at", { ascending: false })

      if (error) throw error
      setApiKeys(data || [])
    } catch (error) {
      console.error("Error fetching API keys:", error)
      toast({
        title: "Error",
        description: "Failed to fetch API keys",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const supabase = createClient()

      if (editingKey) {
        // Update existing key
        const { error } = await supabase
          .from("api_keys")
          .update({
            name: formData.name,
            description: formData.description,
            key_type: formData.key_type,
            key_value: formData.key_value,
            is_active: formData.is_active,
            environment: formData.environment,
            expires_at: formData.expires_at || null,
          })
          .eq("id", editingKey.id)

        if (error) throw error

        toast({
          title: "Success",
          description: "API key updated successfully",
        })
      } else {
        // Create new key
        const { error } = await supabase.from("api_keys").insert({
          name: formData.name,
          description: formData.description,
          key_type: formData.key_type,
          key_value: formData.key_value,
          is_active: formData.is_active,
          environment: formData.environment,
          expires_at: formData.expires_at || null,
        })

        if (error) throw error

        toast({
          title: "Success",
          description: "API key created successfully",
        })
      }

      setDialogOpen(false)
      resetForm()
      fetchApiKeys()
    } catch (error) {
      console.error("Error saving API key:", error)
      toast({
        title: "Error",
        description: "Failed to save API key",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this API key? This action cannot be undone.")) {
      return
    }

    try {
      const supabase = createClient()
      const { error } = await supabase.from("api_keys").delete().eq("id", id)

      if (error) throw error

      toast({
        title: "Success",
        description: "API key deleted successfully",
      })

      fetchApiKeys()
    } catch (error) {
      console.error("Error deleting API key:", error)
      toast({
        title: "Error",
        description: "Failed to delete API key",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      key_type: "",
      key_value: "",
      is_active: true,
      environment: "production",
      expires_at: "",
    })
    setEditingKey(null)
  }

  const openEditDialog = (key: ApiKey) => {
    setEditingKey(key)
    setFormData({
      name: key.name,
      description: key.description,
      key_type: key.key_type,
      key_value: key.key_value,
      is_active: key.is_active,
      environment: key.environment,
      expires_at: key.expires_at ? key.expires_at.split("T")[0] : "",
    })
    setDialogOpen(true)
  }

  const toggleKeyVisibility = (keyId: string) => {
    const newVisible = new Set(visibleKeys)
    if (newVisible.has(keyId)) {
      newVisible.delete(keyId)
    } else {
      newVisible.add(keyId)
    }
    setVisibleKeys(newVisible)
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({
        title: "Copied",
        description: "API key copied to clipboard",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      })
    }
  }

  const filteredKeys = apiKeys.filter(
    (key) =>
      key.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      key.key_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      key.environment.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false
    return new Date(expiresAt) < new Date()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="flex items-center gap-2 text-muted-foreground">
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Loading API keys...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">API Key Management</h2>
          <p className="text-muted-foreground">Manage payment system API keys and integrations</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Add API Key
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingKey ? "Edit API Key" : "Add New API Key"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Stripe Production Key"
                  required
                />
              </div>

              <div>
                <Label htmlFor="key_type">Type</Label>
                <Select
                  value={formData.key_type}
                  onValueChange={(value) => setFormData({ ...formData, key_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select key type" />
                  </SelectTrigger>
                  <SelectContent>
                    {KEY_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="environment">Environment</Label>
                <Select
                  value={formData.environment}
                  onValueChange={(value) => setFormData({ ...formData, environment: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ENVIRONMENTS.map((env) => (
                      <SelectItem key={env.value} value={env.value}>
                        {env.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="key_value">API Key Value</Label>
                <Textarea
                  id="key_value"
                  value={formData.key_value}
                  onChange={(e) => setFormData({ ...formData, key_value: e.target.value })}
                  placeholder="Enter the API key value"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional description"
                />
              </div>

              <div>
                <Label htmlFor="expires_at">Expiration Date (Optional)</Label>
                <Input
                  id="expires_at"
                  type="date"
                  value={formData.expires_at}
                  onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  {editingKey ? "Update" : "Create"} API Key
                </Button>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search API keys by name, type, or environment..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Keys</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{apiKeys.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Keys</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{apiKeys.filter((k) => k.is_active).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Production Keys</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{apiKeys.filter((k) => k.environment === "production").length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Expired Keys</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {apiKeys.filter((k) => isExpired(k.expires_at)).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* API Keys List */}
      <div className="space-y-4">
        {filteredKeys.map((key) => (
          <Card key={key.id} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <Key className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-semibold">{key.name}</h3>
                  <Badge variant={key.is_active ? "default" : "secondary"}>
                    {key.is_active ? "Active" : "Inactive"}
                  </Badge>
                  <Badge variant="outline">{key.key_type}</Badge>
                  <Badge variant="outline">{key.environment}</Badge>
                  {isExpired(key.expires_at) && (
                    <Badge variant="destructive">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Expired
                    </Badge>
                  )}
                </div>

                {key.description && <p className="text-sm text-muted-foreground">{key.description}</p>}

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>Created: {formatDate(key.created_at)}</span>
                  {key.expires_at && <span>Expires: {formatDate(key.expires_at)}</span>}
                  {key.last_used_at && <span>Last used: {formatDate(key.last_used_at)}</span>}
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex-1 font-mono text-sm bg-muted p-2 rounded">
                    {visibleKeys.has(key.id) ? key.key_value : "•".repeat(Math.min(key.key_value.length, 40))}
                  </div>
                  <Button variant="outline" size="sm" onClick={() => toggleKeyVisibility(key.id)}>
                    {visibleKeys.has(key.id) ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => copyToClipboard(key.key_value)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-2 ml-4">
                <Button variant="outline" size="sm" onClick={() => openEditDialog(key)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(key.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredKeys.length === 0 && (
        <div className="text-center py-8">
          <Key className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            {searchTerm ? "No API keys found matching your search." : "No API keys configured yet."}
          </p>
        </div>
      )}
    </div>
  )
}
