import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = supabaseAdmin
    const body = await request.json()
    const { adminId, notes } = body
    const resolvedParams = await params
    
    const { data, error } = await supabase
      .from('reports')
      .update({
        status: 'dismissed',
        resolved_by: adminId,
        resolution_notes: notes || 'Reporte descartado sem ação necessária',
        updated_at: new Date().toISOString()
      })
      .eq('id', resolvedParams.id)
      .select()
    
    if (error) {
      console.error('Erro ao descartar reporte:', error)
      return NextResponse.json(
        { error: 'Erro ao descartar reporte' },
        { status: 500 }
      )
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