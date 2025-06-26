import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Parâmetros de query
    const status = searchParams.get('status') || 'all'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit
    
    // Query base para matches com perfis dos usuários
    let query = supabaseAdmin
      .from('matches')
      .select(`
        id,
        user1_id,
        user2_id,
        compatibility_score,
        ai_analysis,
        matching_factors,
        potential_challenges,
        status,
        user1_action,
        user2_action,
        user1_action_at,
        user2_action_at,
        match_source,
        priority_level,
        expires_at,
        admin_notes,
        admin_approved_by,
        admin_approved_at,
        admin_rejection_reason,
        created_at,
        updated_at,
        user1:users!matches_user1_id_fkey (
          id,
          profiles (
            first_name,
            last_name,
            birth_date,
            gender,
            location_city,
            location_state,
            occupation,
            bio,
            interests,
            profile_photos
          )
        ),
        user2:users!matches_user2_id_fkey (
          id,
          profiles (
            first_name,
            last_name,
            birth_date,
            gender,
            location_city,
            location_state,
            occupation,
            bio,
            interests,
            profile_photos
          )
        )
      `)
    
    // Filtros por status
    if (status !== 'all') {
      query = query.eq('status', status)
    }
    
    // Buscar dados com paginação
    const { data: matches, error: matchesError, count } = await query
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false })
    
    if (matchesError) {
      console.error('Erro ao buscar matches:', matchesError)
      return NextResponse.json(
        { error: 'Erro ao buscar matches' },
        { status: 500 }
      )
    }
    
    // Buscar estatísticas dos matches
    const [
      { count: totalMatches },
      { count: pendingMatches },
      { count: approvedMatches },
      { count: rejectedMatches },
      { count: mutualLikes }
    ] = await Promise.all([
      supabaseAdmin.from('matches').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('matches').select('*', { count: 'exact', head: true }).eq('status', 'pending_approval'),
      supabaseAdmin.from('matches').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
      supabaseAdmin.from('matches').select('*', { count: 'exact', head: true }).eq('status', 'rejected'),
      supabaseAdmin.from('matches').select('*', { count: 'exact', head: true }).eq('status', 'mutual_like')
    ])
    
    // Transformar dados para o frontend
    const transformedMatches = matches?.map(match => {
      const user1Data = Array.isArray(match.user1) ? match.user1[0] : match.user1
      const user2Data = Array.isArray(match.user2) ? match.user2[0] : match.user2
      
      const user1Profile = user1Data?.profiles ? (Array.isArray(user1Data.profiles) ? user1Data.profiles[0] : user1Data.profiles) : null
      const user2Profile = user2Data?.profiles ? (Array.isArray(user2Data.profiles) ? user2Data.profiles[0] : user2Data.profiles) : null
      
      const calculateAge = (birthDate: string) => {
        const today = new Date()
        const birth = new Date(birthDate)
        let age = today.getFullYear() - birth.getFullYear()
        const monthDiff = today.getMonth() - birth.getMonth()
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
          age--
        }
        return age
      }
      
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
      
      return {
        id: match.id,
        user1: {
          id: match.user1_id,
          name: user1Profile ? `${user1Profile.first_name} ${user1Profile.last_name}` : 'Usuário 1',
          age: user1Profile?.birth_date ? calculateAge(user1Profile.birth_date) : null,
          location: user1Profile ? `${user1Profile.location_city}, ${user1Profile.location_state}` : null,
          occupation: user1Profile?.occupation,
          bio: user1Profile?.bio,
          interests: user1Profile?.interests || [],
          photo: user1Profile?.profile_photos?.[0]
        },
        user2: {
          id: match.user2_id,
          name: user2Profile ? `${user2Profile.first_name} ${user2Profile.last_name}` : 'Usuário 2',
          age: user2Profile?.birth_date ? calculateAge(user2Profile.birth_date) : null,
          location: user2Profile ? `${user2Profile.location_city}, ${user2Profile.location_state}` : null,
          occupation: user2Profile?.occupation,
          bio: user2Profile?.bio,
          interests: user2Profile?.interests || [],
          photo: user2Profile?.profile_photos?.[0]
        },
        compatibilityScore: match.compatibility_score,
        aiAnalysis: match.ai_analysis,
        matchingFactors: match.matching_factors,
        potentialChallenges: match.potential_challenges,
        status: match.status,
        user1Action: match.user1_action,
        user2Action: match.user2_action,
        user1ActionAt: match.user1_action_at,
        user2ActionAt: match.user2_action_at,
        matchSource: match.match_source,
        priorityLevel: match.priority_level,
        expiresAt: match.expires_at,
        adminNotes: match.admin_notes,
        adminApprovedBy: match.admin_approved_by,
        adminApprovedAt: match.admin_approved_at,
        adminRejectionReason: match.admin_rejection_reason,
        createdAt: match.created_at,
        createdAgo: formatTimeAgo(match.created_at)
      }
    }) || []
    
    const stats = {
      total: totalMatches || 0,
      pending: pendingMatches || 0,
      approved: approvedMatches || 0,
      rejected: rejectedMatches || 0,
      mutualLikes: mutualLikes || 0
    }
    
    return NextResponse.json({
      matches: transformedMatches,
      stats,
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