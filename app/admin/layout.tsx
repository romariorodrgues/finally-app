import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Finally Admin - Admin Panel",
  description: "Finally platform administrative panel",
}

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <>{children}</>
}
