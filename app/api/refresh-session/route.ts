import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Instruir o cliente a recarregar a sessão
    return NextResponse.json({ 
      success: true, 
      message: 'Sessão invalidada. Faça logout e login novamente.',
      action: 'refresh'
    })

  } catch (error) {
    console.error('🔄 [REFRESH-SESSION] Erro:', error)
    return NextResponse.json({
      error: 'Erro ao invalidar sessão',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}
