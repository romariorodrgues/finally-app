import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Instruir o navegador a limpar os cookies e recarregar
    const response = NextResponse.json({ 
      success: true, 
      message: 'Tokens invalidados. Recarregue a página.',
      action: 'reload'
    })

    // Forçar expiração dos tokens JWT
    const cookiesToClear = [
      'next-auth.session-token',
      '__Secure-next-auth.session-token',
      'next-auth.csrf-token',
      '__Host-next-auth.csrf-token'
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

    console.log('🔄 [INVALIDATE-TOKENS] Tokens JWT invalidados')

    return response

  } catch (error) {
    console.error('🔄 [INVALIDATE-TOKENS] Erro:', error)
    return NextResponse.json({
      error: 'Erro ao invalidar tokens',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}
