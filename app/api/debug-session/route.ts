import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    // Verificar sessão do NextAuth
    const session = await getServerSession()
    
    console.log('🔍 [DEBUG-SESSION] Sessão atual:', session)
    
    if (!session?.user?.email) {
      return NextResponse.json({
        error: 'Usuário não autenticado',
        session: null
      }, { status: 401 })
    }

    // Buscar dados atualizados do usuário no banco
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: userData, error } = await supabase
      .from('users')
      .select('id, email, role, name, email_verified')
      .eq('email', session.user.email)
      .single()

    console.log('🔍 [DEBUG-SESSION] Dados do banco:', userData)
    console.log('🔍 [DEBUG-SESSION] Erro do banco:', error)

    return NextResponse.json({
      session: session,
      userData: userData,
      dbError: error
    })

  } catch (error) {
    console.error('🔍 [DEBUG-SESSION] Erro:', error)
    return NextResponse.json({
      error: 'Erro interno',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}
