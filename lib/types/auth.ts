import type { User as NextAuthUser } from 'next-auth'

// Auth-specific types
export interface UserMetadata {
  full_name?: string
  avatar_url?: string
  role?: 'user' | 'admin' | 'therapist'
  [key: string]: unknown
}

export interface CreateUserData {
  email: string
  role?: 'user' | 'admin' | 'therapist'
  profile?: {
    first_name: string
    last_name: string
    birth_date: string
    gender: 'male' | 'female'
    location_city: string
    location_state: string
    location_country?: string
    bio?: string
    interests?: string[]
  }
}

export interface UpdateProfileData {
  first_name?: string
  last_name?: string
  birth_date?: string
  gender?: 'male' | 'female'
  location_city?: string
  location_state?: string
  location_country?: string
  occupation?: string
  education_level?: string
  height_cm?: number
  relationship_status?: 'single' | 'divorced' | 'widowed'
  has_children?: boolean
  wants_children?: string
  children_count?: number
  bio?: string
  interests?: string[]
  photos?: string[]
}

// Profile types
export interface UserProfile {
  id: string
  user_id: string
  first_name: string
  last_name: string
  birth_date: string
  gender: 'male' | 'female'
  location_city: string
  location_state: string
  location_country: string
  occupation?: string
  bio?: string
  profile_picture_url?: string
  photos?: string[]
  interests?: string[]
  profile_completion_percentage: number
  created_at: string
  updated_at: string
}

export interface LoginFormData {
  email: string
  password: string
}

export interface SignUpFormData {
  email: string
  password: string
  confirmPassword: string
  firstName: string
  lastName: string
}

export interface AuthError {
  message: string
  status?: number
}

// NextAuth compatible user type
export type User = NextAuthUser 