import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET() {
  try {
    // Total de usuários
    const { count: totalUsers } = await supabaseAdmin
      .from('users')
      .select('*', { count: 'exact', head: true })
    
    // Total de matches aprovados
    const { count: totalMatches } = await supabaseAdmin
      .from('matches')
      .select('*', { count: 'exact', head: true })
      .in('status', ['mutual_like', 'chat_started'])
    
    // Chats ativos
    const { count: activeChats } = await supabaseAdmin
      .from('chats')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')
    
    // Matches pendentes de aprovação
    const { count: pendingMatches } = await supabaseAdmin
      .from('matches')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending_approval')
    
    // Crescimento no último mês
    const lastMonth = new Date()
    lastMonth.setMonth(lastMonth.getMonth() - 1)
    
    const { count: newUsersThisMonth } = await supabaseAdmin
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', lastMonth.toISOString())
    
    const { count: newMatchesThisMonth } = await supabaseAdmin
      .from('matches')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', lastMonth.toISOString())
      .in('status', ['mutual_like', 'chat_started'])
    
    const { count: newChatsThisMonth } = await supabaseAdmin
      .from('chats')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', lastMonth.toISOString())
    
    // Calcular porcentagens de crescimento
    const usersGrowthPercentage = totalUsers && totalUsers > 0 ? 
      ((newUsersThisMonth || 0) / totalUsers) * 100 : 0
    
    const matchesGrowthPercentage = totalMatches && totalMatches > 0 ?
      ((newMatchesThisMonth || 0) / totalMatches) * 100 : 0
    
    const chatsGrowthPercentage = activeChats && activeChats > 0 ?
      ((newChatsThisMonth || 0) / activeChats) * 100 : 0
    
    const stats = {
      totalUsers: totalUsers || 0,
      totalMatches: totalMatches || 0,
      activeChats: activeChats || 0,
      pendingMatches: pendingMatches || 0,
      recentGrowth: {
        usersGrowth: Math.round(usersGrowthPercentage),
        matchesGrowth: Math.round(matchesGrowthPercentage),
        chatsGrowth: Math.round(chatsGrowthPercentage)
      }
    }
    
    return NextResponse.json(stats)
    
  } catch (error) {
    console.error('Erro ao buscar estatísticas da admin:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
