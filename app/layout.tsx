import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Victory Mode - ADHD Productivity Tool",
  description: "Transform your thoughts into actionable plans. Built for minds that think differently.",
  manifest: "/manifest.json",
  themeColor: "#8B5CF6",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
  robots: "index, follow",
  authors: [{ name: "Victory Mode Team" }],
  creator: "Victory Mode",
  publisher: "Victory Mode",
  keywords: ["productivity", "ADHD", "focus", "tasks", "planning", "organization"],
  openGraph: {
    title: "Victory Mode - ADHD Productivity Tool",
    description: "Transform your thoughts into actionable plans. Built for minds that think differently.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Victory Mode - ADHD Productivity Tool",
    description: "Transform your thoughts into actionable plans. Built for minds that think differently.",
  },
  verification: {
    other: {
      "mobile-web-app-capable": "yes",
      "apple-mobile-web-app-capable": "yes",
      "apple-mobile-web-app-status-bar-style": "default",
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="robots" content="index, follow" />
        <meta name="googlebot" content="index, follow" />
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-Frame-Options" content="DENY" />
        <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
        <meta name="referrer" content="strict-origin-when-cross-origin" />
        <link rel="canonical" href="https://victory-mode.vercel.app" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
