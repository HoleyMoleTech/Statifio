"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"

interface NavigationContextType {
  currentPage: string
  isLoading: boolean
  navigateTo: (path: string) => void
  setLoading: (loading: boolean) => void
  navigationHistory: string[] // Added navigation history tracking
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined)

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [currentPage, setCurrentPage] = useState("/")
  const [isLoading, setIsLoading] = useState(false)
  const [navigationHistory, setNavigationHistory] = useState<string[]>([]) // Track navigation history
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    setCurrentPage(pathname)
    setNavigationHistory((prev) => {
      const newHistory = [...prev]
      if (newHistory[newHistory.length - 1] !== pathname) {
        newHistory.push(pathname)
        // Keep only last 10 entries to prevent memory issues
        return newHistory.slice(-10)
      }
      return newHistory
    })
  }, [pathname])

  const navigateTo = (path: string) => {
    if (path === currentPage) return

    console.log("[v0] Navigation: Starting navigation to", path, "from", currentPage)
    setIsLoading(true)

    setTimeout(() => {
      router.push(path)
      // Loading state will be cleared by the pathname useEffect
      setTimeout(() => setIsLoading(false), 100)
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
        navigationHistory, // Expose navigation history
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
