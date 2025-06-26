import { useState, useEffect, useCallback } from 'react'
import { AdminService, AdminStats, RecentActivity } from '@/lib/admin/admin-service'

export interface UseAdminDataReturn {
  stats: AdminStats
  recentActivity: RecentActivity[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

export function useAdminData(): UseAdminDataReturn {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalMatches: 0,
    activeChats: 0,
    pendingMatches: 0,
    recentGrowth: {
      usersGrowth: 0,
      matchesGrowth: 0,
      chatsGrowth: 0
    }
  })
  
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [adminStats, activities] = await Promise.all([
        AdminService.getAdminStats(),
        AdminService.getRecentActivity()
      ])
      
      setStats(adminStats)
      setRecentActivity(activities)
    } catch (err) {
      console.error('Erro ao carregar dados da admin:', err)
      setError('Erro ao carregar dados. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }, [])
  
  useEffect(() => {
    loadData()
    
    // Auto-refresh a cada 5 minutos
    const interval = setInterval(loadData, 5 * 60 * 1000)
    
    return () => clearInterval(interval)
  }, [loadData])
  
  const refresh = useCallback(async () => {
    await loadData()
  }, [loadData])
  
  return {
    stats,
    recentActivity,
    loading,
    error,
    refresh
  }
} 