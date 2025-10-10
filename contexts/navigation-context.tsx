"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"

interface NavigationContextType {
  currentPage: string
  isLoading: boolean
  navigateTo: (path: string) => void
  setLoading: (loading: boolean) => void
  navigationHistory: string[]
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined)

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [currentPage, setCurrentPage] = useState("/")
  const [isLoading, setIsLoading] = useState(false)
  const [navigationHistory, setNavigationHistory] = useState<string[]>([])
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    setCurrentPage(pathname)
    setNavigationHistory((prev) => {
      const newHistory = [...prev]
      if (newHistory[newHistory.length - 1] !== pathname) {
        newHistory.push(pathname)
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
        navigationHistory,
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
