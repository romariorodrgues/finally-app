// Database types for Finally platform
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          role: 'user' | 'admin' | 'therapist'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          role?: 'user' | 'admin' | 'therapist'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: 'user' | 'admin' | 'therapist'
          updated_at?: string
        }
      }
      leads: {
        Row: {
          id: number
          first_name: string
          last_name: string
          email: string
          phone?: string
          age?: number
          city?: string
          how_did_you_hear?: string
          status: 'pending' | 'converted' | 'rejected'
          utm_source?: string
          utm_medium?: string
          utm_campaign?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          first_name: string
          last_name: string
          email: string
          phone?: string
          age?: number
          city?: string
          how_did_you_hear?: string
          utm_source?: string
          utm_medium?: string
          utm_campaign?: string
        }
      }
      profiles: {
        Row: {
          id: number
          user_id: string
          first_name: string
          last_name: string
          birth_date: string
          gender: 'male' | 'female' | 'non_binary' | 'other'
          location_city: string
          location_state: string
          location_country: string
          occupation?: string
          education_level?: string
          height_cm?: number
          relationship_status: 'single' | 'divorced' | 'widowed'
          has_children: boolean
          wants_children?: string
          children_count?: number
          bio?: string
          interests?: string[]
          photos?: string[]
          profile_completion_percentage: number
          is_profile_public: boolean
          last_active?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          first_name: string
          last_name: string
          birth_date: string
          gender: 'male' | 'female' | 'non_binary' | 'other'
          location_city: string
          location_state: string
          location_country?: string
          occupation?: string
          education_level?: string
          height_cm?: number
          relationship_status: 'single' | 'divorced' | 'widowed'
          has_children?: boolean
          wants_children?: string
          children_count?: number
          bio?: string
          interests?: string[]
          photos?: string[]
        }
      }
      questionnaires: {
        Row: {
          id: number
          user_id: string
          // Personal Data
          full_name?: string
          birth_date?: string
          nationality?: string
          current_city?: string
          current_country?: string
          future_location_preference?: string
          profession?: string
          current_position?: string
          education_level?: string
          education_details?: string
          religion?: string
          religious_practice_level?: string
          has_children?: boolean
          children_count?: number
          children_ages?: string
          wants_more_children?: string
          children_timeline?: string
          // Personality & Behavior (continues with all 184 fields...)
          created_at: string
          updated_at: string
        }
      }
      matches: {
        Row: {
          id: number
          user1_id: string
          user2_id: string
          compatibility_score: number
          ai_analysis?: object
          matching_factors?: object
          potential_challenges?: object
          status: 'suggested' | 'mutual_like' | 'chat_started' | 'blocked' | 'expired'
          user1_action?: string
          user2_action?: string
          user1_action_at?: string
          user2_action_at?: string
          expires_at?: string
          created_at: string
          updated_at: string
        }
      }
      chats: {
        Row: {
          id: number
          match_id: number
          user1_id: string
          user2_id: string
          status: 'active' | 'archived' | 'blocked_by_user1' | 'blocked_by_user2' | 'blocked_by_admin'
          chat_type: 'match_chat' | 'support_chat'
          total_messages: number
          last_message_at?: string
          last_message_preview?: string
          user1_last_read_at?: string
          user2_last_read_at?: string
          user1_unread_count: number
          user2_unread_count: number
          created_at: string
          updated_at: string
        }
      }
      messages: {
        Row: {
          id: number
          chat_id: number
          sender_id: string
          content: string
          message_type: 'text' | 'image' | 'emoji' | 'system' | 'gif'
          media_url?: string
          media_type?: string
          media_size_bytes?: number
          status: 'sent' | 'delivered' | 'read' | 'failed' | 'deleted'
          is_edited: boolean
          edited_at?: string
          is_filtered: boolean
          filter_reason?: string
          reply_to_message_id?: number
          created_at: string
          updated_at: string
        }
      }
      therapists: {
        Row: {
          id: number
          user_id: string
          full_name: string
          professional_title: string
          crp_number: string
          license_state: string
          specialties: string[]
          approach_types?: string[]
          languages: string[]
          years_experience: number
          education?: object
          certifications?: object
          professional_bio: string
          session_types: string[]
          session_price_range: string
          availability_hours?: object
          timezone: string
          booking_url?: string
          video_platform_preferences?: string[]
          status: 'active' | 'inactive' | 'pending_verification'
          average_rating?: number
          total_reviews: number
          total_sessions: number
          profile_photo_url?: string
          verification_status: 'pending' | 'verified' | 'rejected'
          verification_documents?: string[]
          verification_notes?: string
          created_at: string
          updated_at: string
        }
      }
      payments: {
        Row: {
          id: number
          lead_id?: number
          user_id?: string
          customer_email: string
          customer_name: string
          payment_intent_id?: string
          gateway_provider: 'stripe' | 'pagseguro' | 'mercadopago' | 'asaas'
          gateway_payment_id: string
          gateway_customer_id?: string
          plan_type: 'basic' | 'premium' | 'vip'
          plan_name: string
          amount_cents: number
          currency: string
          payment_method?: string
          status: 'pending' | 'completed' | 'failed' | 'refunded' | 'cancelled'
          payment_date?: string
          subscription_start_date?: string
          subscription_end_date?: string
          is_recurring: boolean
          recurring_interval?: string
          next_billing_date?: string
          created_at: string
          updated_at: string
        }
      }
    }
  }
} 