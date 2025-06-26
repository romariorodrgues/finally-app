"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Heart, User as UserIcon, MapPin, Briefcase, ArrowRight, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

const INTERESTS_OPTIONS = [
  'Travel', 'Cooking', 'Art', 'Music', 'Cinema', 'Reading', 'Sports', 
  'Nature', 'Technology', 'Dancing', 'Photography', 'Yoga', 'Meditation',
  'Theater', 'History', 'Science', 'Fashion', 'Gaming', 'Pets', 'Volunteering',
  'Entrepreneurship', 'Investments', 'Languages', 'Gardening', 'Automobiles'
]

interface ProfileData {
  first_name: string
  last_name: string
  birth_date: string
  gender: string
  location_city: string
  location_state: string
  location_country: string
  occupation?: string
  education_level?: string
  height_cm?: number
  relationship_status: string
  has_children: boolean
  children_count?: number
  wants_children?: string
  bio: string
  interests: string[]
}

export default function ProfileOnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState<ProfileData>({
    first_name: '',
    last_name: '',
    birth_date: '',
    gender: '',
    location_city: '',
    location_state: '',
    location_country: 'Brazil',
    occupation: '',
    education_level: '',
    height_cm: undefined,
    relationship_status: '',
    has_children: false,
    children_count: undefined,
    wants_children: '',
    bio: '',
    interests: []
  })
  
  const router = useRouter()
  const supabase = createClient()

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error || !session) {
        router.push('/auth/login')
        return
      }
      
      setUser(session.user)

      // Check if profile already exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', session.user.id)
        .single()

      if (existingProfile) {
        router.push('/')
        return
      }
    }

    checkAuth()
  }, [router, supabase])

  const totalSteps = 4
  const progress = (currentStep / totalSteps) * 100

  const validateStep = () => {
    const newErrors: Record<string, string> = {}

    if (currentStep === 1) {
      if (!formData.first_name || formData.first_name.length < 2) {
        newErrors.first_name = 'First name must have at least 2 characters'
      }
      if (!formData.last_name || formData.last_name.length < 2) {
        newErrors.last_name = 'Last name must have at least 2 characters'
      }
      if (!formData.birth_date) {
        newErrors.birth_date = 'Date of birth is required'
      }
      if (!formData.gender) {
        newErrors.gender = 'Select your gender'
      }
    }

    if (currentStep === 2) {
      if (!formData.location_city || formData.location_city.length < 2) {
        newErrors.location_city = 'City is required'
      }
      if (!formData.location_state || formData.location_state.length < 2) {
        newErrors.location_state = 'State is required'
      }
      if (!formData.relationship_status) {
        newErrors.relationship_status = 'Select your relationship status'
      }
    }

    if (currentStep === 4) {
      if (!formData.bio || formData.bio.length < 50) {
        newErrors.bio = 'Bio must have at least 50 characters'
      }
      if (formData.bio && formData.bio.length > 500) {
        newErrors.bio = 'Bio must have at most 500 characters'
      }
      if (formData.interests.length < 3) {
        newErrors.interests = 'Select at least 3 interests'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInterestToggle = (interest: string) => {
    const newInterests = formData.interests.includes(interest)
      ? formData.interests.filter(i => i !== interest)
      : [...formData.interests, interest]
    
    if (newInterests.length <= 10) {
      setFormData({ ...formData, interests: newInterests })
    }
  }

  const updateFormData = (field: keyof ProfileData, value: string | number | boolean | string[] | undefined) => {
    setFormData({ ...formData, [field]: value })
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' })
    }
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateStep()) return
    if (!user) return

    setIsLoading(true)
    try {
      // Create entry in users table if it doesn't exist
      const { error: userError } = await supabase
        .from('users')
        .upsert({
          id: user.id,
          email: user.email,
          role: 'user'
        })

      if (userError && userError.code !== '23505') { // Ignore duplicate key error
        throw userError
      }

      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: user.id,
          ...formData,
          height_cm: formData.height_cm || null,
          children_count: formData.children_count || null,
          profile_completion_percentage: 85, // Base completion
          is_profile_public: true
        })

      if (profileError) {
        throw profileError
      }

      // Redirect to questionnaire
      router.push('/onboarding/questionnaire')
    } catch (error) {
      console.error('Error creating profile:', error)
      setErrors({ general: 'Error creating profile. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  const nextStep = () => {
    if (validateStep() && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Heart className="h-12 w-12 text-[#D02E32] mx-auto mb-4 animate-pulse" fill="currentColor" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-rose-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Heart className="h-8 w-8 text-[#D02E32]" fill="currentColor" />
            <h1 className="text-3xl font-serif font-bold text-[#D02E32]">Finally</h1>
          </div>
          <h2 className="text-2xl font-serif font-bold text-gray-900 mb-2">Complete Your Profile</h2>
          <p className="text-gray-600">Tell us about yourself to find the best matches</p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Step {currentStep} of {totalSteps}</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {errors.general && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{errors.general}</p>
          </div>
        )}

        <form onSubmit={onSubmit}>
          <Card className="border-rose-200 shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl font-serif text-[#D02E32] flex items-center">
                {currentStep === 1 && <><UserIcon className="mr-2 h-5 w-5" />Basic Information</>}
                {currentStep === 2 && <><MapPin className="mr-2 h-5 w-5" />Location and Status</>}
                {currentStep === 3 && <><Briefcase className="mr-2 h-5 w-5" />Career and Education</>}
                {currentStep === 4 && <><Heart className="mr-2 h-5 w-5" />About You</>}
              </CardTitle>
              <CardDescription>
                {currentStep === 1 && 'Let&apos;s start with your basic personal information'}
                {currentStep === 2 && 'Where you are and your current situation'}
                {currentStep === 3 && 'Your career and educational background'}
                {currentStep === 4 && 'Tell us more about your interests and personality'}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Step 1: Basic Information */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="first_name">First Name *</Label>
                      <Input
                        id="first_name"
                        value={formData.first_name}
                        onChange={(e) => updateFormData('first_name', e.target.value)}
                        placeholder="Maria"
                        className={errors.first_name ? 'border-red-500' : ''}
                      />
                      {errors.first_name && <p className="text-red-500 text-sm mt-1">{errors.first_name}</p>}
                    </div>
                    <div>
                      <Label htmlFor="last_name">Last Name *</Label>
                      <Input
                        id="last_name"
                        value={formData.last_name}
                        onChange={(e) => updateFormData('last_name', e.target.value)}
                        placeholder="Silva"
                        className={errors.last_name ? 'border-red-500' : ''}
                      />
                      {errors.last_name && <p className="text-red-500 text-sm mt-1">{errors.last_name}</p>}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="birth_date">Date of Birth *</Label>
                    <Input
                      id="birth_date"
                      type="date"
                      value={formData.birth_date}
                      onChange={(e) => updateFormData('birth_date', e.target.value)}
                      className={errors.birth_date ? 'border-red-500' : ''}
                    />
                    {errors.birth_date && <p className="text-red-500 text-sm mt-1">{errors.birth_date}</p>}
                  </div>

                  <div>
                    <Label>Gender *</Label>
                    <Select value={formData.gender} onValueChange={(value) => updateFormData('gender', value)}>
                      <SelectTrigger className={errors.gender ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Select your gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="non-binary">Non-binary</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender}</p>}
                  </div>
                </div>
              )}

              {/* Step 2: Location and Status */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="location_city">City *</Label>
                      <Input
                        id="location_city"
                        value={formData.location_city}
                        onChange={(e) => updateFormData('location_city', e.target.value)}
                        placeholder="São Paulo"
                        className={errors.location_city ? 'border-red-500' : ''}
                      />
                      {errors.location_city && <p className="text-red-500 text-sm mt-1">{errors.location_city}</p>}
                    </div>
                    <div>
                      <Label htmlFor="location_state">State *</Label>
                      <Input
                        id="location_state"
                        value={formData.location_state}
                        onChange={(e) => updateFormData('location_state', e.target.value)}
                        placeholder="SP"
                        className={errors.location_state ? 'border-red-500' : ''}
                      />
                      {errors.location_state && <p className="text-red-500 text-sm mt-1">{errors.location_state}</p>}
                    </div>
                  </div>

                  <div>
                    <Label>Relationship Status *</Label>
                    <Select value={formData.relationship_status} onValueChange={(value) => updateFormData('relationship_status', value)}>
                      <SelectTrigger className={errors.relationship_status ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Select your status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="single">Single</SelectItem>
                        <SelectItem value="divorced">Divorced</SelectItem>
                        <SelectItem value="widowed">Widowed</SelectItem>
                        <SelectItem value="separated">Separated</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.relationship_status && <p className="text-red-500 text-sm mt-1">{errors.relationship_status}</p>}
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="has_children"
                      checked={formData.has_children}
                      onCheckedChange={(checked) => updateFormData('has_children', !!checked)}
                    />
                    <Label htmlFor="has_children">I have children</Label>
                  </div>

                  {formData.has_children && (
                    <div>
                      <Label htmlFor="children_count">Number of children</Label>
                      <Input
                        id="children_count"
                        type="number"
                        min="1"
                        max="10"
                        value={formData.children_count || ''}
                        onChange={(e) => updateFormData('children_count', parseInt(e.target.value) || undefined)}
                        placeholder="1"
                      />
                    </div>
                  )}

                  <div>
                    <Label>Do you want (more) children?</Label>
                    <Select value={formData.wants_children || ''} onValueChange={(value) => updateFormData('wants_children', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an option" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                        <SelectItem value="maybe">Maybe</SelectItem>
                        <SelectItem value="not_sure">Not sure</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* Step 3: Career and Education */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="occupation">Occupation</Label>
                    <Input
                      id="occupation"
                      value={formData.occupation || ''}
                      onChange={(e) => updateFormData('occupation', e.target.value)}
                      placeholder="Software Engineer"
                    />
                  </div>

                  <div>
                    <Label>Education Level</Label>
                    <Select value={formData.education_level || ''} onValueChange={(value) => updateFormData('education_level', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your education level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high_school">High School</SelectItem>
                        <SelectItem value="technical">Technical Course</SelectItem>
                                                 <SelectItem value="bachelors">Bachelor&apos;s Degree</SelectItem>
                         <SelectItem value="masters">Master&apos;s Degree</SelectItem>
                        <SelectItem value="doctorate">Doctorate</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="height_cm">Height (cm)</Label>
                    <Input
                      id="height_cm"
                      type="number"
                      min="100"
                      max="250"
                      value={formData.height_cm || ''}
                      onChange={(e) => updateFormData('height_cm', parseInt(e.target.value) || undefined)}
                      placeholder="170"
                    />
                  </div>
                </div>
              )}

              {/* Step 4: About You */}
              {currentStep === 4 && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="bio">About you * (50-500 characters)</Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => updateFormData('bio', e.target.value)}
                      placeholder="Tell us about yourself, your hobbies, what you're looking for..."
                      className={`min-h-[120px] ${errors.bio ? 'border-red-500' : ''}`}
                      maxLength={500}
                    />
                    <div className="flex justify-between text-sm text-gray-500 mt-1">
                      <span>{formData.bio.length}/500 characters</span>
                      {errors.bio && <span className="text-red-500">{errors.bio}</span>}
                    </div>
                  </div>

                  <div>
                    <Label>Interests * (select at least 3)</Label>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {INTERESTS_OPTIONS.map((interest) => (
                        <button
                          key={interest}
                          type="button"
                          onClick={() => handleInterestToggle(interest)}
                          className={`p-2 text-sm rounded-lg border transition-all ${
                            formData.interests.includes(interest)
                              ? 'border-[#D02E32] bg-rose-50 text-[#D02E32]'
                              : 'border-gray-200 hover:border-rose-300 hover:bg-rose-50'
                          }`}
                        >
                          {interest}
                        </button>
                      ))}
                    </div>
                    {errors.interests && (
                      <p className="text-red-500 text-sm mt-1">{errors.interests}</p>
                    )}
                    <p className="text-sm text-gray-500 mt-1">
                      {formData.interests.length} interest(s) selected
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Previous</span>
            </Button>

            {currentStep < totalSteps ? (
              <Button
                type="button"
                onClick={nextStep}
                className="bg-gradient-to-r from-[#D02E32] to-[#B02629] text-white hover:from-[#B02629] hover:to-[#D02E32] flex items-center space-x-2"
              >
                <span>Next</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-gradient-to-r from-[#D02E32] to-[#B02629] text-white hover:from-[#B02629] hover:to-[#D02E32] flex items-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <span>Complete Profile</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
} 