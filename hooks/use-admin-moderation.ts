import { useState, useEffect, useCallback } from 'react'
import { ModerationService, ModerationResponse, ModerationFilters } from '@/lib/admin/moderation-service'

export interface UseAdminModerationReturn extends ModerationResponse {
  loading: boolean
  error: string | null
  filters: ModerationFilters
  setFilters: (filters: Partial<ModerationFilters>) => void
  refresh: () => Promise<void>
  resolveReport: (reportId: string, adminId: string, notes?: string, action?: 'ban' | 'warn' | 'none') => Promise<boolean>
  dismissReport: (reportId: string, adminId: string, notes?: string) => Promise<boolean>
  goToPage: (page: number) => void
}

export function useAdminModeration(): UseAdminModerationReturn {
  const [data, setData] = useState<ModerationResponse>({
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
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFiltersState] = useState<ModerationFilters>({
    status: 'all',
    type: 'all',
    page: 1,
    limit: 10
  })
  
  const loadModerationData = useCallback(async (currentFilters: ModerationFilters) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await ModerationService.getModerationData(currentFilters)
      setData(response)
      
    } catch (err) {
      console.error('Erro ao carregar dados de moderação:', err)
      setError('Erro ao carregar dados de moderação. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }, [])
  
  useEffect(() => {
    loadModerationData(filters)
  }, [loadModerationData, filters])
  
  const setFilters = useCallback((newFilters: Partial<ModerationFilters>) => {
    setFiltersState(prev => ({
      ...prev,
      ...newFilters,
      // Resetar página quando mudar filtros (exceto se estiver mudando a página)
      page: newFilters.page !== undefined ? newFilters.page : 1
    }))
  }, [])
  
  const refresh = useCallback(async () => {
    await loadModerationData(filters)
  }, [loadModerationData, filters])
  
  const resolveReport = useCallback(async (
    reportId: string, 
    adminId: string, 
    notes?: string, 
    action?: 'ban' | 'warn' | 'none'
  ): Promise<boolean> => {
    try {
      const result = await ModerationService.resolveReport(reportId, adminId, notes, action)
      if (result.success) {
        await refresh()
      }
      return result.success
    } catch (error) {
      console.error('Erro ao resolver reporte:', error)
      return false
    }
  }, [refresh])
  
  const dismissReport = useCallback(async (
    reportId: string, 
    adminId: string, 
    notes?: string
  ): Promise<boolean> => {
    try {
      const result = await ModerationService.dismissReport(reportId, adminId, notes)
      if (result.success) {
        await refresh()
      }
      return result.success
    } catch (error) {
      console.error('Erro ao descartar reporte:', error)
      return false
    }
  }, [refresh])
  
  const goToPage = useCallback((page: number) => {
    setFilters({ page })
  }, [setFilters])
  
  return {
    ...data,
    loading,
    error,
    filters,
    setFilters,
    refresh,
    resolveReport,
    dismissReport,
    goToPage
  }
} 