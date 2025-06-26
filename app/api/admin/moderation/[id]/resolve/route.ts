import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = supabaseAdmin
    const body = await request.json()
    const { adminId, notes, action } = body
    const resolvedParams = await params
    
    const { data, error } = await supabase
      .from('reports')
      .update({
        status: 'resolved',
        resolved_by: adminId,
        resolution_notes: notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', resolvedParams.id)
      .select()
    
    if (error) {
      console.error('Erro ao resolver reporte:', error)
      return NextResponse.json(
        { error: 'Erro ao resolver reporte' },
        { status: 500 }
      )
    }
    
    // Se a ação for banir usuário, atualizar o role do usuário reportado
    if (action === 'ban' && data[0]) {
      const { error: banError } = await supabase
        .from('users')
        .update({ role: 'banned' })
        .eq('id', data[0].reported_user_id)
      
      if (banError) {
        console.error('Erro ao banir usuário:', banError)
      }
    }
    
    return NextResponse.json({ success: true, report: data[0] })
    
  } catch (error) {
    console.error('Erro interno:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 