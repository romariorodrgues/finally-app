export interface AdminStats {
  totalUsers: number;
  totalMatches: number;
  activeChats: number;
  pendingMatches: number;
  recentGrowth: {
    usersGrowth: number;
    matchesGrowth: number;
    chatsGrowth: number;
  };
}

export interface RecentActivity {
  id: string;
  type: 'user_registered' | 'match_created' | 'report_created';
  description: string;
  timestamp: string;
  user?: {
    name: string;
    email?: string;
  };
}

export interface AdminReport {
  id: number;
  type: string;
  description: string;
  status: 'pending' | 'resolved' | 'dismissed';
  reporter_id?: string;
  reported_user_id?: string;
  created_at: string;
}

export class AdminService {
  
  /**
   * Busca estatísticas gerais da plataforma
   */
  static async getAdminStats(): Promise<AdminStats> {
    try {
      const response = await fetch('/api/admin/stats');
      
      if (!response.ok) {
        throw new Error('Erro ao buscar estatísticas');
      }
      
      const stats = await response.json();
      return stats;
      
    } catch (error) {
      console.error('Erro ao buscar estatísticas da admin:', error);
      return {
        totalUsers: 0,
        totalMatches: 0,
        activeChats: 0,
        pendingMatches: 0,
        recentGrowth: {
          usersGrowth: 0,
          matchesGrowth: 0,
          chatsGrowth: 0
        }
      };
    }
  }
  
  /**
   * Busca atividades recentes da plataforma
   */
  static async getRecentActivity(): Promise<RecentActivity[]> {
    try {
      const response = await fetch('/api/admin/activity');
      
      if (!response.ok) {
        throw new Error('Erro ao buscar atividades');
      }
      
      const activities = await response.json();
      return activities;
      
    } catch (error) {
      console.error('Erro ao buscar atividades recentes:', error);
      return [];
    }
  }
  
  /**
   * Busca reportes pendentes
   */
  static async getPendingReports(): Promise<AdminReport[]> {
    // Por enquanto retornamos dados simulados
    // Quando a tabela de reports for criada, implementaremos a busca real
    return [
      {
        id: 1,
        type: 'inappropriate_content',
        description: 'Inappropriate content in profile',
        status: 'pending',
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        type: 'harassment',
        description: 'Harassment in messages',
        status: 'pending',
        created_at: new Date().toISOString()
      }
    ];
  }
} 