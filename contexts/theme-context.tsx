"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"

type Theme = "light" | "dark"

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark")

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as Theme
    console.log("[v0] Loading saved theme:", savedTheme)
    if (savedTheme) {
      setTheme(savedTheme)
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      console.log("[v0] System prefers dark mode")
      setTheme("dark")
    }
  }, [])

  useEffect(() => {
    console.log("[v0] Applying theme:", theme)
    const root = document.documentElement

    if (theme === "dark") {
      root.classList.add("dark")
    } else {
      root.classList.remove("dark")
    }
    localStorage.setItem("theme", theme)
  }, [theme])

  const toggleTheme = () => {
    console.log("[v0] Theme toggle clicked, current theme:", theme)
    setTheme((prev) => (prev === "light" ? "dark" : "light"))
  }

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
