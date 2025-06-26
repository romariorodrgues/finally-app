import type { Metadata } from "next"
import "./globals.css"
import { Inter, Playfair_Display } from "next/font/google"
import { AuthProvider } from "@/components/providers/auth-provider"
import { Header } from "@/components/layout/header"

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
  display: 'swap',
})

const playfairDisplay = Playfair_Display({ 
  subsets: ["latin"],
  variable: "--font-serif",
  display: 'swap',
})

export const metadata: Metadata = {
  title: "Finally - Where true love begins",
  description: "Dating platform with AI compatibility analysis and therapist marketplace.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfairDisplay.variable}`}>
      <body className={inter.className} suppressHydrationWarning={true}>
        <AuthProvider>
          <div className="min-h-screen bg-gradient-to-br from-slate-50 to-rose-50">
            <Header />
            <main className="pb-20 md:pb-8">
              {children}
            </main>
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}
