export interface AdminUser {
  id: string
  email: string
  role: 'user' | 'admin' | 'therapist'
  created_at: string
  updated_at: string
  profile?: {
    id: number
    first_name: string
    last_name: string
    birth_date: string
    gender: string
    location_city: string
    location_state: string
    verification_status: string
    is_premium: boolean
    last_active?: string
    profile_completion_percentage: number
  }
}

export interface AdminMatch {
  id: number
  user1_id: string
  user2_id: string
  compatibility_score: number
  status: string
  created_at: string
  updated_at: string
  ai_analysis?: object
  user1_profile?: {
    first_name: string
    last_name: string
    age: number
    location_city: string
    location_state: string
  }
  user2_profile?: {
    first_name: string
    last_name: string
    age: number
    location_city: string
    location_state: string
  }
}

export interface AdminChat {
  id: number
  match_id: number
  user1_id: string
  user2_id: string
  status: string
  total_messages: number
  last_message_at?: string
  created_at: string
}

export interface AdminReport {
  id: number
  type: string
  description: string
  status: 'pending' | 'resolved' | 'dismissed'
  reporter_id?: string
  reported_user_id?: string
  created_at: string
  updated_at: string
}

export interface DashboardFilters {
  dateRange?: {
    start: Date
    end: Date
  }
  userRole?: 'user' | 'admin' | 'therapist' | 'all'
  matchStatus?: string
  reportStatus?: 'pending' | 'resolved' | 'dismissed' | 'all'
} 