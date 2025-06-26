import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = supabaseAdmin
    const body = await request.json()
    const { adminId } = body
    const resolvedParams = await params
    
    const { data, error } = await supabase
      .from('matches')
      .update({
        status: 'approved',
        admin_approved_by: adminId,
        admin_approved_at: new Date().toISOString(),
        admin_rejection_reason: null
      })
      .eq('id', resolvedParams.id)
      .select()
    
    if (error) {
      console.error('Erro ao aprovar match:', error)
      return NextResponse.json(
        { error: 'Erro ao aprovar match' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ success: true, match: data[0] })
    
  } catch (error) {
    console.error('Erro interno:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 