import { NextResponse } from 'next/server'
import { getUser } from '@/lib/auth/auth-helpers'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userIdParam = searchParams.get('userId')
    
    console.log('🔍 [USER-ROLE] === INÍCIO DA REQUISIÇÃO ===')
    console.log('🔍 [USER-ROLE] URL da requisição:', request.url)
    console.log('🔍 [USER-ROLE] UserID do parâmetro:', userIdParam)
    console.log('🔍 [USER-ROLE] Headers da requisição:', Object.fromEntries(request.headers.entries()))
    
    // Get current user
    const user = await getUser()
    
    console.log('👤 [USER-ROLE] Resultado do getUser():', user)
    
    if (!user) {
      console.log('❌ [USER-ROLE] Usuário não autenticado')
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      )
    }

    console.log('👤 [USER-ROLE] Usuário encontrado:', { 
      id: user.id, 
      email: user.email,
      name: user.name,
      image: user.image
    })

    // Get user role from database
    const supabase = await createClient()
    
    console.log('🗄️ [USER-ROLE] Fazendo query no Supabase para user ID:', user.id)
    
    const { data: userData, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    console.log('🗄️ [USER-ROLE] Resultado da query:', { userData, error })

    if (error) {
      console.error('❌ [USER-ROLE] Erro ao buscar role:', error)
      return NextResponse.json(
        { role: 'user' }, // Default role
        { status: 200 }
      )
    }

    const role = userData?.role || 'user'
    
    console.log('✅ [USER-ROLE] Role encontrado:', role)
    console.log('🔍 [USER-ROLE] === FIM DA REQUISIÇÃO ===')
    
    return NextResponse.json({
      role,
      userId: user.id
    })

  } catch (error) {
    console.error('💥 [USER-ROLE] Erro interno:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', role: 'user' },
      { status: 500 }
    )
  }
} 