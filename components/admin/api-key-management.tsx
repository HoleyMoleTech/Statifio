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

const KEY_CATEGORIES = [
  {
    value: "nexi_checkout_live",
    label: "Nexi Checkout Live Keys",
    environment: "Production",
    description: "API keys for Live environment",
  },
  {
    value: "nexi_checkout_test",
    label: "Nexi Checkout Test Keys",
    environment: "Test",
    description: "API keys for Test environment",
  },
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
    category: "",
    secretKey: "",
    checkoutKey: "",
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
        const { error } = await supabase
          .from("api_keys")
          .update({
            name: editingKey.name,
            description: editingKey.description,
            key_type: editingKey.key_type,
            key_value: formData.secretKey || formData.checkoutKey,
            is_active: true,
            environment: formData.category === "nexi_checkout_live" ? "production" : "test",
            expires_at: null,
          })
          .eq("id", editingKey.id)

        if (error) throw error

        toast({
          title: "Success",
          description: "API key updated successfully",
        })
      } else {
        const keysToInsert = []
        const selectedCategory = KEY_CATEGORIES.find((cat) => cat.value === formData.category)
        const environment = selectedCategory?.environment.toLowerCase() === "production" ? "production" : "test"
        const keyPrefix = selectedCategory?.environment === "Production" ? "Nexi Live" : "Nexi Test"

        // Add secret key if provided
        if (formData.secretKey.trim()) {
          keysToInsert.push({
            name: `${keyPrefix} Secret Key`,
            description: `${keyPrefix} payment gateway secret key`,
            key_type: `${formData.category}_secret`,
            key_value: formData.secretKey,
            is_active: true,
            environment,
            expires_at: null,
          })
        }

        // Add checkout key if provided
        if (formData.checkoutKey.trim()) {
          keysToInsert.push({
            name: `${keyPrefix} Checkout Key`,
            description: `${keyPrefix} payment gateway checkout key`,
            key_type: `${formData.category}_checkout`,
            key_value: formData.checkoutKey,
            is_active: true,
            environment,
            expires_at: null,
          })
        }

        if (keysToInsert.length === 0) {
          toast({
            title: "Error",
            description: "Please provide at least one API key value",
            variant: "destructive",
          })
          return
        }

        const { error } = await supabase.from("api_keys").insert(keysToInsert)

        if (error) throw error

        toast({
          title: "Success",
          description: `${keysToInsert.length} API key(s) created successfully`,
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
      category: "",
      secretKey: "",
      checkoutKey: "",
    })
    setEditingKey(null)
  }

  const openEditDialog = (key: ApiKey) => {
    setEditingKey(key)

    const keyTypeParts = key.key_type.split("_")
    const mainKeyType = keyTypeParts.slice(0, -1).join("_") // Everything except last part
    const subKeyType = keyTypeParts[keyTypeParts.length - 1] // Last part

    setFormData({
      category: mainKeyType,
      secretKey: subKeyType === "secret" ? key.key_value : "",
      checkoutKey: subKeyType === "checkout" ? key.key_value : "",
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

  const formatKeyTypeDisplay = (keyType: string) => {
    const typeMap: { [key: string]: string } = {
      nexi_checkout_live_secret: "Nexi Live Secret Key",
      nexi_checkout_live_checkout: "Nexi Live Checkout Key",
      nexi_checkout_test_secret: "Nexi Test Secret Key",
      nexi_checkout_test_checkout: "Nexi Test Checkout Key",
    }
    return typeMap[keyType] || keyType
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
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingKey ? "Edit API Key" : "Add New API Key"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                <Label className="text-base font-semibold">Category</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {KEY_CATEGORIES.map((category) => (
                    <div
                      key={category.value}
                      className={`relative cursor-pointer rounded-lg border-2 p-4 transition-all ${
                        formData.category === category.value
                          ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                          : "border-muted hover:border-primary/50 hover:bg-muted/50"
                      }`}
                      onClick={() => setFormData({ ...formData, category: category.value })}
                    >
                      <div className="flex items-start space-x-3">
                        <div
                          className={`mt-1 h-4 w-4 rounded-full border-2 ${
                            formData.category === category.value
                              ? "border-primary bg-primary"
                              : "border-muted-foreground"
                          }`}
                        >
                          {formData.category === category.value && (
                            <div className="h-full w-full rounded-full bg-white scale-50" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-sm">{category.label}</h3>
                          <p className="text-xs text-muted-foreground mt-1">{category.description}</p>
                          <Badge
                            variant={category.environment === "Production" ? "default" : "secondary"}
                            className="mt-2 text-xs"
                          >
                            {category.environment}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {formData.category && !editingKey && (
                <div className="space-y-4 border-t pt-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">API Keys</h3>
                    <Badge variant="outline" className="text-xs">
                      {KEY_CATEGORIES.find((cat) => cat.value === formData.category)?.environment}
                    </Badge>
                  </div>

                  {/* Secret Key - Single Row */}
                  <div className="space-y-2">
                    <Label htmlFor="secret_key" className="flex items-center gap-2 text-sm font-medium">
                      <Key className="h-4 w-4 text-primary" />
                      Secret Key
                    </Label>
                    <Input
                      id="secret_key"
                      type="password"
                      value={formData.secretKey}
                      onChange={(e) => setFormData({ ...formData, secretKey: e.target.value })}
                      placeholder="Enter your secret key"
                      className="font-mono"
                    />
                  </div>

                  {/* Checkout Key - Single Row */}
                  <div className="space-y-2">
                    <Label htmlFor="checkout_key" className="flex items-center gap-2 text-sm font-medium">
                      <Key className="h-4 w-4 text-primary" />
                      Checkout Key
                    </Label>
                    <Input
                      id="checkout_key"
                      type="password"
                      value={formData.checkoutKey}
                      onChange={(e) => setFormData({ ...formData, checkoutKey: e.target.value })}
                      placeholder="Enter your checkout key"
                      className="font-mono"
                    />
                  </div>

                  <div className="text-xs text-muted-foreground p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <strong>Note:</strong> You can add one or both keys. Names and descriptions will be automatically generated based on your selected category.
                  </div>
                </div>
              )}

              {editingKey && (
                <div className="space-y-4 border-t pt-6">
                  <div className="text-sm font-medium">Editing: {formatKeyTypeDisplay(editingKey.key_type)}</div>

                  <div>
                    <Label htmlFor="edit_value">API Key Value</Label>
                    <Textarea
                      id="edit_value"
                      value={formData.secretKey || formData.checkoutKey}
                      onChange={(e) => {
                        const keyType = editingKey.key_type.endsWith("_secret") ? "secretKey" : "checkoutKey"
                        setFormData({ ...formData, [keyType]: e.target.value })
                      }}
                      required
                      className="font-mono text-sm"
                      rows={3}
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1" disabled={!formData.category}>
                  {editingKey ? "Update" : "Create"} API Key
                  {!editingKey && formData.secretKey && formData.checkoutKey ? "s" : ""}
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
                  <Badge variant="outline">{formatKeyTypeDisplay(key.key_type)}</Badge>
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
