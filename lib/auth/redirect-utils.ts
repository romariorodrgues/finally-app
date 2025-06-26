import { getSession } from 'next-auth/react'

interface SessionUser {
  id?: string
  email?: string | null
  name?: string | null
  image?: string | null
  role?: string
}

/**
 * Get the appropriate redirect URL based on user role
 * @param userRole - The role of the authenticated user
 * @returns The URL to redirect to after login
 */
export function getRedirectUrlByRole(userRole?: string): string {
  console.log('🎯 [REDIRECT-UTILS] Determinando URL de redirecionamento para role:', userRole)
  
  switch (userRole) {
    case 'admin':
      console.log('🛡️ [REDIRECT-UTILS] Admin detectado - redirecionando para /admin')
      return '/admin'
    case 'therapist':
      console.log('👩‍⚕️ [REDIRECT-UTILS] Terapeuta detectado - redirecionando para /dashboard')
      return '/dashboard' // ou '/therapy' se preferir
    case 'user':
    default:
      console.log('👤 [REDIRECT-UTILS] Usuário regular - redirecionando para /')
      return '/'
  }
}

/**
 * Handle post-login redirect based on user session
 * @returns Promise that resolves to redirect URL
 */
export async function getPostLoginRedirect(): Promise<string> {
  try {
    console.log('🔍 [REDIRECT-UTILS] Obtendo sessão para determinar redirecionamento...')
    
    const session = await getSession()
    const user = session?.user as SessionUser | undefined
    const userRole = user?.role
    
    console.log('📋 [REDIRECT-UTILS] Dados da sessão:', {
      hasSession: !!session,
      userEmail: user?.email,
      userRole
    })
    
    return getRedirectUrlByRole(userRole)
  } catch (error) {
    console.error('💥 [REDIRECT-UTILS] Erro ao obter sessão:', error)
    return '/' // Fallback para página inicial
  }
}

/**
 * Perform redirect with role-based logic
 * @param userRole - Optional user role (if already known)
 */
export async function performRoleBasedRedirect(userRole?: string): Promise<void> {
  try {
    let redirectUrl: string
    
    if (userRole) {
      // Use provided role
      redirectUrl = getRedirectUrlByRole(userRole)
    } else {
      // Fetch from session
      redirectUrl = await getPostLoginRedirect()
    }
    
    console.log('🚀 [REDIRECT-UTILS] Executando redirecionamento para:', redirectUrl)
    
    // Use window.location for full page reload to ensure session is properly loaded
    window.location.href = redirectUrl
  } catch (error) {
    console.error('💥 [REDIRECT-UTILS] Erro durante redirecionamento:', error)
    window.location.href = '/' // Fallback
  }
} 