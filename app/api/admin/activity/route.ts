import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { RecentActivity } from '@/lib/admin/admin-service'

export async function GET() {
  try {
    const activities: RecentActivity[] = []
    
    // Buscar usuários recentes (últimas 5 horas)
    const fiveHoursAgo = new Date()
    fiveHoursAgo.setHours(fiveHoursAgo.getHours() - 5)
    
    const { data: recentUsers } = await supabaseAdmin
      .from('users')
      .select(`
        id,
        email,
        created_at,
        profiles!inner(first_name, last_name)
      `)
      .gte('created_at', fiveHoursAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(3)
    
    if (recentUsers) {
      recentUsers.forEach(user => {
        const profile = Array.isArray(user.profiles) ? user.profiles[0] : user.profiles
        activities.push({
          id: `user_${user.id}`,
          type: 'user_registered',
          description: `Novo usuário registrado`,
          timestamp: user.created_at,
          user: {
            name: profile ? `${profile.first_name} ${profile.last_name}` : 'Usuário',
            email: user.email
          }
        })
      })
    }
    
    // Buscar matches recentes
    const { data: recentMatches } = await supabaseAdmin
      .from('matches')
      .select(`
        id,
        user1_id,
        user2_id,
        created_at,
        status
      `)
      .eq('status', 'mutual_like')
      .gte('created_at', fiveHoursAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(2)
    
    if (recentMatches) {
      recentMatches.forEach(match => {
        activities.push({
          id: `match_${match.id}`,
          type: 'match_created',
          description: `Match realizado`,
          timestamp: match.created_at
        })
      })
    }
    
    // Buscar reportes recentes (simulado por enquanto)
    const oneHourAgo = new Date()
    oneHourAgo.setHours(oneHourAgo.getHours() - 1)
    
    activities.push({
      id: 'report_sim_1',
      type: 'report_created',
      description: 'Reporte pendente',
      timestamp: oneHourAgo.toISOString(),
      user: {
        name: 'João Santos'
      }
    })
    
    // Ordenar por timestamp (mais recente primeiro)
    const sortedActivities = activities.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    ).slice(0, 3)
    
    return NextResponse.json(sortedActivities)
    
  } catch (error) {
    console.error('Erro ao buscar atividades recentes:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 