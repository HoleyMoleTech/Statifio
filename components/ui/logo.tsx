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
      <div className={cn("relative flex-shrink-0", sizeClasses[size])}>
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <circle cx="50" cy="50" r="45" fill="currentColor" className="text-primary" />
          <path
            d="M30 50 L45 35 L60 50 L45 65 Z M55 35 L70 50 L55 65 L70 50 Z"
            fill="currentColor"
            className="text-primary-foreground"
          />
        </svg>
      </div>
      {showText && <span className={cn(textSizeClasses[size], "text-foreground")}>Statifio</span>}
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="inline-flex">
        {logoContent}
      </Link>
    )
  }

  return logoContent
}
