"use client"

// Force dynamic rendering for authentication
export const dynamic = 'force-dynamic'

import { Heart, Users, MessageCircle, Settings, Shield, MapPin, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useAuth } from '@/hooks/use-auth'
import { AutoRedirect } from '@/components/auth/auto-redirect'
import Link from "next/link"

export default function Dashboard() {
  const { user, loading } = useAuth()

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Heart className="h-12 w-12 text-[#D02E32] mx-auto mb-4 animate-pulse" fill="currentColor" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Redirect to login if not authenticated (this should be handled by middleware, but as backup)
  if (!user) {
    window.location.href = '/auth/login'
    return null
  }

  console.log('🎨 [DEBUG] Rendering dashboard for user:', user.email)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Auto-redirect admins to their panel */}
      <AutoRedirect onlyForRoles={['admin', 'therapist']} />
      
      <DashboardContent user={user} />
    </div>
  )
}

interface User {
  id: string
  email?: string | null
  name?: string | null
  image?: string | null
}

function DashboardContent({ user }: { user: User }) {
  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-2">
          Welcome back, {user.name?.split(' ')[0] || 'user'}
        </h1>
        <p className="text-base md:text-lg text-gray-600">Your journey to find true love continues</p>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <Card className="border-rose-200 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-base md:text-lg font-serif text-[#D02E32] flex items-center">
              <Shield className="h-4 w-4 md:h-5 md:w-5 mr-2" />
              Complete Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Progress value={75} className="h-2" />
              <p className="text-sm text-gray-600">75% completed</p>
              <p className="text-xs text-gray-500">Complete your profile for better matches</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-rose-200 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-base md:text-lg font-serif text-[#D02E32] flex items-center">
              <Heart className="h-4 w-4 md:h-5 md:w-5 mr-2" fill="currentColor" />
              Matches
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-2xl font-bold text-[#CBA415]">12</div>
              <p className="text-sm text-gray-600">New compatible profiles</p>
              <p className="text-xs text-gray-500">3 with high compatibility</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-rose-200 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-base md:text-lg font-serif text-[#D02E32] flex items-center">
              <MessageCircle className="h-4 w-4 md:h-5 md:w-5 mr-2" />
              Active Conversations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-2xl font-bold text-[#CBA415]">5</div>
              <p className="text-sm text-gray-600">Ongoing conversations</p>
              <p className="text-xs text-gray-500">2 unread messages</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="border-rose-200 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg md:text-xl font-serif text-[#D02E32]">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4 p-3 bg-rose-50 rounded-lg">
              <Heart className="h-5 w-5 text-[#D02E32] flex-shrink-0" fill="currentColor" />
              <div className="flex-1 min-w-0">
                <p className="font-medium">New match found</p>
                <p className="text-sm text-gray-600 truncate">Carlos, 34 years old - 92% compatibility</p>
              </div>
              <Badge className="bg-[#CBA415] text-white flex-shrink-0">New</Badge>
            </div>

            <div className="flex items-center space-x-4 p-3 bg-blue-50 rounded-lg">
              <MessageCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium">New message from Rafael</p>
                <p className="text-sm text-gray-600 truncate">{"Hi! How was your weekend?"}</p>
              </div>
              <Badge variant="secondary" className="flex-shrink-0">
                2h ago
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <Link href="/matches">
          <Card className="border-rose-200 shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
            <CardContent className="p-4 md:p-6 text-center">
              <Users className="h-10 w-10 md:h-12 md:w-12 text-[#CBA415] mx-auto mb-4" />
              <h3 className="text-base md:text-lg font-serif font-semibold mb-2">Explore Matches</h3>
              <p className="text-sm md:text-base text-gray-600 mb-4">Discover new profiles that match with you</p>
              <Button className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 text-white hover:from-yellow-600 hover:to-amber-500 transition-all duration-300">
                View Profiles
              </Button>
            </CardContent>
          </Card>
        </Link>

        <Link href="/onboarding/questionnaire">
          <Card className="border-rose-200 shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
            <CardContent className="p-4 md:p-6 text-center">
              <Settings className="h-10 w-10 md:h-12 md:w-12 text-[#CBA415] mx-auto mb-4" />
              <h3 className="text-base md:text-lg font-serif font-semibold mb-2">Complete Questionnaire</h3>
              <p className="text-sm md:text-base text-gray-600 mb-4">
                Improve your matches by answering more questions
              </p>
              <Button className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 text-white hover:from-yellow-600 hover:to-amber-500 transition-all duration-300">
                Continue
              </Button>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Secondary Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Messages Card */}
        <Link href="/chat">
          <Card className="border-rose-200 hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center text-[#D02E32]">
                <MessageCircle className="h-5 w-5 mr-2" />
                Messages
              </CardTitle>
              <CardDescription>
                Continue your conversations and build connections
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mb-4">
                <div className="flex items-center space-x-3 p-2 rounded-lg bg-gray-50">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-[#CBA415] text-white text-xs">M</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">Maria Silva</p>
                    <p className="text-xs text-gray-500 truncate">Hi! How was your day?</p>
                  </div>
                  <Badge variant="secondary" className="bg-[#D02E32] text-white text-xs">2</Badge>
                </div>
              </div>
              <Button variant="outline" className="w-full border-[#D02E32] text-[#D02E32] hover:bg-[#D02E32] hover:text-white">
                View All Messages
              </Button>
            </CardContent>
          </Card>
        </Link>

        {/* Therapist Support Card */}
        <Link href="/therapist">
          <Card className="border-rose-200 hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center text-[#D02E32]">
                <Star className="h-5 w-5 mr-2" />
                Specialized Support
              </CardTitle>
              <CardDescription>
                Access to therapists specialized in relationships
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  Sessions with specialists to optimize your love journey
                </p>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span className="text-xs text-gray-500">Online only</span>
                </div>
              </div>
              <Button variant="outline" className="w-full border-blue-500 text-blue-600 hover:bg-blue-500 hover:text-white">
                Schedule Consultation
              </Button>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
