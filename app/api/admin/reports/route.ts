import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Parâmetros opcionais para filtros de data
    const period = searchParams.get('period') || '30' // dias
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - parseInt(period))
    
    // Buscar estatísticas gerais
    const [
      { count: totalUsers },
      { count: totalMatches },
      { count: totalChats },
      { count: totalTherapists },
      { count: premiumUsers },
      { count: verifiedUsers }
    ] = await Promise.all([
      supabaseAdmin.from('users').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('matches').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('chats').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('users').select('*', { count: 'exact', head: true }).eq('role', 'therapist'),
      supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }).eq('is_premium', true),
      supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }).eq('verification_status', 'approved')
    ])
    
    // Buscar dados de crescimento (últimos 30 dias vs 30 dias anteriores)
    const lastMonthStart = new Date()
    lastMonthStart.setDate(lastMonthStart.getDate() - 60)
    const lastMonthEnd = new Date()
    lastMonthEnd.setDate(lastMonthEnd.getDate() - 30)
    
    const [
      { count: usersLastMonth },
      { count: matchesLastMonth },
      { count: chatsLastMonth }
    ] = await Promise.all([
      supabaseAdmin.from('users').select('*', { count: 'exact', head: true })
        .gte('created_at', lastMonthStart.toISOString())
        .lt('created_at', lastMonthEnd.toISOString()),
      supabaseAdmin.from('matches').select('*', { count: 'exact', head: true })
        .gte('created_at', lastMonthStart.toISOString())
        .lt('created_at', lastMonthEnd.toISOString()),
      supabaseAdmin.from('chats').select('*', { count: 'exact', head: true })
        .gte('created_at', lastMonthStart.toISOString())
        .lt('created_at', lastMonthEnd.toISOString())
    ])
    
    const [
      { count: usersThisMonth },
      { count: matchesThisMonth },
      { count: chatsThisMonth }
    ] = await Promise.all([
      supabaseAdmin.from('users').select('*', { count: 'exact', head: true })
        .gte('created_at', lastMonthEnd.toISOString()),
      supabaseAdmin.from('matches').select('*', { count: 'exact', head: true })
        .gte('created_at', lastMonthEnd.toISOString()),
      supabaseAdmin.from('chats').select('*', { count: 'exact', head: true })
        .gte('created_at', lastMonthEnd.toISOString())
    ])
    
    // Calcular taxas de crescimento
    const userGrowthRate = usersLastMonth ? Math.round(((usersThisMonth || 0) - usersLastMonth) / usersLastMonth * 100) : 0
    const matchGrowthRate = matchesLastMonth ? Math.round(((matchesThisMonth || 0) - matchesLastMonth) / matchesLastMonth * 100) : 0
    const chatGrowthRate = chatsLastMonth ? Math.round(((chatsThisMonth || 0) - chatsLastMonth) / chatsLastMonth * 100) : 0
    
    // Buscar distribuição geográfica
    const { data: locationData } = await supabaseAdmin
      .from('profiles')
      .select('location_state')
      .not('location_state', 'is', null)
    
    // Contar distribuição por estado
    const locationStats = locationData?.reduce((acc: Record<string, number>, profile) => {
      const state = profile.location_state
      acc[state] = (acc[state] || 0) + 1
      return acc
    }, {}) || {}
    
    // Ordenar estados por quantidade e pegar top 5
    const topStates = Object.entries(locationStats)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([state, count]) => ({
        state,
        count,
        percentage: totalUsers ? Math.round((count / totalUsers) * 100) : 0
      }))
    
    // Buscar dados de matches por status
    const [
      { count: pendingMatches },
      { count: approvedMatches },
      { count: rejectedMatches },
      { count: mutualLikes }
    ] = await Promise.all([
      supabaseAdmin.from('matches').select('*', { count: 'exact', head: true }).eq('status', 'pending_approval'),
      supabaseAdmin.from('matches').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
      supabaseAdmin.from('matches').select('*', { count: 'exact', head: true }).eq('status', 'rejected'),
      supabaseAdmin.from('matches').select('*', { count: 'exact', head: true }).eq('status', 'mutual_like')
    ])
    
    // Calcular taxa de sucesso (matches mútuos / total de matches aprovados)
    const successRate = approvedMatches ? Math.round(((mutualLikes || 0) / approvedMatches) * 100) : 0
    
    // Buscar dados de atividade por período (últimos 7 dias)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - i)
      return date.toISOString().split('T')[0]
    }).reverse()
    
    const dailyStats = await Promise.all(
      last7Days.map(async (date) => {
        const nextDate = new Date(date)
        nextDate.setDate(nextDate.getDate() + 1)
        
        const [
          { count: newUsers },
          { count: newMatches },
          { count: newChats }
        ] = await Promise.all([
          supabaseAdmin.from('users').select('*', { count: 'exact', head: true })
            .gte('created_at', `${date}T00:00:00.000Z`)
            .lt('created_at', `${nextDate.toISOString().split('T')[0]}T00:00:00.000Z`),
          supabaseAdmin.from('matches').select('*', { count: 'exact', head: true })
            .gte('created_at', `${date}T00:00:00.000Z`)
            .lt('created_at', `${nextDate.toISOString().split('T')[0]}T00:00:00.000Z`),
          supabaseAdmin.from('chats').select('*', { count: 'exact', head: true })
            .gte('created_at', `${date}T00:00:00.000Z`)
            .lt('created_at', `${nextDate.toISOString().split('T')[0]}T00:00:00.000Z`)
        ])
        
        return {
          date,
          newUsers: newUsers || 0,
          newMatches: newMatches || 0,
          newChats: newChats || 0
        }
      })
    )
    
    // Buscar dados de uso de funcionalidades
    const { data: profilesWithCompletion } = await supabaseAdmin
      .from('profiles')
      .select('profile_completion_percentage')
      .not('profile_completion_percentage', 'is', null)
    
    const avgProfileCompletion = profilesWithCompletion?.length
      ? Math.round(profilesWithCompletion.reduce((sum, p) => sum + (p.profile_completion_percentage || 0), 0) / profilesWithCompletion.length)
      : 0
    
    const reportData = {
      overview: {
        totalUsers: totalUsers || 0,
        totalMatches: totalMatches || 0,
        totalChats: totalChats || 0,
        totalTherapists: totalTherapists || 0,
        premiumUsers: premiumUsers || 0,
        verifiedUsers: verifiedUsers || 0,
        successRate,
        userGrowthRate,
        matchGrowthRate,
        chatGrowthRate
      },
      matches: {
        total: totalMatches || 0,
        pending: pendingMatches || 0,
        approved: approvedMatches || 0,
        rejected: rejectedMatches || 0,
        mutualLikes: mutualLikes || 0,
        successRate
      },
      geographic: topStates,
      dailyActivity: dailyStats,
      features: {
        profileCompletion: avgProfileCompletion,
        premiumAdoption: totalUsers ? Math.round(((premiumUsers || 0) / totalUsers) * 100) : 0,
        therapistUsage: totalUsers ? Math.round(((totalTherapists || 0) / totalUsers) * 100) : 0,
        verificationRate: totalUsers ? Math.round(((verifiedUsers || 0) / totalUsers) * 100) : 0
      }
    }
    
    return NextResponse.json(reportData)
    
  } catch (error) {
    console.error('Erro interno:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 