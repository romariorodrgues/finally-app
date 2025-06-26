import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Use service role key for admin operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Parâmetros de query
    const status = searchParams.get('status') || 'all'
    const type = searchParams.get('type') || 'all'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit
    
    // Buscar estatísticas de moderação
    const [
      { count: totalReports },
      { count: pendingReports },
      { count: resolvedReports },
      { count: dismissedReports },
      { count: bannedUsers },
      { count: flaggedContent }
    ] = await Promise.all([
      supabaseAdmin.from('reports').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabaseAdmin.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'resolved'),
      supabaseAdmin.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'dismissed'),
      supabaseAdmin.from('users').select('*', { count: 'exact', head: true }).eq('role', 'banned'),
      supabaseAdmin.from('reports').select('*', { count: 'exact', head: true }).in('type', ['profile', 'photo', 'message'])
    ])
    
    // Buscar reportes resolvidos hoje
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const { count: resolvedToday } = await supabaseAdmin
      .from('reports')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'resolved')
      .gte('updated_at', today.toISOString())
    
    // Query base para reportes com perfis dos usuários
    let query = supabaseAdmin
      .from('reports')
      .select(`
        id,
        type,
        reason,
        description,
        status,
        created_at,
        updated_at,
        resolved_by,
        resolution_notes,
        reporter_id,
        reported_user_id,
        reporter:users!reports_reporter_id_fkey (
          id,
          profiles (
            first_name,
            last_name
          )
        ),
        reported_user:users!reports_reported_user_id_fkey (
          id,
          profiles (
            first_name,
            last_name
          )
        )
      `)
    
    // Filtros
    if (status !== 'all') {
      query = query.eq('status', status)
    }
    
    if (type !== 'all') {
      query = query.eq('type', type)
    }
    
    // Buscar dados com paginação
    const { data: reports, error: reportsError, count } = await query
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false })
    
    if (reportsError) {
      console.error('Erro ao buscar reportes:', reportsError)
      return NextResponse.json(
        { error: 'Erro ao buscar reportes' },
        { status: 500 }
      )
    }
    
    // Transformar dados para o frontend
    const transformedReports = reports?.map(report => {
      const reporterData = Array.isArray(report.reporter) ? report.reporter[0] : report.reporter
      const reportedUserData = Array.isArray(report.reported_user) ? report.reported_user[0] : report.reported_user
      
      const reporterProfile = reporterData?.profiles ? (Array.isArray(reporterData.profiles) ? reporterData.profiles[0] : reporterData.profiles) : null
      const reportedProfile = reportedUserData?.profiles ? (Array.isArray(reportedUserData.profiles) ? reportedUserData.profiles[0] : reportedUserData.profiles) : null
      
      const formatTimeAgo = (timestamp: string) => {
        const now = new Date().getTime()
        const time = new Date(timestamp).getTime()
        const diffInMinutes = Math.floor((now - time) / (1000 * 60))
        
        if (diffInMinutes < 1) return 'há alguns segundos'
        if (diffInMinutes < 60) return `há ${diffInMinutes} minutos`
        
        const diffInHours = Math.floor(diffInMinutes / 60)
        if (diffInHours < 24) return `há ${diffInHours} horas`
        
        const diffInDays = Math.floor(diffInHours / 24)
        return `há ${diffInDays} dias`
      }
      
      const getTypeDisplay = (type: string) => {
        switch (type) {
          case 'profile':
            return 'perfil'
          case 'message':
            return 'mensagem'
          case 'photo':
            return 'foto'
          case 'behavior':
            return 'comportamento'
          default:
            return type
        }
      }
      
      return {
        id: report.id,
        type: getTypeDisplay(report.type),
        originalType: report.type,
        reporter: reporterProfile ? `${reporterProfile.first_name} ${reporterProfile.last_name}` : 'Usuário não encontrado',
        reporterId: report.reporter_id,
        reportedUser: reportedProfile ? `${reportedProfile.first_name} ${reportedProfile.last_name}` : 'Usuário não encontrado',
        reportedUserId: report.reported_user_id,
        reason: report.reason,
        description: report.description,
        status: report.status,
        createdAt: report.created_at,
        createdAgo: formatTimeAgo(report.created_at),
        updatedAt: report.updated_at,
        resolvedBy: report.resolved_by,
        resolutionNotes: report.resolution_notes
      }
    }) || []
    
    // Buscar atividades recentes de moderação (últimos 10 itens)
    const { data: recentActivities } = await supabaseAdmin
      .from('reports')
      .select(`
        id,
        type,
        status,
        updated_at,
        resolved_by,
        reporter:users!reports_reporter_id_fkey (
          id,
          profiles (
            first_name,
            last_name
          )
        ),
        reported_user:users!reports_reported_user_id_fkey (
          id,
          profiles (
            first_name,
            last_name
          )
        )
      `)
      .not('status', 'eq', 'pending')
      .order('updated_at', { ascending: false })
      .limit(10)
    
    const transformedActivities = recentActivities?.map(activity => {
      const reporterData = Array.isArray(activity.reporter) ? activity.reporter[0] : activity.reporter
      const reportedUserData = Array.isArray(activity.reported_user) ? activity.reported_user[0] : activity.reported_user
      
      const reporterProfile = reporterData?.profiles ? (Array.isArray(reporterData.profiles) ? reporterData.profiles[0] : reporterData.profiles) : null
      const reportedProfile = reportedUserData?.profiles ? (Array.isArray(reportedUserData.profiles) ? reportedUserData.profiles[0] : reportedUserData.profiles) : null
      
      return {
        id: activity.id,
        type: activity.type,
        status: activity.status,
        reporter: reporterProfile ? `${reporterProfile.first_name} ${reporterProfile.last_name}` : 'Usuário',
        reportedUser: reportedProfile ? `${reportedProfile.first_name} ${reportedProfile.last_name}` : 'Usuário',
        updatedAt: activity.updated_at,
        resolvedBy: activity.resolved_by
      }
    }) || []
    
    const stats = {
      total: totalReports || 0,
      pending: pendingReports || 0,
      resolved: resolvedReports || 0,
      dismissed: dismissedReports || 0,
      resolvedToday: resolvedToday || 0,
      bannedUsers: bannedUsers || 0,
      flaggedContent: flaggedContent || 0
    }
    
    return NextResponse.json({
      reports: transformedReports,
      stats,
      recentActivities: transformedActivities,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })
    
  } catch (error) {
    console.error('Erro interno:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 