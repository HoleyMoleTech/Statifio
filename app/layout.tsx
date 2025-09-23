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
  variable: "--font-sans",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: "Statifio - Sports Statistics",
  description: "Your ultimate destination for eSports and football statistics",
  generator: "v0.app",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icon-192.png", sizes: "192x192", type: "image/png" }],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}>
      <body className="font-sans antialiased">
        <ThemeProvider>
          <ProfileProvider>
            <NavigationProvider>
              <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
            </NavigationProvider>
          </ProfileProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
