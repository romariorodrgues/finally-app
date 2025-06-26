import { useState, useEffect, useCallback } from 'react'
import { UsersService, AdminUser, UsersStats, UsersFilters } from '@/lib/admin/users-service'

export interface UseAdminUsersReturn {
  users: AdminUser[]
  stats: UsersStats
  loading: boolean
  error: string | null
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  filters: UsersFilters
  setFilters: (filters: Partial<UsersFilters>) => void
  refresh: () => Promise<void>
  updateUserRole: (userId: string, newRole: string) => Promise<boolean>
  toggleUserBan: (userId: string, banned: boolean) => Promise<boolean>
  resendWelcomeEmail: (userId: string) => Promise<boolean>
}

export function useAdminUsers(): UseAdminUsersReturn {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [stats, setStats] = useState<UsersStats>({
    totalUsers: 0,
    activeUsers: 0,
    therapists: 0,
    pendingUsers: 0
  })
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFiltersState] = useState<UsersFilters>({
    search: '',
    role: 'all',
    page: 1,
    limit: 10
  })
  
  const loadUsers = useCallback(async (currentFilters: UsersFilters) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await UsersService.getUsers(currentFilters)
      
      setUsers(response.users)
      setStats(response.stats)
      setPagination(response.pagination)
      
    } catch (err) {
      console.error('Erro ao carregar usuários:', err)
      setError('Erro ao carregar usuários. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }, [])
  
  useEffect(() => {
    loadUsers(filters)
  }, [loadUsers, filters])
  
  const setFilters = useCallback((newFilters: Partial<UsersFilters>) => {
    setFiltersState(prev => ({
      ...prev,
      ...newFilters,
      // Reset para página 1 quando outros filtros mudam
      page: newFilters.page !== undefined ? newFilters.page : 1
    }))
  }, [])
  
  const refresh = useCallback(async () => {
    await loadUsers(filters)
  }, [loadUsers, filters])
  
  const updateUserRole = useCallback(async (userId: string, newRole: string): Promise<boolean> => {
    try {
      const result = await UsersService.updateUserRole(userId, newRole)
      if (result.success) {
        await refresh()
      }
      return result.success
    } catch (error) {
      console.error('Erro ao atualizar role:', error)
      return false
    }
  }, [refresh])
  
  const toggleUserBan = useCallback(async (userId: string, banned: boolean): Promise<boolean> => {
    try {
      const result = await UsersService.toggleUserBan(userId, banned)
      if (result.success) {
        await refresh()
      }
      return result.success
    } catch (error) {
      console.error('Erro ao banir/desbanir usuário:', error)
      return false
    }
  }, [refresh])

  const resendWelcomeEmail = useCallback(async (userId: string): Promise<boolean> => {
    try {
      console.log('📧 [HOOK] Reenviando email de boas-vindas para usuário:', userId)
      
      const response = await fetch(`/api/admin/users/${userId}/resend-welcome`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao reenviar email')
      }

      const result = await response.json()
      console.log('✅ [HOOK] Email reenviado com sucesso:', result)
      
      return true
    } catch (error) {
      console.error('❌ [HOOK] Erro ao reenviar email:', error)
      return false
    }
  }, [])
  
  return {
    users,
    stats,
    loading,
    error,
    pagination,
    filters,
    setFilters,
    refresh,
    updateUserRole,
    toggleUserBan,
    resendWelcomeEmail
  }
} 