import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { MatchService } from '@/lib/matches/match-service'

export async function POST(request: NextRequest) {
  try {
    const supabase = supabaseAdmin
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ 
        success: false, 
        error: 'Usuário não autenticado' 
      }, { status: 401 })
    }

    // Verificar se é admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ 
        success: false, 
        error: 'Acesso negado - apenas administradores' 
      }, { status: 403 })
    }

    const { matchId, adminUserId } = await request.json()
    
    // Validar parâmetros
    if (!matchId || !adminUserId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Parâmetros inválidos' 
      }, { status: 400 })
    }

    // Aprovar match
    const result = await MatchService.approveMatch(matchId, adminUserId)
    
    return NextResponse.json(result)
    
  } catch (error) {
    console.error('Erro na API de aprovação de match:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Erro interno do servidor'
    
    return NextResponse.json({ 
      success: false, 
      error: errorMessage 
    }, { status: 500 })
  }
} 