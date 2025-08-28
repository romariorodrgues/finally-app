import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Criar resposta que limpa todos os cookies de sessão
    const response = NextResponse.json({ 
      success: true, 
      message: 'Logout forçado executado' 
    })

    // Limpar todos os cookies relacionados ao NextAuth
    const cookiesToClear = [
      'next-auth.session-token',
      '__Secure-next-auth.session-token',
      'next-auth.csrf-token',
      '__Host-next-auth.csrf-token',
      'next-auth.callback-url',
      '__Secure-next-auth.callback-url'
    ]

    cookiesToClear.forEach(cookieName => {
      response.cookies.set(cookieName, '', { 
        expires: new Date(0),
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'lax'
      })
    })

    console.log('🔄 [FORCE-LOGOUT] Cookies de sessão limpos')

    return response

  } catch (error) {
    console.error('🔄 [FORCE-LOGOUT] Erro:', error)
    return NextResponse.json({
      error: 'Erro ao fazer logout',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}
