"use client"

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Heart, ChevronLeft, ChevronRight, Save, Sparkles, Clock, CheckCircle, User, Briefcase } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { createClient } from '@/lib/supabase/client'
import type { User as SupabaseUser } from '@supabase/supabase-js'

// Tipos de perguntas
type QuestionType = "multiple_choice" | "scale" | "text" | "multiple_select" | "yes_no" | "input" | "select"

interface Question {
  id: string
  type: QuestionType
  question: string
  description?: string
  required: boolean
  options?: string[]
  min?: number
  max?: number
  placeholder?: string
  field: string // Campo no banco de dados
}

interface Section {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  questions: Question[]
}

// Questionnaire data based on form.md (120 questions)
const questionnaireData: Section[] = [
  {
    id: "dados_pessoais",
    title: "Personal Data and Basic Information",
    description: "Tell us a little about yourself",
    icon: <User className="h-5 w-5" />,
    questions: [
      {
        id: "q1",
        type: "input",
        question: "Full name, date of birth and nationality",
        required: true,
        placeholder: "Ex: Maria Silva, 03/15/1990, Brazilian",
        field: "personal_info"
      },
      {
        id: "q2",
        type: "text",
        question: "City and country where you currently live and where you would like to live in the future",
        required: true,
        placeholder: "Describe where you live and your future location plans...",
        field: "location_current_future"
      },
      {
        id: "q3",
        type: "text",
        question: "Profession and what position do you currently hold? What is your education level and qualifications obtained?",
        required: true,
        placeholder: "Describe your profession, position, education and qualifications...",
        field: "profession_education"
      },
      {
        id: "q4",
        type: "text",
        question: "Religion or spiritual belief and relationship with religious practice",
        required: false,
        placeholder: "Describe your religion/belief and whether you are practicing, sporadic, non-practicing, atheist or agnostic...",
        field: "religion_practice"
      },
      {
        id: "q5",
        type: "text",
        question: "Do you have children? If so, how many and what ages? Would you like to have (more) children?",
        required: true,
        placeholder: "Describe your current situation with children and future plans...",
        field: "children_status_plans"
      },
      {
        id: "q6",
        type: "text",
        question: "How do you feel about dating someone who already has children? If your partner decides they want child(ren) and you don't, how would you handle it?",
        required: false,
        placeholder: "Share your feelings about being in a relationship with someone who has children...",
        field: "dating_with_children_feelings"
      },
      {
        id: "q7",
        type: "text",
        question: "Current marital status and time since last serious relationship (how long did it last?)",
        required: true,
        placeholder: "Describe your marital status and recent relationship history...",
        field: "relationship_status_history"
      },
      {
        id: "q8",
        type: "text",
        question: "How do you evaluate your experience with previous relationships and what is the main lesson you learned?",
        required: false,
        placeholder: "Reflect on your past experiences and learnings...",
        field: "past_relationships_lessons"
      },
      {
        id: "q9",
        type: "multiple_choice",
        question: "Are you willing to move to another city or country for love?",
        required: true,
        options: ["Yes, no problem", "Yes, but it would depend on the circumstances", "Maybe", "Probably not", "Definitely not"],
        field: "willing_to_relocate"
      },
      {
        id: "q10",
        type: "text",
        question: "How do you feel about long-distance relationships?",
        required: false,
        placeholder: "Share your opinion about long-distance relationships...",
        field: "long_distance_feelings"
      },
      {
        id: "q11",
        type: "multiple_choice",
        question: "Do you live alone or with family/friends?",
        required: true,
        options: ["Alone", "With family", "With friends/roommates", "With partner", "Other"],
        field: "living_situation"
      },
      {
        id: "q12",
        type: "text",
        question: "Do you have pets? If so, which ones? Do you like animals?",
        required: false,
        placeholder: "Tell us about your pets and relationship with animals...",
        field: "pets_animal_relationship"
      }
    ]
  },
  {
    id: "estilo_vida",
    title: "Lifestyle and Routine",
    description: "How you live your day to day life",
    icon: <Clock className="h-5 w-5" />,
    questions: [
      {
        id: "q13",
        type: "text",
        question: "Do you consider yourself more of a morning or night person? How many hours do you usually sleep? How do you usually start your day?",
        required: true,
        placeholder: "Describe your circadian rhythm, sleep hours and morning routine...",
        field: "daily_rhythm_sleep"
      },
      {
        id: "q14",
        type: "text",
        question: "What is your work routine and how do you organize your free time?",
        required: true,
        placeholder: "Describe your work routine and how you use your free time...",
        field: "work_routine_free_time"
      },
      {
        id: "q15",
        type: "text",
        question: "Do you like to travel? What is your dream destination?",
        required: false,
        placeholder: "Tell us about your passion for travel and dream destination...",
        field: "travel_dream_destination"
      },
      {
        id: "q16",
        type: "text",
        question: "Do you prefer beaches, mountains, big cities or countryside? What was the best trip you've ever taken?",
        required: false,
        placeholder: "Describe your environment preferences and best trip...",
        field: "environment_preference_best_trip"
      },
      {
        id: "q17",
        type: "text",
        question: "What is your relationship with physical exercise? Do you have a favorite sport?",
        required: false,
        placeholder: "Tell us about your relationship with exercise and favorite sports...",
        field: "exercise_sports_relationship"
      },
      {
        id: "q18",
        type: "multiple_choice",
        question: "Do you prefer gym, outdoor sports or calmer activities like yoga and pilates?",
        required: false,
        options: ["Gym", "Outdoor sports", "Yoga/Pilates", "I don't exercise", "I vary between different activities"],
        field: "exercise_preference_type"
      },
      {
        id: "q19",
        type: "text",
        question: "Do you care about healthy eating? Do you have any specific diet or dietary restrictions?",
        required: false,
        placeholder: "Describe your relationship with nutrition, diets and restrictions...",
        field: "nutrition_diet_restrictions"
      },
      {
        id: "q20",
        type: "text",
        question: "Do you smoke? Do you use any type of drugs? Do you drink alcohol? Describe frequency and type of drink",
        required: false,
        placeholder: "Share your habits with smoking, drugs and alcohol (optional)...",
        field: "substance_use_habits"
      },
      {
        id: "q21",
        type: "text",
        question: "Do you like going out to bars and parties or do you prefer quieter activities? What activities do you prefer?",
        required: false,
        placeholder: "Describe your favorite activities and social preferences...",
        field: "social_entertainment_preferences"
      },
      {
        id: "q22",
        type: "text",
        question: "What is your favorite type of restaurant? Do you like to cook?",
        required: false,
        placeholder: "Tell us about your culinary preferences and cooking skills...",
        field: "food_cooking_preferences"
      },
      {
        id: "q23",
        type: "text",
        question: "How do you usually spend your weekends?",
        required: false,
        placeholder: "Describe how you like to spend your weekends...",
        field: "weekend_activities"
      },
      {
        id: "q24",
        type: "text",
        question: "What is your relationship with social media? How much time do you spend on them daily?",
        required: false,
        placeholder: "Describe your social media usage and time spent...",
        field: "social_media_usage"
      }
    ]
  },
  {
    id: "valores_personalidade",
    title: "Values and Personality",
    description: "Your fundamental values and personality traits",
    icon: <Sparkles className="h-5 w-5" />,
    questions: [
      {
        id: "q25",
        type: "text",
        question: "How would you describe yourself in three words? How would your friends describe you?",
        required: true,
        placeholder: "Describe yourself in three words and how friends see you...",
        field: "self_description_friends_view"
      },
      {
        id: "q26",
        type: "scale",
        question: "Do you consider yourself more introverted or extroverted?",
        description: "1 = Very introverted, 10 = Very extroverted",
        min: 1,
        max: 10,
        required: true,
        field: "introvert_extrovert_scale"
      },
      {
        id: "q27",
        type: "text",
        question: "What is most important to you in a relationship? What type of relationship doesn't interest you?",
        required: true,
        placeholder: "Describe what you value and what you definitely don't want...",
        field: "relationship_priorities_dislikes"
      },
      {
        id: "q28",
        type: "scale",
        question: "Are you more rational or emotional?",
        description: "1 = Very rational, 10 = Very emotional",
        min: 1,
        max: 10,
        required: true,
        field: "rational_emotional_scale"
      },
      {
        id: "q29",
        type: "text",
        question: "How do you handle conflicts in a relationship?",
        required: false,
        placeholder: "Describe how you usually handle conflicts and arguments...",
        field: "conflict_handling_style"
      },
      {
        id: "q30",
        type: "text",
        question: "What can make you lose interest in someone quickly?",
        required: false,
        placeholder: "Share your deal breakers and red flags...",
        field: "interest_killers"
      },
      {
        id: "q31",
        type: "text",
        question: "What is your biggest flaw and your greatest strength?",
        required: true,
        placeholder: "Be honest about your biggest flaw and greatest strength...",
        field: "biggest_flaw_strength"
      },
      {
        id: "q32",
        type: "text",
        question: "How do you show affection and love? What makes you feel loved?",
        required: true,
        placeholder: "Describe how you express love and what makes you feel loved...",
        field: "love_expression_reception"
      },
      {
        id: "q33",
        type: "multiple_choice",
        question: "Do you prefer grand romantic gestures or small daily demonstrations of love?",
        required: true,
        options: ["Grand romantic gestures", "Small daily demonstrations", "Both equally", "Depends on the moment"],
        field: "romantic_gesture_preference"
      },
      {
        id: "q34",
        type: "text",
        question: "What is unforgivable for you in a relationship?",
        required: true,
        placeholder: "Describe what you consider absolutely unforgivable...",
        field: "unforgivable_relationship_actions"
      },
      {
        id: "q35",
        type: "text",
        question: "What makes you admire someone? What do you consider your greatest quality?",
        required: true,
        placeholder: "Tell us what makes you admire people and your greatest quality...",
        field: "admiration_triggers_best_quality"
      }
    ]
  },
  {
    id: "interesses_cultura",
    title: "Interests and Culture",
    description: "Your hobbies, cultural tastes and pastimes",
    icon: <Briefcase className="h-5 w-5" />,
    questions: [
      {
        id: "q36",
        type: "text",
        question: "What are your hobbies and what do you like to do in your free time? Do you enjoy your own company?",
        required: false,
        placeholder: "Tell us about your hobbies and how you feel about being alone...",
        field: "hobbies_solitude_comfort"
      },
      {
        id: "q37",
        type: "text",
        question: "Do you like to read? What is your favorite book?",
        required: false,
        placeholder: "Share your relationship with reading and your favorite book...",
        field: "reading_favorite_book"
      },
      {
        id: "q38",
        type: "text",
        question: "Do you prefer movies, TV series or documentaries? What is your favorite movie?",
        required: false,
        placeholder: "Tell us about your audiovisual preferences and favorite movie...",
        field: "entertainment_preference_favorite"
      },
      {
        id: "q39",
        type: "text",
        question: "What is your preferred music style? Do you like going to concerts and musical events?",
        required: false,
        placeholder: "Describe your musical tastes and experience with concerts...",
        field: "music_preference_concerts"
      },
      {
        id: "q40",
        type: "multiple_choice",
        question: "Do you prefer theater, cinema or museums?",
        required: false,
        options: ["Theater", "Cinema", "Museums", "All equally", "None especially"],
        field: "cultural_venue_preference"
      },
      {
        id: "q41",
        type: "text",
        question: "Do you like cultural festivals? Do you have any cultural tradition that you make sure to maintain?",
        required: false,
        placeholder: "Tell us about your interest in culture and important traditions...",
        field: "cultural_festivals_traditions"
      }
    ]
  },
  {
    id: "relacionamento_ideal",
    title: "Ideal Relationship",
    description: "How you view love and relationships",
    icon: <Heart className="h-5 w-5" fill="currentColor" />,
    questions: [
      {
        id: "q42",
        type: "text",
        question: "What would your ideal partner be like?",
        required: true,
        placeholder: "Describe in detail what your ideal partner would be like...",
        field: "ideal_partner_description"
      },
      {
        id: "q43",
        type: "text",
        question: "What attracts you most in a person?",
        required: true,
        placeholder: "Share what attracts you most physically and emotionally...",
        field: "attraction_factors"
      },
      {
        id: "q44",
        type: "text",
        question: "Would you have sexual relations with someone before marriage? And if your partner didn't want to, what would be your position?",
        required: false,
        placeholder: "Share your views on intimacy before marriage...",
        field: "sex_before_marriage_views"
      },
      {
        id: "q45",
        type: "text",
        question: "How do you deal with differences of opinion in a relationship?",
        required: true,
        placeholder: "Describe how you navigate differences of opinion with partners...",
        field: "opinion_differences_handling"
      },
      {
        id: "q46",
        type: "text",
        question: "What do you expect from communication in a relationship?",
        required: true,
        placeholder: "Describe your expectations about communication in relationships...",
        field: "communication_expectations"
      },
      {
        id: "q47",
        type: "multiple_choice",
        question: "Do you prefer more traditional or modern relationships?",
        required: true,
        options: ["More traditional", "More modern", "Mix of both", "Depends on the situation"],
        field: "relationship_style_preference"
      },
      {
        id: "q48",
        type: "text",
        question: "Do you like to show affection? And publicly?",
        required: true,
        placeholder: "Tell us about how you show affection in public and private...",
        field: "affection_display_comfort"
      },
      {
        id: "q49",
        type: "text",
        question: "How do you imagine your love life in five years?",
        required: true,
        placeholder: "Describe how you visualize your love life in the future...",
        field: "love_life_five_year_vision"
      }
    ]
  },
  {
    id: "autoconhecimento",
    title: "Self-Knowledge and Personal Growth",
    description: "Your personal development journey",
    icon: <Sparkles className="h-5 w-5" />,
    questions: [
      {
        id: "q50",
        type: "text",
        question: "Have you done therapy or coaching? For how long have you done or are you doing it?",
        required: false,
        placeholder: "Share your experience with therapy or coaching...",
        field: "therapy_coaching_experience"
      },
      {
        id: "q51",
        type: "yes_no",
        question: "Are you interested in personal development?",
        required: true,
        field: "personal_development_interest"
      },
      {
        id: "q52",
        type: "text",
        question: "How do you handle criticism and frustrations?",
        required: false,
        placeholder: "Describe how you react to criticism and frustrating moments...",
        field: "criticism_frustration_handling"
      },
      {
        id: "q53",
        type: "text",
        question: "What was the most transformative moment of your life? Write a little about it.",
        required: false,
        placeholder: "Share a moment that transformed you deeply...",
        field: "most_transformative_moment"
      },
      {
        id: "q54",
        type: "scale",
        question: "Do you forgive easily?",
        description: "1 = Very difficult to forgive, 10 = I forgive easily",
        min: 1,
        max: 10,
        required: true,
        field: "forgiveness_ease_scale"
      },
      {
        id: "q55",
        type: "yes_no",
        question: "Do you feel ready for a serious relationship?",
        required: true,
        field: "ready_for_serious_relationship"
      }
    ]
  },
  {
    id: "trajetoria_vida",
    title: "Life Journey and Personal Experiences",
    description: "Your most significant life experiences",
    icon: <User className="h-5 w-5" />,
    questions: [
      {
        id: "q56",
        type: "text",
        question: "Did you have a happy childhood? Describe a little about your childhood.",
        required: false,
        placeholder: "Share how your childhood was and main memories...",
        field: "childhood_description"
      },
      {
        id: "q57",
        type: "text",
        question: "How was and how is your relationship with your parents currently?",
        required: false,
        placeholder: "Describe your past and current relationship with your parents...",
        field: "parents_relationship"
      },
      {
        id: "q58",
        type: "text",
        question: "Do you have siblings? How is your relationship with them?",
        required: false,
        placeholder: "Tell us about your siblings and how the relationship is...",
        field: "siblings_relationship"
      },
      {
        id: "q59",
        type: "text",
        question: "Have you ever lived in another city or country, different from where you were born? If so, where and for how long?",
        required: false,
        placeholder: "Share your experiences living in other places...",
        field: "living_elsewhere_experience"
      },
      {
        id: "q60",
        type: "text",
        question: "What was the biggest challenge you have ever faced in life?",
        required: false,
        placeholder: "Describe the biggest challenge you have overcome...",
        field: "biggest_life_challenge"
      },
      {
        id: "q61",
        type: "scale",
        question: "Do you find it easy to make new friendships?",
        description: "1 = Very difficult, 10 = Very easy",
        min: 1,
        max: 10,
        required: true,
        field: "friendship_making_ease"
      },
      {
        id: "q62",
        type: "multiple_choice",
        question: "Do you maintain contact with ex-partners or prefer to cut off relations?",
        required: false,
        options: ["I maintain friendly contact", "I cut off relations completely", "Depends on the ex", "Minimal contact only"],
        field: "ex_contact_preference"
      }
    ]
  },
  {
    id: "habitos_financeiros",
    title: "Financial and Professional Habits",
    description: "Your relationship with money and career",
    icon: <Briefcase className="h-5 w-5" />,
    questions: [
      {
        id: "q63",
        type: "text",
        question: "Do you consider yourself a financially organized person? If you feel comfortable, share an estimate of your annual income.",
        required: false,
        placeholder: "Describe your financial organization and income (optional)...",
        field: "financial_organization_income"
      },
      {
        id: "q64",
        type: "text",
        question: "When you have money available, do you prefer to invest in experiences or material goods?",
        required: false,
        placeholder: "Share your spending priorities with examples...",
        field: "spending_preferences"
      },
      {
        id: "q65",
        type: "multiple_choice",
        question: "What is more important: financial stability or professional fulfillment?",
        required: true,
        options: ["Financial stability", "Professional fulfillment", "Both equally", "Depends on the moment in life"],
        field: "stability_vs_fulfillment"
      },
      {
        id: "q66",
        type: "text",
        question: "How do you handle debts and financial commitments?",
        required: false,
        placeholder: "Describe how you manage debts and financial responsibilities...",
        field: "debt_management_approach"
      },
      {
        id: "q67",
        type: "multiple_choice",
        question: "Do you think couples should completely share finances or maintain financial independence?",
        required: true,
        options: ["Share everything", "Maintain total independence", "Hybrid (some things shared)", "Depends on the situation"],
        field: "couple_finances_philosophy"
      }
    ]
  },
  {
    id: "preferencias_sociais",
    title: "Lifestyle and Social Preferences",
    description: "How you relate socially",
    icon: <Heart className="h-5 w-5" />,
    questions: [
      {
        id: "q68",
        type: "multiple_choice",
        question: "Do you like receiving visitors at home or do you prefer your privacy?",
        required: false,
        options: ["I love receiving visitors", "I like it occasionally", "I prefer my privacy", "Depends on who it is"],
        field: "home_visits_preference"
      },
      {
        id: "q69",
        type: "scale",
        question: "Do you like parties and social events?",
        description: "1 = I hate parties, 10 = I love parties",
        min: 1,
        max: 10,
        required: true,
        field: "party_social_events_enjoyment"
      },
      {
        id: "q70",
        type: "multiple_choice",
        question: "Do you feel comfortable in large groups or do you prefer more intimate gatherings?",
        required: true,
        options: ["Large groups", "Intimate gatherings", "Both equally", "Depends on the context"],
        field: "group_size_preference"
      },
      {
        id: "q71",
        type: "scale",
        question: "Do you prefer staying at home or going out?",
        description: "1 = I love staying at home, 10 = I always want to go out",
        min: 1,
        max: 10,
        required: true,
        field: "home_vs_out_preference"
      }
    ]
  },
  {
    id: "comportamento_relacionamento",
    title: "Behavior in a Relationship",
    description: "How you act when you are in a relationship",
    icon: <Heart className="h-5 w-5" fill="currentColor" />,
    questions: [
      {
        id: "q72",
        type: "text",
        question: "What makes you feel secure in a relationship?",
        required: true,
        placeholder: "Describe what brings you security in relationships...",
        field: "relationship_security_factors"
      },
      {
        id: "q73",
        type: "text",
        question: "How do you handle jealousy in relationships?",
        required: false,
        placeholder: "Share how you react and deal with feelings of jealousy...",
        field: "jealousy_handling"
      },
      {
        id: "q74",
        type: "text",
        question: "Have you ever been betrayed? How did you deal with it?",
        required: false,
        placeholder: "If you feel comfortable, share your experience...",
        field: "betrayal_experience_handling"
      },
      {
        id: "q75",
        type: "text",
        question: "Have you ever cheated on someone? If so, what did you learn from it?",
        required: false,
        placeholder: "If applicable, share your learnings...",
        field: "cheating_experience_lessons"
      },
      {
        id: "q76",
        type: "text",
        question: "Do you think a couple should share all social media and phone passwords? Why?",
        required: false,
        placeholder: "Share your opinion about digital privacy in relationships...",
        field: "digital_privacy_sharing_opinion"
      },
      {
        id: "q77",
        type: "text",
        question: "Do you like romantic surprises? Do you prefer giving or receiving gifts?",
        required: false,
        placeholder: "Tell us about your relationship with surprises and gifts...",
        field: "surprises_gifts_preference"
      },
      {
        id: "q78",
        type: "text",
        question: "Do you believe you have any pattern that has repeated in your previous relationships?",
        required: false,
        placeholder: "Reflect on patterns you identify in your relationships...",
        field: "relationship_patterns_recognition"
      }
    ]
  },
  {
    id: "sexualidade_intimidade",
    title: "Sexuality and Intimacy",
    description: "Your preferences and views on intimacy",
    icon: <Heart className="h-5 w-5" fill="currentColor" />,
    questions: [
      {
        id: "q79",
        type: "scale",
        question: "How do you evaluate the importance of sex in a relationship? From 0 to 10, what value do you give to sex in your life?",
        min: 0,
        max: 10,
        required: true,
        field: "sex_importance_scale"
      },
      {
        id: "q80",
        type: "text",
        question: "During sexual relations do you consider yourself more reserved or outgoing? Do you feel comfortable talking about your preferences in intimacy?",
        required: false,
        placeholder: "Share how you see yourself in intimacy and communication about sex...",
        field: "sexual_personality_communication"
      },
      {
        id: "q81",
        type: "multiple_choice",
        question: "Do you consider yourself open to exploring new experiences in sex or do you prefer to maintain a stable routine?",
        required: false,
        options: ["Very open to exploring", "Moderately open", "I prefer stable routine", "Depends on the partner"],
        field: "sexual_exploration_openness"
      }
    ]
  },
  {
    id: "futuro_propositos",
    title: "Future and Life Purposes",
    description: "Your dreams and plans for the future",
    icon: <Sparkles className="h-5 w-5" />,
    questions: [
      {
        id: "q82",
        type: "text",
        question: "How do you imagine your life in 10 years?",
        required: true,
        placeholder: "Describe your vision of the future in 10 years...",
        field: "ten_year_life_vision"
      },
      {
        id: "q83",
        type: "text",
        question: "Do you have a dream you still want to achieve? What is it?",
        required: false,
        placeholder: "Share an important dream you still want to accomplish...",
        field: "unrealized_dream"
      },
      {
        id: "q84",
        type: "multiple_choice",
        question: "Do you believe a relationship needs constant effort or should it be light and natural?",
        required: true,
        options: ["Constant effort", "Should be light and natural", "Balance between both", "Depends on the phase of the relationship"],
        field: "relationship_effort_philosophy"
      },
      {
        id: "q85",
        type: "text",
        question: "What is happiness for you?",
        required: true,
        placeholder: "Define what happiness means in your life...",
        field: "happiness_definition"
      },
      {
        id: "q86",
        type: "text",
        question: "What advice would you give to someone who is looking for true love?",
        required: false,
        placeholder: "Share your wisdom about finding true love...",
        field: "love_advice_to_others"
      },
      {
        id: "q87",
        type: "multiple_choice",
        question: "Do you believe a couple should make plans for the future together from the beginning or should this happen naturally?",
        required: true,
        options: ["Plans from the beginning", "Should happen naturally", "Depends on the intensity of the relationship", "Basic plans at first, details later"],
        field: "future_planning_approach"
      },
      {
        id: "q88",
        type: "multiple_choice",
        question: "Are you interested in marriage or do you think it's not essential for a relationship?",
        required: true,
        options: ["Marriage is essential", "Not essential, but I would like it", "Indifferent to marriage", "I prefer civil union"],
        field: "marriage_importance_view"
      },
      {
        id: "q89",
        type: "text",
        question: "Do you have a retirement plan? At what age do you intend to retire?",
        required: false,
        placeholder: "Share your retirement plans and ideal age...",
        field: "retirement_plans"
      },
      {
        id: "q90",
        type: "text",
        question: "What are your plans after retirement?",
        required: false,
        placeholder: "Describe how you would like to live after retirement...",
        field: "post_retirement_plans"
      },
      {
        id: "q91",
        type: "text",
        question: "What is your biggest fear regarding a relationship?",
        required: false,
        placeholder: "Share your biggest fears in relationships...",
        field: "relationship_biggest_fear"
      },
      {
        id: "q92",
        type: "text",
        question: "What do you think will change in your life when you find a great love?",
        required: false,
        placeholder: "Reflect on how love will transform your life...",
        field: "love_life_transformation_expectation"
      }
    ]
  },
  {
    id: "relacionamentos_passados",
    title: "Past Relationships and Expectations",
    description: "Your experiences and learnings in relationships",
    icon: <Clock className="h-5 w-5" />,
    questions: [
      {
        id: "q93",
        type: "text",
        question: "How do you describe yourself when you are in a relationship?",
        required: true,
        placeholder: "Describe how you act and behave in relationships...",
        field: "self_in_relationship_description"
      },
      {
        id: "q94",
        type: "multiple_choice",
        question: "Do you believe that each person has a soulmate or that love is a construction?",
        required: true,
        options: ["I believe in soulmates", "Love is a construction", "A mix of both", "I'm not sure"],
        field: "soulmate_vs_construction_belief"
      },
      {
        id: "q95",
        type: "text",
        question: "Have you ever made a big life change for love? And what is true love for you?",
        required: false,
        placeholder: "Tell about changes for love and your definition of true love...",
        field: "love_changes_true_love_definition"
      },
      {
        id: "q96",
        type: "text",
        question: "Have you ever felt lonely in a relationship? If so, tell us a little about it.",
        required: false,
        placeholder: "If applicable, share about feelings of loneliness in relationships...",
        field: "loneliness_in_relationship_experience"
      },
      {
        id: "q97",
        type: "text",
        question: "Have you ever been in an abusive relationship? If so, how did you deal with it?",
        required: false,
        placeholder: "If you feel comfortable, share your experience and recovery...",
        field: "abusive_relationship_experience"
      },
      {
        id: "q98",
        type: "text",
        question: "How is or was your parents' relationship?",
        required: false,
        placeholder: "Describe your parents' relationship and how it influences you...",
        field: "parents_relationship_influence"
      }
    ]
  },
  {
    id: "vida_profissional",
    title: "Professional Life and Ambitions",
    description: "Your professional goals and career vision",
    icon: <Briefcase className="h-5 w-5" />,
    questions: [
      {
        id: "q99",
        type: "text",
        question: "What has been your greatest professional achievement so far?",
        required: false,
        placeholder: "Share your greatest professional accomplishment...",
        field: "biggest_professional_achievement"
      },
      {
        id: "q100",
        type: "multiple_choice",
        question: "Do you have ambitions to grow in your career or do you already feel satisfied with your trajectory?",
        required: true,
        options: ["I have great ambitions", "I want to grow moderately", "I'm satisfied where I am", "In transition/rethinking"],
        field: "career_ambition_level"
      },
      {
        id: "q101",
        type: "multiple_choice",
        question: "Would you like to be an entrepreneur or do you prefer working as an employee?",
        required: false,
        options: ["I want to be an entrepreneur", "I prefer being an employee", "I'm already an entrepreneur", "I have no preference"],
        field: "entrepreneurship_vs_employment"
      },
      {
        id: "q102",
        type: "text",
        question: "How do you handle financial emergencies?",
        required: false,
        placeholder: "Describe how you prepare for and react to financial emergencies...",
        field: "financial_emergency_handling"
      },
      {
        id: "q103",
        type: "multiple_choice",
        question: "Would you feel comfortable if your partner earned much more or much less than you?",
        required: true,
        options: ["Comfortable in both cases", "Comfortable if I earn more", "Comfortable if I earn less", "Any big difference would bother me"],
        field: "income_disparity_comfort"
      },
      {
        id: "q104",
        type: "text",
        question: "What is your philosophy about dividing expenses in a relationship?",
        required: true,
        placeholder: "Share how you believe couples should divide expenses...",
        field: "expense_sharing_philosophy"
      },
      {
        id: "q105",
        type: "yes_no",
        question: "Do you believe money can be a problem in relationships?",
        required: true,
        field: "money_relationship_problem_belief"
      },
      {
        id: "q106",
        type: "text",
        question: "Do you work in-person or remotely? Do you have your own business or work for a company? How long have you been in your current job?",
        required: true,
        placeholder: "Describe your current work situation and time in your job...",
        field: "current_work_situation"
      }
    ]
  },
  {
    id: "vida_social",
    title: "Social Life and Preferences",
    description: "How you behave socially",
    icon: <User className="h-5 w-5" />,
    questions: [
      {
        id: "q107",
        type: "scale",
        question: "Do you like talking to strangers?",
        description: "1 = I hate it, 10 = I love it",
        min: 1,
        max: 10,
        required: true,
        field: "stranger_conversation_comfort"
      },
      {
        id: "q108",
        type: "multiple_choice",
        question: "Do you have a more reserved side or do you like to share your personal life?",
        required: true,
        options: ["Very reserved", "Moderately reserved", "I like to share", "I share everything"],
        field: "personal_sharing_tendency"
      },
      {
        id: "q109",
        type: "multiple_choice",
        question: "Do you prefer sophisticated or simple and cozy environments?",
        required: false,
        options: ["Sophisticated environments", "Simple and cozy", "Both equally", "Depends on the occasion"],
        field: "environment_sophistication_preference"
      },
      {
        id: "q110",
        type: "multiple_choice",
        question: "Do you like talking about deep subjects or do you prefer light conversations?",
        required: true,
        options: ["Deep subjects", "Light conversations", "Both equally", "Depends on the moment"],
        field: "conversation_depth_preference"
      },
      {
        id: "q111",
        type: "multiple_choice",
        question: "Do you believe couples should have the same circle of friends or do you think it's important to maintain separate friendships?",
        required: true,
        options: ["Same circle of friends", "Separate friendships", "Mix of both", "Depends on the situation"],
        field: "couple_friendship_circle_belief"
      }
    ]
  },
  {
    id: "sexualidade_conexao",
    title: "Sexuality and Emotional Connection",
    description: "Intimate and emotional aspects of relationships",
    icon: <Heart className="h-5 w-5" fill="currentColor" />,
    questions: [
      {
        id: "q112",
        type: "multiple_choice",
        question: "Do you think a couple's sexual frequency should be compatible or can this be negotiable?",
        required: false,
        options: ["Should be compatible", "Can be negotiable", "Depends on the love between the couple", "I don't have a formed opinion"],
        field: "sexual_frequency_compatibility_view"
      },
      {
        id: "q113",
        type: "scale",
        question: "Do you feel comfortable talking about your preferences in intimacy?",
        description: "1 = Very uncomfortable, 10 = Very comfortable",
        min: 1,
        max: 10,
        required: false,
        field: "intimacy_communication_comfort"
      },
      {
        id: "q114",
        type: "multiple_choice",
        question: "What is more important to you in sex: emotional connection or physical attraction?",
        required: false,
        options: ["Emotional connection", "Physical attraction", "Both equally important", "Depends on the moment"],
        field: "sex_emotional_vs_physical_priority"
      },
      {
        id: "q115",
        type: "scale",
        question: "Do you feel comfortable sharing your sexual fantasies with your partner?",
        description: "1 = Very uncomfortable, 10 = Very comfortable",
        min: 1,
        max: 10,
        required: false,
        field: "sexual_fantasy_sharing_comfort"
      },
      {
        id: "q116",
        type: "text",
        question: "How do you handle periods of low libido in a relationship?",
        required: false,
        placeholder: "Share how you navigate moments of low libido...",
        field: "low_libido_handling"
      },
      {
        id: "q117",
        type: "text",
        question: "What do you consider essential for a healthy sex life? What facilitates or blocks you from creating sexual intimacy?",
        required: false,
        placeholder: "Describe what you consider fundamental for healthy sexual intimacy...",
        field: "healthy_sex_life_essentials"
      },
      {
        id: "q118",
        type: "yes_no",
        question: "Do you think sex improves over time in a relationship?",
        required: false,
        field: "sex_improves_with_time_belief"
      },
      {
        id: "q119",
        type: "yes_no",
        question: "Do you believe a couple can be happy even if one of them has less interest in sex?",
        required: false,
        field: "happiness_despite_libido_difference"
      },
      {
        id: "q120",
        type: "multiple_choice",
        question: "Do you think sexual compatibility can be worked on or should it be natural?",
        required: false,
        options: ["Can be worked on", "Should be natural", "A mix of both", "Depends on the couple"],
        field: "sexual_compatibility_development_view"
      }
    ]
  }
]

