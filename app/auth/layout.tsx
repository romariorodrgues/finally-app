import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Finally - Acesso",
  description: "Acesse sua conta na plataforma Finally",
}

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-finally p-4">
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  )
}
