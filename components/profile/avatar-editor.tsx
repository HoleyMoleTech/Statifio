"use client"

import type React from "react"

import { useState, useRef, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { ZoomIn, ZoomOut, RotateCcw, Check, X, Move } from "lucide-react"
import { toast } from "sonner"

interface AvatarEditorProps {
  imageFile: File
  onSave: (croppedBlob: Blob) => void
  onCancel: () => void
}

interface CropArea {
  x: number
  y: number
  width: number
  height: number
}

export function AvatarEditor({ imageFile, onSave, onCancel }: AvatarEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const [imageLoaded, setImageLoaded] = useState(false)
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [imageUrl, setImageUrl] = useState<string>("")

  // Load image
  useEffect(() => {
    const url = URL.createObjectURL(imageFile)
    setImageUrl(url)

    return () => {
      URL.revokeObjectURL(url)
    }
  }, [imageFile])

  // Initialize canvas when image loads
  const handleImageLoad = useCallback(() => {
    const image = imageRef.current
    const canvas = canvasRef.current
    if (!image || !canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size to square (300x300 for editing)
    canvas.width = 300
    canvas.height = 300

    // Calculate initial scale to fit image
    const imageAspect = image.naturalWidth / image.naturalHeight
    const canvasSize = 300

    if (imageAspect > 1) {
      // Landscape: fit height
      setScale(canvasSize / image.naturalHeight)
    } else {
      // Portrait or square: fit width
      setScale(canvasSize / image.naturalWidth)
    }

    // Center the image
    setPosition({ x: 0, y: 0 })
    setImageLoaded(true)
  }, [])

  // Draw image on canvas
  const drawImage = useCallback(() => {
    const canvas = canvasRef.current
    const image = imageRef.current
    if (!canvas || !image || !imageLoaded) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Calculate scaled dimensions
    const scaledWidth = image.naturalWidth * scale
    const scaledHeight = image.naturalHeight * scale

    // Calculate position (centered + offset)
    const x = (canvas.width - scaledWidth) / 2 + position.x
    const y = (canvas.height - scaledHeight) / 2 + position.y

    // Draw image
    ctx.drawImage(image, x, y, scaledWidth, scaledHeight)

    // Draw crop circle overlay
    ctx.save()
    ctx.globalAlpha = 0.5
    ctx.fillStyle = "black"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Cut out circle
    ctx.globalCompositeOperation = "destination-out"
    ctx.beginPath()
    ctx.arc(canvas.width / 2, canvas.height / 2, 120, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()

    // Draw circle border
    ctx.strokeStyle = "white"
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(canvas.width / 2, canvas.height / 2, 120, 0, Math.PI * 2)
    ctx.stroke()
  }, [scale, position, imageLoaded])

  // Redraw when scale or position changes
  useEffect(() => {
    drawImage()
  }, [drawImage])

  // Handle mouse events for dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return

    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Handle touch events for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    setIsDragging(true)
    setDragStart({
      x: touch.clientX - position.x,
      y: touch.clientY - position.y,
    })
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return
    e.preventDefault()

    const touch = e.touches[0]
    setPosition({
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y,
    })
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
  }

  // Reset position and scale
  const handleReset = () => {
    setPosition({ x: 0, y: 0 })
    setScale(1)
  }

  // Save cropped image
  const handleSave = async () => {
    const canvas = canvasRef.current
    const image = imageRef.current
    if (!canvas || !image || !imageLoaded) return

    try {
      // Create a new canvas for the final crop
      const cropCanvas = document.createElement("canvas")
      const cropCtx = cropCanvas.getContext("2d")
      if (!cropCtx) return

      // Set final size (240x240 for avatar)
      const finalSize = 240
      cropCanvas.width = finalSize
      cropCanvas.height = finalSize

      // Calculate crop area
      const scaledWidth = image.naturalWidth * scale
      const scaledHeight = image.naturalHeight * scale
      const imageX = (canvas.width - scaledWidth) / 2 + position.x
      const imageY = (canvas.height - scaledHeight) / 2 + position.y

      // Calculate source crop area (circle center is at canvas center)
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      const cropRadius = 120

      // Map crop area back to original image coordinates
      const sourceX = (centerX - cropRadius - imageX) / scale
      const sourceY = (centerY - cropRadius - imageY) / scale
      const sourceSize = (cropRadius * 2) / scale

      // Draw cropped image
      cropCtx.drawImage(image, sourceX, sourceY, sourceSize, sourceSize, 0, 0, finalSize, finalSize)

      // Convert to blob
      cropCanvas.toBlob(
        (blob) => {
          if (blob) {
            onSave(blob)
          } else {
            toast.error("Failed to process image")
          }
        },
        "image/jpeg",
        0.9,
      )
    } catch (error) {
      console.error("[v0] Avatar editor - Save error:", error)
      toast.error("Failed to save avatar")
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-card border">
        <CardHeader className="pb-4">
          <CardTitle className="text-center text-foreground">Edit Avatar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Canvas Container */}
          <div ref={containerRef} className="relative bg-muted rounded-lg overflow-hidden" style={{ aspectRatio: "1" }}>
            <canvas
              ref={canvasRef}
              className="w-full h-full cursor-move"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            />

            {/* Loading state */}
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="space-y-4">
            {/* Zoom Control */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Zoom</span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setScale(Math.max(0.5, scale - 0.1))}
                    disabled={scale <= 0.5}
                  >
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setScale(Math.min(3, scale + 0.1))}
                    disabled={scale >= 3}
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Slider
                value={[scale]}
                onValueChange={(value) => setScale(value[0])}
                min={0.5}
                max={3}
                step={0.1}
                className="w-full"
              />
            </div>

            {/* Instructions */}
            <div className="text-center space-y-1">
              <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
                <Move className="h-4 w-4" />
                Drag to reposition
              </p>
            </div>

            {/* Reset Button */}
            <Button variant="outline" size="sm" onClick={handleReset} className="w-full bg-transparent">
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={onCancel} className="flex-1 bg-transparent">
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!imageLoaded} className="flex-1 bg-primary hover:bg-primary/90">
              <Check className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Hidden image for loading */}
      <img
        ref={imageRef}
        src={imageUrl || "/placeholder.svg"}
        onLoad={handleImageLoad}
        className="hidden"
        alt="Avatar source"
      />
    </div>
  )
}
