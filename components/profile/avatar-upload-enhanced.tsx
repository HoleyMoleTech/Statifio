"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Camera, Trash2, Upload, X, ImageIcon } from "lucide-react"
import { toast } from "sonner"
import { AvatarEditor } from "./avatar-editor"

interface AvatarUploadEnhancedProps {
  currentAvatarUrl?: string
  userInitial: string
  onAvatarChange: (newAvatarUrl: string | null) => void
}

export function AvatarUploadEnhanced({ currentAvatarUrl, userInitial, onAvatarChange }: AvatarUploadEnhancedProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showActions, setShowActions] = useState(false)
  const [showEditor, setShowEditor] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): boolean => {
    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file")
      return false
    }

    // Validate file size (max 10MB for editing)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB")
      return false
    }

    return true
  }

  const handleFileSelect = (file: File) => {
    console.log("[v0] Avatar upload - File selected:", file.name, file.type, file.size)

    if (!validateFile(file)) return

    setSelectedFile(file)
    setShowEditor(true)
    setShowActions(false)
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    setDragOver(false)

    const file = event.dataTransfer.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault()
    setDragOver(false)
  }

  const handleEditorSave = async (croppedBlob: Blob) => {
    setIsUploading(true)
    setShowEditor(false)

    try {
      const formData = new FormData()
      formData.append("file", croppedBlob, "avatar.jpg")

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
      toast.success("Avatar updated successfully!")
    } catch (error) {
      console.error("[v0] Avatar upload - Error:", error)
      toast.error(error instanceof Error ? error.message : "Failed to upload avatar")
    } finally {
      setIsUploading(false)
      setSelectedFile(null)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleEditorCancel = () => {
    setShowEditor(false)
    setSelectedFile(null)
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
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
    <>
      <div className="relative">
        {/* Avatar Display */}
        <div className="relative">
          <button onClick={handleAvatarClick} className="relative group" disabled={isUploading || isDeleting}>
            <Avatar className="h-20 w-20 border-2 border-border">
              <AvatarImage src={currentAvatarUrl || "/placeholder.svg"} />
              <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
                {userInitial}
              </AvatarFallback>
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

                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setShowActions(false)}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Drag and Drop Area (when no avatar) */}
        {!currentAvatarUrl && !showActions && (
          <div
            className={`mt-4 border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
              dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={handleUploadClick}
          >
            <ImageIcon className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Drag & drop an image or click to browse</p>
            <p className="text-xs text-muted-foreground mt-1">Supports JPG, PNG up to 10MB</p>
          </div>
        )}

        {/* Hidden file input */}
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleInputChange} className="hidden" />

        {/* Instructions */}
        <p className="text-xs text-muted-foreground text-center mt-2">
          Click avatar to {currentAvatarUrl ? "change or remove" : "upload"}
        </p>
      </div>

      {/* Avatar Editor Modal */}
      {showEditor && selectedFile && (
        <AvatarEditor imageFile={selectedFile} onSave={handleEditorSave} onCancel={handleEditorCancel} />
      )}
    </>
  )
}
