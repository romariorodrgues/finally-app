import { createClient } from '@/lib/supabase/server'
import { MatchService } from '@/lib/matches/match-service'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ 
        success: false, 
        error: 'Usuário não autenticado' 
      }, { status: 401 })
    }

    const { matchId, action } = await request.json()
    
    // Validar parâmetros
    if (!matchId || !action) {
      return NextResponse.json({ 
        success: false, 
        error: 'Parâmetros inválidos' 
      }, { status: 400 })
    }

    // Validar ação
    const validActions = ['like', 'pass', 'super_like']
    if (!validActions.includes(action)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Ação inválida' 
      }, { status: 400 })
    }

    // Registrar ação do usuário
    const result = await MatchService.recordUserAction(user.id, matchId, action)
    
    return NextResponse.json(result)
    
  } catch (error) {
    console.error('Erro na API de ação de match:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Erro interno do servidor'
    
    return NextResponse.json({ 
      success: false, 
      error: errorMessage 
    }, { status: 500 })
  }
} 