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

    const { chatId } = await request.json()
    
    // Validar parâmetros
    if (!chatId) {
      return NextResponse.json({ 
        success: false, 
        error: 'ID do chat é obrigatório' 
      }, { status: 400 })
    }

    // Bloquear chat
    const result = await ChatService.blockChat(parseInt(chatId), user.id)
    
    return NextResponse.json(result)
    
  } catch (error) {
    console.error('Erro na API de bloqueio:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Erro interno do servidor'
    
    return NextResponse.json({ 
      success: false, 
      error: errorMessage 
    }, { status: 500 })
  }
} 