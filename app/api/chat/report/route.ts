import { createClient } from '@/lib/supabase/server'
import { ChatService } from '@/lib/chat/chat-service'
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

    const { messageId } = await request.json()
    
    // Validar parâmetros
    if (!messageId) {
      return NextResponse.json({ 
        success: false, 
        error: 'ID da mensagem é obrigatório' 
      }, { status: 400 })
    }

    // Denunciar mensagem
    const result = await ChatService.reportMessage(parseInt(messageId))
    
    return NextResponse.json(result)
    
  } catch (error) {
    console.error('Erro na API de denúncia:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Erro interno do servidor'
    
    return NextResponse.json({ 
      success: false, 
      error: errorMessage 
    }, { status: 500 })
  }
} 