interface QuestionnaireAnswers {
  [key: string]: string | number | boolean
}

export default function QuestionnairePage() {
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<QuestionnaireAnswers>({})
  const [isAutoSaving, setIsAutoSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState<SupabaseUser | null>(null)
  
  const router = useRouter()
  const supabase = createClient()

  const currentSection = questionnaireData[currentSectionIndex]
  const currentQuestion = currentSection?.questions[currentQuestionIndex]
  const totalQuestions = questionnaireData.reduce((total, section) => total + section.questions.length, 0)
  const answeredQuestions = Object.keys(answers).length
  const progress = (answeredQuestions / totalQuestions) * 100

  // Verificar autenticação e carregar dados existentes
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error || !session) {
        router.push('/auth/login')
        return
      }
      
      setUser(session.user)

      // Verificar se tem perfil
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, profile_completion_percentage')
        .eq('user_id', session.user.id)
        .single()

      if (!profile) {
        router.push('/onboarding/profile')
        return
      }

      // Carregar questionário existente se houver
      const { data: existingQuestionnaire } = await supabase
        .from('questionnaires')
        .select('*')
        .eq('user_id', session.user.id)
        .single()

      if (existingQuestionnaire) {
        // Converter dados do banco para o formato de answers
        const loadedAnswers: QuestionnaireAnswers = {}
        questionnaireData.forEach(section => {
          section.questions.forEach(question => {
            const value = existingQuestionnaire[question.field]
            if (value !== null && value !== undefined) {
              loadedAnswers[question.id] = value
            }
          })
        })
        setAnswers(loadedAnswers)
      }
    }

    checkAuth()
  }, [router, supabase])

  // Auto-save functionality with useCallback
  const saveAnswers = useCallback(async () => {
    if (!user || isAutoSaving) return
    
    setIsAutoSaving(true)
    try {
      // Converter answers para formato do banco
      const dbData: Record<string, string | number | boolean> = { user_id: user.id }
      
      questionnaireData.forEach(section => {
        section.questions.forEach(question => {
          const answer = answers[question.id]
          if (answer !== undefined) {
            dbData[question.field] = answer
          }
        })
      })

      // Calcular progresso
      dbData.completion_percentage = Math.round(progress)
      dbData.time_spent_minutes = Math.floor(Date.now() / 60000) // Simplificado

      await supabase
        .from('questionnaires')
        .upsert(dbData)

    } catch (error) {
              console.error('Error auto-saving:', error)
    } finally {
      setTimeout(() => setIsAutoSaving(false), 1000)
    }
  }, [user, isAutoSaving, answers, progress, supabase])

  useEffect(() => {
    const autoSave = setTimeout(() => {
      if (Object.keys(answers).length > 0 && user) {
        saveAnswers()
      }
    }, 2000)

    return () => clearTimeout(autoSave)
  }, [answers, user, saveAnswers])

  const handleAnswer = (questionId: string, value: string | number | boolean) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }))
  }

  const goToNextQuestion = () => {
    if (currentQuestionIndex < currentSection.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else if (currentSectionIndex < questionnaireData.length - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1)
      setCurrentQuestionIndex(0)
    }
  }

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    } else if (currentSectionIndex > 0) {
      setCurrentSectionIndex(currentSectionIndex - 1)
      setCurrentQuestionIndex(questionnaireData[currentSectionIndex - 1].questions.length - 1)
    }
  }

  const isCurrentQuestionAnswered = () => {
    return answers.hasOwnProperty(currentQuestion?.id)
  }

  const canProceed = () => {
    if (!currentQuestion?.required) return true
    return isCurrentQuestionAnswered()
  }

  const isLastQuestion = () => {
    return (
      currentSectionIndex === questionnaireData.length - 1 &&
      currentQuestionIndex === currentSection.questions.length - 1
    )
  }

  const finishQuestionnaire = async () => {
    if (!user) return
    
    setIsLoading(true)
    try {
      // Salvar respostas finais
      await saveAnswers()

      // Marcar questionário como completo e atualizar perfil
      await Promise.all([
        supabase
          .from('questionnaires')
          .update({ 
            completion_percentage: 100,
            completed_at: new Date().toISOString()
          })
          .eq('user_id', user.id),
        
        supabase
          .from('profiles')
          .update({ profile_completion_percentage: 100 })
          .eq('user_id', user.id)
      ])

      router.push('/')
    } catch (error) {
      console.error('Error finishing questionnaire:', error)
      alert('Error finishing questionnaire. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const renderQuestion = () => {
    if (!currentQuestion) return null

    const currentAnswer = answers[currentQuestion.id]

    switch (currentQuestion.type) {
      case "input":
        return (
          <Input
            value={currentAnswer as string || ""}
            onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
            placeholder={currentQuestion.placeholder}
            className="border-rose-200 focus:border-[#D02E32] focus:ring-[#D02E32]"
          />
        )

      case "text":
        return (
          <Textarea
            value={currentAnswer as string || ""}
            onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
            placeholder={currentQuestion.placeholder}
            className="min-h-[120px] border-rose-200 focus:border-[#D02E32] focus:ring-[#D02E32]"
          />
        )

      case "select":
        return (
          <Select
            value={currentAnswer as string || ""}
            onValueChange={(value) => handleAnswer(currentQuestion.id, value)}
          >
            <SelectTrigger className="border-rose-200 focus:border-[#D02E32]">
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              {currentQuestion.options?.map((option) => (
                <SelectItem key={option} value={option.toLowerCase().replace(/\s+/g, '_')}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case "multiple_choice":
        return (
          <RadioGroup
            value={currentAnswer as string || ""}
            onValueChange={(value) => handleAnswer(currentQuestion.id, value)}
            className="space-y-3"
          >
            {currentQuestion.options?.map((option) => {
              const value = option.toLowerCase().replace(/\s+/g, '_')
              return (
                <div key={option} className="flex items-center space-x-2">
                  <RadioGroupItem value={value} id={value} />
                  <Label htmlFor={value} className="cursor-pointer flex-1 py-2">
                    {option}
                  </Label>
                </div>
              )
            })}
          </RadioGroup>
        )

      case "scale":
        return (
          <div className="space-y-6">
            <div className="px-3">
              <Slider
                value={currentAnswer ? [currentAnswer as number] : [Math.floor(((currentQuestion.max || 10) + (currentQuestion.min || 1)) / 2)]}
                onValueChange={(value) => handleAnswer(currentQuestion.id, value[0])}
                max={currentQuestion.max || 10}
                min={currentQuestion.min || 1}
                step={1}
                className="w-full"
              />
            </div>
            <div className="flex justify-between text-sm text-gray-500 px-3">
              <span>{currentQuestion.min || 1}</span>
              <span className="font-medium text-[#D02E32]">
                {currentAnswer || Math.floor(((currentQuestion.max || 10) + (currentQuestion.min || 1)) / 2)}
              </span>
              <span>{currentQuestion.max || 10}</span>
            </div>
            {currentQuestion.description && (
              <p className="text-sm text-gray-600 text-center">{currentQuestion.description}</p>
            )}
          </div>
        )

      case "yes_no":
        return (
          <RadioGroup
            value={currentAnswer as string || ""}
            onValueChange={(value: string) => handleAnswer(currentQuestion.id, value === "yes")}
            className="flex space-x-8"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="yes" />
              <Label htmlFor="yes" className="cursor-pointer">
                Sim
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="no" />
              <Label htmlFor="no" className="cursor-pointer">
                Não
              </Label>
            </div>
          </RadioGroup>
        )

      default:
        return null
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-rose-50 flex items-center justify-center">
        <div className="text-center">
          <Heart className="h-12 w-12 text-[#D02E32] animate-pulse mx-auto mb-4" fill="currentColor" />
          <p className="text-gray-600">Loading questionnaire...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-rose-50">
      {/* Header */}
      <header className="bg-white border-b border-rose-100 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Heart className="h-8 w-8 text-[#D02E32]" fill="currentColor" />
              <span className="text-2xl font-serif font-bold text-[#D02E32]">Finally</span>
            </div>

            <div className="flex items-center space-x-4">
              {isAutoSaving && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Save className="h-4 w-4 animate-pulse" />
                  <span>Saving...</span>
                </div>
              )}
              <Badge variant="outline" className="border-rose-300 text-rose-700">
                {answeredQuestions} of {totalQuestions} questions
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-serif font-bold text-gray-900">Compatibility Questionnaire</h1>
            <span className="text-sm text-gray-600">{Math.round(progress)}% completed</span>
          </div>
          <Progress value={progress} className="h-3 mb-2" />
          <p className="text-gray-600">
            Your answers help us find truly compatible people for you
          </p>
        </div>

        {/* Section Navigation */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {questionnaireData.map((section, index) => (
              <Badge
                key={section.id}
                variant={index === currentSectionIndex ? "default" : "outline"}
                className={`flex items-center space-x-1 ${
                  index === currentSectionIndex
                    ? "bg-[#D02E32] text-white"
                    : "border-rose-300 text-rose-700 hover:bg-rose-50"
                }`}
              >
                {section.icon}
                <span>{section.title}</span>
              </Badge>
            ))}
          </div>
        </div>

        {/* Current Section Info */}
        <Card className="border-rose-200 shadow-lg mb-8">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-rose-100 rounded-lg text-[#D02E32]">{currentSection.icon}</div>
              <div>
                <CardTitle className="text-xl font-serif text-[#D02E32]">{currentSection.title}</CardTitle>
                <p className="text-gray-600">{currentSection.description}</p>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Question Card */}
        <Card className="border-rose-200 shadow-lg">
          <CardContent className="p-8">
            <div className="space-y-6">
              {/* Question Header */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">
                    Question {currentQuestionIndex + 1} of {currentSection.questions.length}
                  </span>
                  {currentQuestion?.required && (
                    <Badge variant="outline" className="text-xs border-orange-300 text-orange-700">
                      Required
                    </Badge>
                  )}
                </div>
                <h2 className="text-2xl font-serif font-semibold text-gray-900">{currentQuestion?.question}</h2>
                {currentQuestion?.description && <p className="text-gray-600">{currentQuestion.description}</p>}
              </div>

              {/* Question Content */}
              <div className="py-4">{renderQuestion()}</div>

              {/* Navigation */}
              <div className="flex justify-between items-center pt-6 border-t border-rose-100">
                <Button
                  variant="outline"
                  onClick={goToPreviousQuestion}
                  disabled={currentSectionIndex === 0 && currentQuestionIndex === 0}
                  className="flex items-center space-x-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Previous</span>
                </Button>

                <div className="flex items-center space-x-2">
                  {!canProceed() && <span className="text-sm text-orange-600">This question is required</span>}

                  <Button
                    onClick={isLastQuestion() ? finishQuestionnaire : goToNextQuestion}
                    disabled={!canProceed() || isLoading}
                    className={`flex items-center space-x-2 ${
                      isLastQuestion()
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-gradient-to-r from-[#CBA415] to-[#956F02] hover:from-[#956F02] hover:to-[#CBA415]"
                    }`}
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <span>{isLastQuestion() ? "Finish" : "Next"}</span>
                        {!isLastQuestion() && <ChevronRight className="h-4 w-4" />}
                        {isLastQuestion() && <CheckCircle className="h-4 w-4" />}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-rose-200 p-4">
            <div className="flex items-center space-x-3">
              <Clock className="h-5 w-5 text-[#CBA415]" />
              <div>
                <p className="text-sm text-gray-600">Estimated remaining time</p>
                <p className="font-semibold">{Math.ceil((totalQuestions - answeredQuestions) * 0.5)} min</p>
              </div>
            </div>
          </Card>

          <Card className="border-rose-200 p-4">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Current section</p>
                <p className="font-semibold">{currentSection.title}</p>
              </div>
            </div>
          </Card>

          <Card className="border-rose-200 p-4">
            <div className="flex items-center space-x-3">
              <Heart className="h-5 w-5 text-[#D02E32]" fill="currentColor" />
              <div>
                <p className="text-sm text-gray-600">General progress</p>
                <p className="font-semibold">{Math.round(progress)}% completed</p>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
} 