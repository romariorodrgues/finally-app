export interface ModerationReport {
  id: string
  type: string
  originalType: string
  reporter: string
  reporterId: string
  reportedUser: string
  reportedUserId: string
  reason: string
  description: string
  status: 'pending' | 'resolved' | 'dismissed'
  createdAt: string
  createdAgo: string
  updatedAt: string
  resolvedBy?: string | null
  resolutionNotes?: string | null
}

export interface ModerationStats {
  total: number
  pending: number
  resolved: number
  dismissed: number
  resolvedToday: number
  bannedUsers: number
  flaggedContent: number
}

export interface RecentActivity {
  id: string
  type: string
  status: string
  reporter: string
  reportedUser: string
  updatedAt: string
  resolvedBy?: string | null
}

export interface ModerationResponse {
  reports: ModerationReport[]
  stats: ModerationStats
  recentActivities: RecentActivity[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface ModerationFilters {
  status?: 'all' | 'pending' | 'resolved' | 'dismissed'
  type?: 'all' | 'profile' | 'message' | 'photo' | 'behavior'
  page?: number
  limit?: number
}

export class ModerationService {
  
  /**
   * Busca dados de moderação com filtros e paginação
   */
  static async getModerationData(filters: ModerationFilters = {}): Promise<ModerationResponse> {
    try {
      const params = new URLSearchParams()
      
      if (filters.status && filters.status !== 'all') params.append('status', filters.status)
      if (filters.type && filters.type !== 'all') params.append('type', filters.type)
      if (filters.page) params.append('page', filters.page.toString())
      if (filters.limit) params.append('limit', filters.limit.toString())
      
      const response = await fetch(`/api/admin/moderation?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error('Erro ao buscar dados de moderação')
      }
      
      const data = await response.json()
      return data
      
    } catch (error) {
      console.error('Erro ao buscar dados de moderação:', error)
      return {
        reports: [],
        stats: {
          total: 0,
          pending: 0,
          resolved: 0,
          dismissed: 0,
          resolvedToday: 0,
          bannedUsers: 0,
          flaggedContent: 0
        },
        recentActivities: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0
        }
      }
    }
  }
  
  /**
   * Resolver reporte
   */
  static async resolveReport(
    reportId: string, 
    adminId: string, 
    notes?: string, 
    action?: 'ban' | 'warn' | 'none'
  ): Promise<{ success: boolean }> {
    try {
      const response = await fetch(`/api/admin/moderation/${reportId}/resolve`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ adminId, notes, action })
      })
      
      if (!response.ok) {
        throw new Error('Erro ao resolver reporte')
      }
      
      return { success: true }
      
    } catch (error) {
      console.error('Erro ao resolver reporte:', error)
      return { success: false }
    }
  }
  
  /**
   * Descartar reporte
   */
  static async dismissReport(
    reportId: string, 
    adminId: string, 
    notes?: string
  ): Promise<{ success: boolean }> {
    try {
      const response = await fetch(`/api/admin/moderation/${reportId}/dismiss`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ adminId, notes })
      })
      
      if (!response.ok) {
        throw new Error('Erro ao descartar reporte')
      }
      
      return { success: true }
      
    } catch (error) {
      console.error('Erro ao descartar reporte:', error)
      return { success: false }
    }
  }
} 