export interface AdminUser {
  id: string
  name: string
  email: string
  role: 'user' | 'admin' | 'therapist'
  status: 'active' | 'banned' | 'pending'
  joinDate: string
  lastActive: string
  age?: number | null
  location?: string | null
  verified: boolean
  isPremium: boolean
  profileCompletion: number
  matches: number
}

export interface UsersStats {
  totalUsers: number
  activeUsers: number
  therapists: number
  pendingUsers: number
}

export interface UsersResponse {
  users: AdminUser[]
  stats: UsersStats
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface UsersFilters {
  search?: string
  role?: 'all' | 'user' | 'admin' | 'therapist'
  page?: number
  limit?: number
}

export class UsersService {
  
  /**
   * Busca usuários com filtros e paginação
   */
  static async getUsers(filters: UsersFilters = {}): Promise<UsersResponse> {
    try {
      const params = new URLSearchParams()
      
      if (filters.search) params.append('search', filters.search)
      if (filters.role && filters.role !== 'all') params.append('role', filters.role)
      if (filters.page) params.append('page', filters.page.toString())
      if (filters.limit) params.append('limit', filters.limit.toString())
      
      const response = await fetch(`/api/admin/users?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error('Erro ao buscar usuários')
      }
      
      const data = await response.json()
      return data
      
    } catch (error) {
      console.error('Erro ao buscar usuários:', error)
      return {
        users: [],
        stats: {
          totalUsers: 0,
          activeUsers: 0,
          therapists: 0,
          pendingUsers: 0
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
   * Atualizar role do usuário
   */
  static async updateUserRole(userId: string, newRole: string): Promise<{ success: boolean }> {
    try {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role: newRole })
      })
      
      if (!response.ok) {
        throw new Error('Erro ao atualizar role')
      }
      
      return { success: true }
      
    } catch (error) {
      console.error('Erro ao atualizar role:', error)
      return { success: false }
    }
  }
  
  /**
   * Banir/desbanir usuário
   */
  static async toggleUserBan(userId: string, banned: boolean): Promise<{ success: boolean }> {
    try {
      const response = await fetch(`/api/admin/users/${userId}/ban`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ banned })
      })
      
      if (!response.ok) {
        throw new Error('Erro ao banir/desbanir usuário')
      }
      
      return { success: true }
      
    } catch (error) {
      console.error('Erro ao banir/desbanir usuário:', error)
      return { success: false }
    }
  }
} 