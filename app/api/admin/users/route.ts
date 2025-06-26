import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Parâmetros de query
    const search = searchParams.get('search') || ''
    const role = searchParams.get('role') || 'all'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit
    
    // Query base para usuários com perfis e dados do NextAuth
    let query = supabaseAdmin
      .from('users')
      .select(`
        id,
        email,
        role,
        created_at,
        updated_at,
        profiles (
          id,
          first_name,
          last_name,
          birth_date,
          gender,
          location_city,
          location_state,
          verification_status,
          is_premium,
          last_active,
          profile_completion_percentage
        )
      `)
    
    // Filtros
    if (role !== 'all') {
      query = query.eq('role', role)
    }
    
    if (search) {
      query = query.or(`email.ilike.%${search}%,profiles.first_name.ilike.%${search}%,profiles.last_name.ilike.%${search}%`)
    }
    
    // Buscar dados com paginação
    const { data: users, error: usersError, count } = await query
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false })
    
    if (usersError) {
      console.error('Erro ao buscar usuários:', usersError)
      return NextResponse.json(
        { error: 'Erro ao buscar usuários' },
        { status: 500 }
      )
    }
    
    // Buscar estatísticas dos usuários
    const [
      { count: totalUsers },
      { count: activeUsers },
      { count: therapists },
      { count: pendingUsers }
    ] = await Promise.all([
      supabaseAdmin.from('users').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('users').select('*', { count: 'exact', head: true }).neq('role', 'banned'),
      supabaseAdmin.from('users').select('*', { count: 'exact', head: true }).eq('role', 'therapist'),
      supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }).eq('verification_status', 'pending')
    ])
    
    // Transformar dados para o frontend
    const transformedUsers = users?.map(user => {
      const profile = Array.isArray(user.profiles) ? user.profiles[0] : user.profiles
      
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
        id: user.id,
        name: profile ? `${profile.first_name} ${profile.last_name}` : 'Usuário sem perfil',
        email: user.email,
        role: user.role,
        status: profile?.verification_status === 'suspended' ? 'banned' : 'active',
        joinDate: new Date(user.created_at).toLocaleDateString('pt-BR'),
        lastActive: profile?.last_active ? formatTimeAgo(profile.last_active) : 'Nunca',
        age: profile?.birth_date ? calculateAge(profile.birth_date) : null,
        location: profile ? `${profile.location_city}, ${profile.location_state}` : null,
        verified: profile?.verification_status === 'approved',
        isPremium: profile?.is_premium || false,
        profileCompletion: profile?.profile_completion_percentage || 0,
        matches: 0 // TODO: Implementar contagem de matches
      }
    }) || []
    
    const stats = {
      totalUsers: totalUsers || 0,
      activeUsers: activeUsers || 0,
      therapists: therapists || 0,
      pendingUsers: pendingUsers || 0
    }
    
    return NextResponse.json({
      users: transformedUsers,
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