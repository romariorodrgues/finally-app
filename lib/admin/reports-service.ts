export interface ReportOverview {
  totalUsers: number
  totalMatches: number
  totalChats: number
  totalTherapists: number
  premiumUsers: number
  verifiedUsers: number
  successRate: number
  userGrowthRate: number
  matchGrowthRate: number
  chatGrowthRate: number
}

export interface MatchesReport {
  total: number
  pending: number
  approved: number
  rejected: number
  mutualLikes: number
  successRate: number
}

export interface GeographicData {
  state: string
  count: number
  percentage: number
}

export interface DailyActivity {
  date: string
  newUsers: number
  newMatches: number
  newChats: number
}

export interface FeaturesUsage {
  profileCompletion: number
  premiumAdoption: number
  therapistUsage: number
  verificationRate: number
}

export interface ReportsData {
  overview: ReportOverview
  matches: MatchesReport
  geographic: GeographicData[]
  dailyActivity: DailyActivity[]
  features: FeaturesUsage
}

export interface ReportsFilters {
  period?: string // número de dias para análise
}

export class ReportsService {
  
  /**
   * Busca dados de relatórios
   */
  static async getReports(filters: ReportsFilters = {}): Promise<ReportsData> {
    try {
      const params = new URLSearchParams()
      
      if (filters.period) params.append('period', filters.period)
      
      const response = await fetch(`/api/admin/reports?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error('Erro ao buscar relatórios')
      }
      
      const data = await response.json()
      return data
      
    } catch (error) {
      console.error('Erro ao buscar relatórios:', error)
      return {
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
      }
    }
  }
  
  /**
   * Exportar relatório (simulação)
   */
  static async exportReport(format: 'pdf' | 'excel' = 'pdf'): Promise<{ success: boolean, url?: string }> {
    try {
      // TODO: Implementar exportação real
      console.log(`Exportando relatório em formato ${format}`)
      return { 
        success: true, 
        url: '/api/admin/reports/export?format=' + format 
      }
    } catch (error) {
      console.error('Erro ao exportar relatório:', error)
      return { success: false }
    }
  }
} 