import { NextResponse, type NextRequest } from 'next/server'

// Note: Middleware runs on Edge Runtime by default and should not import Better Auth directly
// We'll handle authentication differently in middleware

export async function middleware(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl

    // Check if it's a public route
    const isPublicRoute = 
      pathname.startsWith('/auth/') ||
      pathname.startsWith('/api/auth/') ||
      pathname === '/' ||
      pathname.startsWith('/_next/') ||
      pathname.startsWith('/static/') ||
      pathname.startsWith('/favicon') ||
      pathname.startsWith('/api/test-') ||
      pathname.startsWith('/api/create-test-')

    if (isPublicRoute) {
      return NextResponse.next()
    }

    // Check for session cookie
    const sessionCookie = request.cookies.get('next-auth.session-token') || 
                          request.cookies.get('__Secure-next-auth.session-token')
    
    if (!sessionCookie) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    // Redirect authenticated users away from auth pages
    if (pathname.startsWith('/auth/') && sessionCookie) {
      return NextResponse.redirect(new URL('/', request.url))
    }

    // Allow access to the route
    return NextResponse.next()
    
  } catch (error) {
    console.error('🛡️ [MIDDLEWARE] Erro:', error)
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
} 