import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl" | "2xl"
  showText?: boolean
  className?: string
  href?: string
}

const sizeClasses = {
  sm: "w-6 h-6",
  md: "w-8 h-8",
  lg: "w-12 h-12",
  xl: "w-16 h-16",
  "2xl": "w-20 h-20",
}

const textSizeClasses = {
  sm: "text-sm",
  md: "text-lg",
  lg: "text-xl",
  xl: "text-2xl",
  "2xl": "text-3xl",
}

const gapClasses = {
  sm: "gap-1.5",
  md: "gap-2",
  lg: "gap-2",
  xl: "gap-2",
  "2xl": "gap-1.5", // Closer spacing for larger logo
}

export function Logo({ size = "md", showText = true, className, href = "/" }: LogoProps) {
  const logoContent = (
    <div className={cn("flex items-center", gapClasses[size], className)}>
      <Image
        src="/statifio-logo.png"
        alt="Statifio Logo"
        width={80}
        height={80}
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
