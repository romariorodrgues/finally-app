export interface MatchUser {
  id: string
  name: string
  age?: number | null
  location?: string | null
  occupation?: string
  bio?: string
  interests: string[]
  photo?: string
}

export interface AdminMatch {
  id: string
  user1: MatchUser
  user2: MatchUser
  compatibilityScore: number
  aiAnalysis?: string
  matchingFactors?: string[]
  potentialChallenges?: string[]
  status: 'pending_approval' | 'approved' | 'rejected' | 'mutual_like'
  user1Action?: 'like' | 'dislike' | null
  user2Action?: 'like' | 'dislike' | null
  adminApprovedBy?: string | null
  adminApprovedAt?: string | null
  adminRejectionReason?: string | null
  createdAt: string
  createdAgo: string
}

export interface MatchesStats {
  total: number
  pending: number
  approved: number
  rejected: number
  mutualLikes: number
}

export interface MatchesResponse {
  matches: AdminMatch[]
  stats: MatchesStats
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface MatchesFilters {
  status?: 'all' | 'pending_approval' | 'approved' | 'rejected' | 'mutual_like'
  page?: number
  limit?: number
}

export class MatchesService {
  
  /**
   * Busca matches com filtros e paginação
   */
  static async getMatches(filters: MatchesFilters = {}): Promise<MatchesResponse> {
    try {
      const params = new URLSearchParams()
      
      if (filters.status && filters.status !== 'all') params.append('status', filters.status)
      if (filters.page) params.append('page', filters.page.toString())
      if (filters.limit) params.append('limit', filters.limit.toString())
      
      const response = await fetch(`/api/admin/matches?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error('Erro ao buscar matches')
      }
      
      const data = await response.json()
      return data
      
    } catch (error) {
      console.error('Erro ao buscar matches:', error)
      return {
        matches: [],
        stats: {
          total: 0,
          pending: 0,
          approved: 0,
          rejected: 0,
          mutualLikes: 0
        },
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
   * Aprovar match
   */
  static async approveMatch(matchId: string, adminId: string): Promise<{ success: boolean }> {
    try {
      const response = await fetch(`/api/admin/matches/${matchId}/approve`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ adminId })
      })
      
      if (!response.ok) {
        throw new Error('Erro ao aprovar match')
      }
      
      return { success: true }
      
    } catch (error) {
      console.error('Erro ao aprovar match:', error)
      return { success: false }
    }
  }
  
  /**
   * Rejeitar match
   */
  static async rejectMatch(matchId: string, adminId: string, reason?: string): Promise<{ success: boolean }> {
    try {
      const response = await fetch(`/api/admin/matches/${matchId}/reject`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ adminId, reason })
      })
      
      if (!response.ok) {
        throw new Error('Erro ao rejeitar match')
      }
      
      return { success: true }
      
    } catch (error) {
      console.error('Erro ao rejeitar match:', error)
      return { success: false }
    }
  }
} 