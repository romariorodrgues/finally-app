import type { Metadata } from "next"
import "./globals.css"
import { Inter, Playfair_Display } from "next/font/google"
import { AuthProvider } from "@/components/providers/auth-provider"
import { Header } from "@/components/layout/header"
import Image from "next/image"
import bgnature from "@/public/assets/bg-nature.jpg"

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


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfairDisplay.variable}`}>
      <body className={inter.className} suppressHydrationWarning>
        <AuthProvider>
          <div className="relative min-h-screen flex items-center justify-center">

            {/* Fundo com imagem */}
            <Image
              src={bgnature}
              alt="Background nature"
              fill
              priority
              className="object-cover object-center blur-md scale-105 -z-10"
            />
            {/* Camada rosada translúcida */}
            <div className="absolute inset-0 bg-pink-300/40 backdrop-blur-sm"></div>

            {/* Overlay rosado */}
            <div className="absolute inset-0 bg-rose-300/40 -z-10" />

            {/* Conteúdo principal */}
            <main className="relative flex justify-center items-center ">
              <div className="">
                {children}
              </div>
            </main>
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}
