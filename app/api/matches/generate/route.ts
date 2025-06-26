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
        error: 'User not authenticated'
      }, { status: 401 })
    }

    const { userId } = await request.json()
    
    // Check if userId matches authenticated user
    if (userId !== user.id) {
      return NextResponse.json({ 
        success: false, 
        error: 'Access denied'
      }, { status: 403 })
    }

    // Gerar novos matches
    const matches = await MatchService.forceGenerateMatches(userId)
    
    return NextResponse.json({ 
      success: true, 
      matches,
      count: matches.length
    })
    
  } catch (error) {
    console.error('Error in matches generation API:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    
    return NextResponse.json({ 
      success: false, 
      error: errorMessage
    }, { status: 500 })
  }
} 