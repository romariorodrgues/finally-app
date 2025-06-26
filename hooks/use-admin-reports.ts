import { useState, useEffect, useCallback } from 'react'
import { ReportsService, ReportsData, ReportsFilters } from '@/lib/admin/reports-service'

export interface UseAdminReportsReturn {
  data: ReportsData
  loading: boolean
  error: string | null
  filters: ReportsFilters
  setFilters: (filters: Partial<ReportsFilters>) => void
  refresh: () => Promise<void>
  exportReport: (format: 'pdf' | 'excel') => Promise<boolean>
}

export function useAdminReports(): UseAdminReportsReturn {
  const [data, setData] = useState<ReportsData>({
    overview: {
      totalUsers: 0,
      totalMatches: 0,
      totalChats: 0,
      totalTherapists: 0,
      premiumUsers: 0,
      verifiedUsers: 0,
      successRate: 0,
      userGrowthRate: 0,
      matchGrowthRate: 0,
      chatGrowthRate: 0
    },
    matches: {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
      mutualLikes: 0,
      successRate: 0
    },
    geographic: [],
    dailyActivity: [],
    features: {
      profileCompletion: 0,
      premiumAdoption: 0,
      therapistUsage: 0,
      verificationRate: 0
    }
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFiltersState] = useState<ReportsFilters>({
    period: '30'
  })
  
  const loadReports = useCallback(async (currentFilters: ReportsFilters) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await ReportsService.getReports(currentFilters)
      setData(response)
      
    } catch (err) {
      console.error('Erro ao carregar relatórios:', err)
      setError('Erro ao carregar relatórios. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }, [])
  
  useEffect(() => {
    loadReports(filters)
  }, [loadReports, filters])
  
  const setFilters = useCallback((newFilters: Partial<ReportsFilters>) => {
    setFiltersState(prev => ({
      ...prev,
      ...newFilters
    }))
  }, [])
  
  const refresh = useCallback(async () => {
    await loadReports(filters)
  }, [loadReports, filters])
  
  const exportReport = useCallback(async (format: 'pdf' | 'excel'): Promise<boolean> => {
    try {
      const result = await ReportsService.exportReport(format)
      if (result.success && result.url) {
        // Simular download
        window.open(result.url, '_blank')
      }
      return result.success
    } catch (error) {
      console.error('Erro ao exportar relatório:', error)
      return false
    }
  }, [])
  
  return {
    data,
    loading,
    error,
    filters,
    setFilters,
    refresh,
    exportReport
  }
} 