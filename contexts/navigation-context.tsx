"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"

interface NavigationContextType {
  currentPage: string
  isLoading: boolean
  navigateTo: (path: string) => void
  setLoading: (loading: boolean) => void
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined)

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [currentPage, setCurrentPage] = useState("/")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    setCurrentPage(pathname)
  }, [pathname])

  const navigateTo = (path: string) => {
    if (path === currentPage) return

    console.log("[v0] Navigation: Starting navigation to", path)
    setIsLoading(true)

    // Add a small delay to show loading state
    setTimeout(() => {
      router.push(path)
      setIsLoading(false)
      console.log("[v0] Navigation: Completed navigation to", path)
    }, 150)
  }

  return (
    <NavigationContext.Provider
      value={{
        currentPage,
        isLoading,
        navigateTo,
        setLoading: setIsLoading,
      }}
    >
      {children}
    </NavigationContext.Provider>
  )
}

export function useNavigation() {
  const context = useContext(NavigationContext)
  if (context === undefined) {
    throw new Error("useNavigation must be used within a NavigationProvider")
  }
  return context
}
