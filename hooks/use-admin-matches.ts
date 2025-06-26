import { useState, useEffect, useCallback } from 'react'
import { MatchesService, AdminMatch, MatchesStats, MatchesFilters } from '@/lib/admin/matches-service'

export interface UseAdminMatchesReturn {
  matches: AdminMatch[]
  stats: MatchesStats
  loading: boolean
  error: string | null
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  filters: MatchesFilters
  setFilters: (filters: Partial<MatchesFilters>) => void
  refresh: () => Promise<void>
  approveMatch: (matchId: string, adminId: string) => Promise<boolean>
  rejectMatch: (matchId: string, adminId: string, reason?: string) => Promise<boolean>
}

export function useAdminMatches(): UseAdminMatchesReturn {
  const [matches, setMatches] = useState<AdminMatch[]>([])
  const [stats, setStats] = useState<MatchesStats>({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    mutualLikes: 0
  })
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFiltersState] = useState<MatchesFilters>({
    status: 'all',
    page: 1,
    limit: 10
  })
  
  const loadMatches = useCallback(async (currentFilters: MatchesFilters) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await MatchesService.getMatches(currentFilters)
      
      setMatches(response.matches)
      setStats(response.stats)
      setPagination(response.pagination)
      
    } catch (err) {
      console.error('Erro ao carregar matches:', err)
      setError('Erro ao carregar matches. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }, [])
  
  useEffect(() => {
    loadMatches(filters)
  }, [loadMatches, filters])
  
  const setFilters = useCallback((newFilters: Partial<MatchesFilters>) => {
    setFiltersState(prev => ({
      ...prev,
      ...newFilters,
      // Reset para página 1 quando outros filtros mudam
      page: newFilters.page !== undefined ? newFilters.page : 1
    }))
  }, [])
  
  const refresh = useCallback(async () => {
    await loadMatches(filters)
  }, [loadMatches, filters])
  
  const approveMatch = useCallback(async (matchId: string, adminId: string): Promise<boolean> => {
    try {
      const result = await MatchesService.approveMatch(matchId, adminId)
      if (result.success) {
        await refresh()
      }
      return result.success
    } catch (error) {
      console.error('Erro ao aprovar match:', error)
      return false
    }
  }, [refresh])
  
  const rejectMatch = useCallback(async (matchId: string, adminId: string, reason?: string): Promise<boolean> => {
    try {
      const result = await MatchesService.rejectMatch(matchId, adminId, reason)
      if (result.success) {
        await refresh()
      }
      return result.success
    } catch (error) {
      console.error('Erro ao rejeitar match:', error)
      return false
    }
  }, [refresh])
  
  return {
    matches,
    stats,
    loading,
    error,
    pagination,
    filters,
    setFilters,
    refresh,
    approveMatch,
    rejectMatch
  }
} 