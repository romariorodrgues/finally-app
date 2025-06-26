import { getServerSession } from 'next-auth/next'
import { redirect } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import type { UserMetadata, CreateUserData, UpdateProfileData } from '@/lib/types/auth'

// Create Supabase client for database operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing required Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side auth helpers
export async function getUser() {
  const session = await getServerSession()
  
  if (!session || !session.user) {
    return null
  }
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sessionUser = session.user as any
  let userId = sessionUser.id || sessionUser.sub
  
  console.log('👤 [AUTH-HELPERS] Dados do usuário da sessão:', {
    email: sessionUser.email,
    name: sessionUser.name,
    userId: userId,
    role: sessionUser.role
  })
  
  // WORKAROUND: Se não há ID na sessão, buscar pelo email na base de dados
  if (!userId && sessionUser.email) {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
      const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
      
      const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      })
      
      const { data: userData, error } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('email', sessionUser.email)
        .single()
      
      if (!error && userData) {
        userId = userData.id
      }
    } catch (error) {
      console.error('Erro ao buscar ID do usuário:', error)
    }
  }
  
  return {
    id: userId,
    email: sessionUser.email,
    name: sessionUser.name,
    image: sessionUser.image
  }
}

export async function getUserProfile() {
  const user = await getUser()
  
  if (!user) {
    return null
  }
  
  try {
    // Get user role and profile data from Supabase
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()
    
    if (userError) {
      console.error('Error fetching user data:', userError)
      return { user, role: 'user', profile: null }
    }
    
    // Get full profile data
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()
    
    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Error fetching profile:', profileError)
    }
    
    return { 
      user, 
      role: userData?.role || 'user',
      profile: profile || null 
    }
  } catch (error) {
    console.error('Error in getUserProfile:', error)
    return { user, role: 'user', profile: null }
  }
}

export async function getUserRole() {
  const user = await getUser()
  
  if (!user) {
    return null
  }
  
  try {
    const { data, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()
    
    if (error) {
      console.error('Error fetching user role:', error)
      return 'user'
    }
    
    return data?.role || 'user'
  } catch (error) {
    console.error('Error in getUserRole:', error)
    return 'user'
  }
}

export async function requireAuth() {
  const user = await getUser()
  if (!user) {
    redirect('/auth/login')
  }
  return user
}

export async function requireRole(requiredRole: 'admin' | 'therapist') {
  const user = await requireAuth()
  const role = await getUserRole()
  
  if (role !== requiredRole && role !== 'admin') {
    redirect('/') // Redirect to dashboard if insufficient permissions
  }
  
  return { user, role }
}

export async function requireCompleteProfile() {
  const userProfile = await getUserProfile()
  if (!userProfile) {
    redirect('/auth/login')
  }
  
  if (!userProfile.profile) {
    redirect('/onboarding/profile')
  }
  
  return userProfile
}

// Client-side auth helpers
export function useAuthClient() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const signUpUser = async (email: string, password: string, metadata?: UserMetadata) => {
    try {
      // This will need to be implemented with your NextAuth provider
      // For now, returning an error to indicate it needs implementation
      return { data: null, error: { message: 'Sign up needs to be implemented with NextAuth provider' } }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Sign up failed'
      return { data: null, error: { message: errorMessage } }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const signInUser = async (email: string, password: string) => {
    try {
      // This will need to be implemented with your NextAuth provider
      // For now, returning an error to indicate it needs implementation
      return { data: null, error: { message: 'Sign in needs to be implemented with NextAuth provider' } }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Sign in failed'
      return { data: null, error: { message: errorMessage } }
    }
  }

  const signOutUser = async () => {
    try {
      // Use NextAuth signOut on client side
      const { signOut } = await import('next-auth/react')
      await signOut()
      return { error: null }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Sign out failed'
      return { error: { message: errorMessage } }
    }
  }

  const resetPassword = async () => {
    try {
      // Password reset needs to be implemented with your NextAuth provider
      return { error: { message: 'Password reset not yet implemented' } }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Reset password failed'
      return { error: { message: errorMessage } }
    }
  }

  return {
    signUp: signUpUser,
    signIn: signInUser,
    signOut: signOutUser,
    resetPassword
  }
}

// Database helpers
export async function createUserProfile(userId: string, userData: CreateUserData) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        user_id: userId,
        first_name: userData.profile?.first_name,
        last_name: userData.profile?.last_name,
        birth_date: userData.profile?.birth_date,
        gender: userData.profile?.gender,
        location_city: userData.profile?.location_city,
        location_state: userData.profile?.location_state,
        location_country: userData.profile?.location_country || 'Brazil',
        bio: userData.profile?.bio,
        interests: userData.profile?.interests || []
      })
    
    if (error) {
      console.error('Error creating user profile:', error)
      return { success: false, error }
    }
    
    return { success: true, data }
  } catch (error) {
    console.error('Error in createUserProfile:', error)
    return { success: false, error }
  }
}

export async function updateUserProfile(userId: string, profileData: UpdateProfileData) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        first_name: profileData.first_name,
        last_name: profileData.last_name,
        birth_date: profileData.birth_date,
        gender: profileData.gender,
        location_city: profileData.location_city,
        location_state: profileData.location_state,
        location_country: profileData.location_country,
        occupation: profileData.occupation,
        education_level: profileData.education_level,
        height_cm: profileData.height_cm,
        relationship_status: profileData.relationship_status,
        has_children: profileData.has_children,
        wants_children: profileData.wants_children,
        bio: profileData.bio,
        interests: profileData.interests,
        profile_photos: profileData.photos,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
    
    if (error) {
      console.error('Error updating user profile:', error)
      return { success: false, error }
    }
    
    return { success: true, data }
  } catch (error) {
    console.error('Error in updateUserProfile:', error)
    return { success: false, error }
  }
} 