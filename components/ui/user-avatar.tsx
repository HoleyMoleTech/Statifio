"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { memo } from "react"

interface UserAvatarProps {
  avatarUrl?: string | null
  userInitial: string
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
}

const sizeClasses = {
  sm: "h-6 w-6 text-xs",
  md: "h-8 w-8 text-sm",
  lg: "h-10 w-10 text-base",
  xl: "h-16 w-16 text-lg",
}

export const UserAvatar = memo(function UserAvatar({
  avatarUrl,
  userInitial,
  size = "md",
  className,
}: UserAvatarProps) {
  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      {avatarUrl && avatarUrl !== "/placeholder.svg" && (
        <AvatarImage src={avatarUrl || "/placeholder.svg"} alt={userInitial} />
      )}
      <AvatarFallback>{userInitial}</AvatarFallback>
    </Avatar>
  )
})
