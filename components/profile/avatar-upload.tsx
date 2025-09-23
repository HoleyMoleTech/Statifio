"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Camera, Trash2, Upload, X } from "lucide-react"
import { toast } from "sonner"

interface AvatarUploadProps {
  currentAvatarUrl?: string
  userInitial: string
  onAvatarChange: (newAvatarUrl: string | null) => void
}

export function AvatarUpload({ currentAvatarUrl, userInitial, onAvatarChange }: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showActions, setShowActions] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    console.log("[v0] Avatar upload - File selected:", file.name, file.type, file.size)

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file")
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB")
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    setIsUploading(true)
    setShowActions(false)

    try {
      const formData = new FormData()
      formData.append("file", file)

      console.log("[v0] Avatar upload - Starting upload to /api/avatar/upload")

      const response = await fetch("/api/avatar/upload", {
        method: "POST",
        body: formData,
      })

      console.log("[v0] Avatar upload - Response status:", response.status)

      if (!response.ok) {
        const error = await response.json()
        console.error("[v0] Avatar upload - Error response:", error)
        throw new Error(error.error || "Upload failed")
      }

      const result = await response.json()
      console.log("[v0] Avatar upload - Success:", result)

      onAvatarChange(result.url)
      setPreviewUrl(null)
      toast.success("Avatar updated successfully!")
    } catch (error) {
      console.error("[v0] Avatar upload - Error:", error)
      setPreviewUrl(null)
      toast.error(error instanceof Error ? error.message : "Failed to upload avatar")
    } finally {
      setIsUploading(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleDeleteAvatar = async () => {
    if (!currentAvatarUrl) return

    setIsDeleting(true)
    setShowActions(false)

    try {
      console.log("[v0] Starting delete request to /api/avatar/delete")

      const response = await fetch("/api/avatar/delete", {
        method: "DELETE",
      })

      console.log("[v0] Delete response status:", response.status)

      if (!response.ok) {
        const error = await response.json()
        console.error("[v0] Delete error response:", error)
        throw new Error(error.error || "Delete failed")
      }

      console.log("[v0] Delete success")
      onAvatarChange(null)
      toast.success("Avatar removed successfully!")
    } catch (error) {
      console.error("[v0] Delete error:", error)
      toast.error(error instanceof Error ? error.message : "Failed to remove avatar")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleAvatarClick = () => {
    setShowActions(!showActions)
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
    setShowActions(false)
  }

  return (
    <div className="relative">
      {/* Avatar Display */}
      <div className="relative">
        <button onClick={handleAvatarClick} className="relative group" disabled={isUploading || isDeleting}>
          <Avatar className="h-20 w-20 border-2 border-border">
            <AvatarImage src={previewUrl || currentAvatarUrl || "/placeholder.svg"} />
            <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">{userInitial}</AvatarFallback>
          </Avatar>

          {/* Camera overlay */}
          <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera className="h-6 w-6 text-white" />
          </div>

          {/* Loading overlay */}
          {(isUploading || isDeleting) && (
            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent" />
            </div>
          )}
        </button>
      </div>

      {/* Action Menu */}
      {showActions && (
        <Card className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 z-10 min-w-[200px]">
          <CardContent className="p-2">
            <div className="space-y-1">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                onClick={handleUploadClick}
                disabled={isUploading || isDeleting}
              >
                <Upload className="h-4 w-4 mr-2" />
                {currentAvatarUrl ? "Change Avatar" : "Upload Avatar"}
              </Button>

              {currentAvatarUrl && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-destructive hover:text-destructive"
                  onClick={handleDeleteAvatar}
                  disabled={isUploading || isDeleting}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remove Avatar
                </Button>
              )}

              <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => setShowActions(false)}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Hidden file input */}
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />

      {/* Instructions */}
      <p className="text-xs text-muted-foreground text-center mt-2">
        Click avatar to {currentAvatarUrl ? "change or remove" : "upload"}
      </p>
    </div>
  )
}
