import { cn } from "@/lib/utils"
import React from "react"

interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span'
  serif?: boolean
  className?: string
  suppressHydrationWarning?: boolean
}

export function Typography({ 
  children, 
  variant = 'p', 
  serif = false, 
  className,
  suppressHydrationWarning = false,
  ...props 
}: TypographyProps) {
  const baseClasses = serif 
    ? "font-serif" 
    : "font-sans"
  
  return React.createElement(
    variant,
    { 
      className: cn(baseClasses, className), 
      suppressHydrationWarning,
      ...props 
    },
    children
  )
} 