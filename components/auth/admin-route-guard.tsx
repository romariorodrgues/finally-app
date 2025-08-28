"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Shield, AlertTriangle } from 'lucide-react'

interface AdminRouteGuardProps {
  children: React.ReactNode
  fallbackUrl?: string
}

interface SessionUser {
  id?: string
  email?: string | null
  name?: string | null
  image?: string | null
  role?: string
}

export function AdminRouteGuard({ children, fallbackUrl = '/' }: AdminRouteGuardProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)

  useEffect(() => {
    const sessionUser = session?.user as SessionUser | undefined
    
    console.log('🛡️ [ADMIN-GUARD] Full session data:', session)
    console.log('🛡️ [ADMIN-GUARD] Checking authorization:', { 
      status, 
      userEmail: sessionUser?.email,
      userRole: sessionUser?.role,
      userId: sessionUser?.id,
      userName: sessionUser?.name
    })

    if (status === 'loading') {
      console.log('🛡️ [ADMIN-GUARD] Still loading session...')
      return // Still loading, don't make decisions yet
    }

    if (status === 'unauthenticated' || !session?.user) {
      console.log('❌ [ADMIN-GUARD] User not authenticated, redirecting to login')
      router.replace('/auth/login')
      return
    }

    const userRole = sessionUser?.role
    console.log('🛡️ [ADMIN-GUARD] User role check:', userRole)
    
    if (userRole === 'admin') {
      console.log('✅ [ADMIN-GUARD] Admin access granted')
      setIsAuthorized(true)
    } else {
      console.log('❌ [ADMIN-GUARD] Insufficient permissions, redirecting to:', fallbackUrl)
      setIsAuthorized(false)
      router.replace(fallbackUrl)
    }
  }, [session, status, router, fallbackUrl])

  // Loading state
  if (status === 'loading' || isAuthorized === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-rose-50">
        <div className="text-center">
          <Shield className="h-12 w-12 text-[#CBA415] mx-auto mb-4 animate-pulse" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Verificando Permissões</h2>
          <p className="text-gray-600">Aguarde enquanto verificamos suas credenciais...</p>
        </div>
      </div>
    )
  }

  // Access denied
  if (isAuthorized === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-rose-50">
        <div className="text-center max-w-md mx-auto px-6">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Acesso Negado</h2>
          <p className="text-gray-600 mb-6">
            Você não tem permissão para acessar esta área. Esta seção é restrita a administradores.
          </p>
          <div className="text-sm text-gray-500">
            Redirecionando em alguns segundos...
          </div>
        </div>
      </div>
    )
  }

  // Access granted
  return <>{children}</>
} 