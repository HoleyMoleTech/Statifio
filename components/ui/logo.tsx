import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl"
  showText?: boolean
  className?: string
  href?: string
}

const sizeClasses = {
  sm: "w-6 h-6",
  md: "w-8 h-8",
  lg: "w-12 h-12",
  xl: "w-16 h-16",
}

const textSizeClasses = {
  sm: "text-sm",
  md: "text-lg",
  lg: "text-xl",
  xl: "text-2xl",
}

export function Logo({ size = "md", showText = true, className, href = "/" }: LogoProps) {
  const logoContent = (
    <div className={cn("flex items-center gap-2", className)}>
      <Image
        src="/statifio-logo.png"
        alt="Statifio Logo"
        width={64}
        height={64}
        className={cn("object-contain", sizeClasses[size])}
      />
      {showText && <span className={cn("font-bold text-foreground", textSizeClasses[size])}>Statifio</span>}
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="hover:opacity-80 transition-opacity">
        {logoContent}
      </Link>
    )
  }

  return logoContent
}
