import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Finally Terapeuta - Painel do Terapeuta",
  description: "Painel para terapeutas da plataforma Finally",
}

export default function TherapistLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <>{children}</>
}
