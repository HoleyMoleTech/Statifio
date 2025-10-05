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
  lg: "w-10 h-10 sm:w-12 sm:h-12",
  xl: "w-14 h-14 sm:w-16 sm:h-16",
  "2xl": "w-18 h-18 sm:w-20 sm:h-20",
}

const textSizeClasses = {
  sm: "text-sm font-semibold",
  md: "text-base font-bold",
  lg: "text-lg sm:text-xl font-bold tracking-tight",
  xl: "text-xl sm:text-2xl font-bold tracking-tight",
  "2xl": "text-2xl sm:text-3xl font-bold tracking-tight",
}

const gapClasses = {
  sm: "gap-1.5",
  md: "gap-2",
  lg: "gap-2.5 sm:gap-3",
  xl: "gap-3 sm:gap-3.5",
  "2xl": "gap-3.5 sm:gap-4",
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
        priority
      />
      {showText && <span className={cn("text-foreground whitespace-nowrap", textSizeClasses[size])}>Statifio</span>}
    </div>
  )

  if (href) {
    return (
      <Link
        href={href}
        className="hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-lg"
      >
        {logoContent}
      </Link>
    )
  }

  return logoContent
}
