"use client"

import { useSession, signOut as nextAuthSignOut } from 'next-auth/react'
import { useCallback, useMemo } from 'react'

interface User {
  id: string
  email?: string | null
  name?: string | null
  image?: string | null
  role?: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
  isAdmin: boolean
  isTherapist: boolean
  hasRole: (role: string) => boolean
}

export function useAuth(): AuthContextType {
  const { data: session, status } = useSession()

  // Memoize user data to prevent oscillation
  const userState = useMemo(() => {
    const sessionUser = session?.user as (User & { role?: string }) | undefined
    const userRole = sessionUser?.role || 'user'
    const loading = status === 'loading'

    return {
      sessionUser,
      userRole,
      loading
    }
  }, [session, status])

  const signOut = useCallback(async () => {
    await nextAuthSignOut({
      callbackUrl: '/auth/login'
    })
  }, [])

  const hasRole = useCallback((role: string): boolean => {
    const result = userState.userRole === role
    return result
  }, [userState.userRole])

  const isAdmin = useMemo(() => hasRole('admin'), [hasRole])
  const isTherapist = useMemo(() => hasRole('therapist'), [hasRole])

  const user = useMemo(() => {
    if (!userState.sessionUser) return null
    
    return {
      id: userState.sessionUser.id || '',
      email: userState.sessionUser.email,
      name: userState.sessionUser.name,
      image: userState.sessionUser.image,
      role: userState.userRole
    }
  }, [userState.sessionUser, userState.userRole])

  return {
    user,
    loading: userState.loading,
    signOut,
    isAdmin,
    isTherapist,
    hasRole
  }
}

// Keep the AuthProvider for backward compatibility
export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>
} 