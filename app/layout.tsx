import type React from "react"
import type { Metadata } from "next"
import { Suspense } from "react"
import { ThemeProvider } from "@/contexts/theme-context"
import { ProfileProvider } from "@/contexts/profile-context"
import { NavigationProvider } from "@/contexts/navigation-context"
import { Inter, JetBrains_Mono } from "next/font/google"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
})

export const metadata: Metadata = {
  title: "Statifio - Sports Statistics",
  description: "Your ultimate destination for eSports and football statistics",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icon-192.png", sizes: "192x192", type: "image/png" }],
  },
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider>
          <NavigationProvider>
            <ProfileProvider>
              <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
            </ProfileProvider>
          </NavigationProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
