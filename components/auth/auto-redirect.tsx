"use client"

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface SessionUser {
  id?: string
  email?: string | null
  name?: string | null
  image?: string | null
  role?: string
}

interface AutoRedirectProps {
  /** Whether to show loading indicator during redirect */
  showLoading?: boolean
  /** Custom redirect logic - if provided, overrides default role-based logic */
  customRedirect?: (userRole: string) => string
  /** Only redirect if user has specific roles */
  onlyForRoles?: string[]
}

export function AutoRedirect({ 
  showLoading = true,
  customRedirect,
  onlyForRoles 
}: AutoRedirectProps) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    // Only proceed if session is loaded and user is authenticated
    if (status === 'loading') return
    if (status === 'unauthenticated' || !session?.user) return

    const user = session.user as SessionUser
    const userRole = user.role || 'user'

    console.log('🔄 [AUTO-REDIRECT] Verificando redirecionamento automático:', {
      userEmail: user.email,
      userRole,
      onlyForRoles,
      hasCustomRedirect: !!customRedirect
    })

    // If specific roles are required and user doesn't have them, don't redirect
    if (onlyForRoles && !onlyForRoles.includes(userRole)) {
      console.log('🚫 [AUTO-REDIRECT] Role não está na lista permitida, não redirecionando')
      return
    }

    let redirectUrl: string

    if (customRedirect) {
      redirectUrl = customRedirect(userRole)
    } else {
      // Default role-based redirect logic
      switch (userRole) {
        case 'admin':
          redirectUrl = '/admin'
          break
        case 'therapist':
          redirectUrl = '/dashboard'
          break
        case 'user':
        default:
          // For regular users on home page, no redirect needed
          return
      }
    }

    console.log('🚀 [AUTO-REDIRECT] Redirecionando para:', redirectUrl)
    router.push(redirectUrl)
  }, [session, status, router, customRedirect, onlyForRoles])

  // Show loading indicator if requested and redirect is in progress
  if (showLoading && status === 'authenticated' && session?.user) {
    const user = session.user as SessionUser
    const userRole = user.role || 'user'
    
    // Only show loading for roles that will be redirected
    const willRedirect = onlyForRoles 
      ? onlyForRoles.includes(userRole)
      : userRole === 'admin' || userRole === 'therapist'

    if (willRedirect) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center space-y-4">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
            <p className="text-gray-600">Redirecionando para seu painel...</p>
          </div>
        </div>
      )
    }
  }

  return null
}

/**
 * Hook for programmatic role-based redirects
 */
export function useRoleRedirect() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const redirectByRole = (fallbackUrl = '/') => {
    if (status === 'loading' || !session?.user) return

    const user = session.user as SessionUser
    const userRole = user.role || 'user'

    console.log('🎯 [USE-ROLE-REDIRECT] Redirecionando por role:', userRole)

    switch (userRole) {
      case 'admin':
        router.push('/admin')
        break
      case 'therapist':
        router.push('/dashboard')
        break
      case 'user':
      default:
        router.push(fallbackUrl)
        break
    }
  }

  return { redirectByRole, userRole: (session?.user as SessionUser)?.role }
} 