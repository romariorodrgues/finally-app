import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { MatchService } from '@/lib/matches/match-service'
import { MatchCard } from '@/components/matches/match-card'
import { GenerateMatchesButton } from '@/components/matches/generate-matches-button'
import { Heart, Sparkles, Users } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default async function MatchesPage() {
  const supabase = await createClient()

  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/auth/login')
  }

  // Check if profile exists
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!profile) {
    redirect('/onboarding/profile')
  }

  // Check if questionnaire was completed
  const { data: questionnaire } = await supabase
    .from('questionnaires')
    .select('completion_percentage')
    .eq('user_id', user.id)
    .single()

  const hasCompletedQuestionnaire = questionnaire?.completion_percentage && questionnaire.completion_percentage >= 80

  // Fetch existing matches
  let matches: Awaited<ReturnType<typeof MatchService.getMatchesWithProfiles>> = []
  let errorMessage = ''

  try {
    matches = await MatchService.getMatchesWithProfiles(user.id)
  } catch (error) {
    console.error('Error fetching matches:', error)
    errorMessage = 'Error loading matches'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-rose-50">
      {/* Header */}
      <header className="bg-white border-b border-rose-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Heart className="h-8 w-8 text-[#D02E32]" fill="currentColor" />
                <span className="text-2xl font-serif font-bold text-[#D02E32]">Finally</span>
              </div>
            </div>

            <nav className="hidden md:flex space-x-8">
              <span className="text-sm font-medium text-gray-600 hover:text-[#D02E32] cursor-pointer">Dashboard</span>
              <span className="text-sm font-medium text-[#D02E32]">Matches</span>
              <span className="text-sm font-medium text-gray-600 hover:text-[#D02E32] cursor-pointer">Conversations</span>
              <span className="text-sm font-medium text-gray-600 hover:text-[#D02E32] cursor-pointer">Questionnaire</span>
              <span className="text-sm font-medium text-gray-600 hover:text-[#D02E32] cursor-pointer">Therapists</span>
            </nav>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                Dashboard
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-serif font-bold text-gray-900 mb-2">
            Your Matches ✨
          </h1>
          <p className="text-lg text-gray-600">
            AI-generated matches based on your profile and questionnaire
          </p>
        </div>

        {/* Incomplete questionnaire */}
        {!hasCompletedQuestionnaire && (
          <Card className="mb-8 border-amber-200 bg-amber-50">
            <CardHeader>
              <CardTitle className="text-amber-800 flex items-center">
                <Sparkles className="mr-2 h-5 w-5" />
                Complete your questionnaire for better matches
              </CardTitle>
              <CardDescription className="text-amber-700">
                You need to complete at least 80% of the questionnaire to generate high-quality matches.
                Currently you have {questionnaire?.completion_percentage || 0}% completed.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="bg-gradient-to-r from-[#CBA415] to-[#956F02] text-white hover:from-[#956F02] hover:to-[#CBA415]"
              >
                Complete Questionnaire
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Matches area */}
        {errorMessage ? (
          <Card className="text-center py-8">
            <CardContent>
              <p className="text-red-600 mb-4">{errorMessage}</p>
              <Button variant="outline">
                Try Again
              </Button>
            </CardContent>
          </Card>
        ) : matches.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No matches found yet
              </h3>
              <p className="text-gray-600 mb-6">
                {hasCompletedQuestionnaire 
                  ? 'Generate new matches and wait for approval from our team!' 
                  : 'Complete your questionnaire to generate quality matches.'
                }
              </p>
              {hasCompletedQuestionnaire && (
                <div className="space-y-4">
                  <GenerateMatchesButton userId={user.id} />
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                    <p className="font-medium mb-1">📋 How it works:</p>
                    <p>1. You generate AI-based matches</p>
                    <p>2. Our team reviews and approves the best matches</p>
                    <p>3. Approved matches appear here for you to interact</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {/* Button to generate new matches */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {matches.length} {matches.length === 1 ? 'Match Found' : 'Matches Found'}
                </h2>
                <p className="text-gray-600">
                  Based on AI compatibility analysis
                </p>
              </div>
              {hasCompletedQuestionnaire && (
                <GenerateMatchesButton userId={user.id} variant="outline" />
              )}
            </div>

            {/* Matches grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {matches.map((matchData) => (
                <MatchCard
                  key={matchData.match.id}
                  match={matchData.match}
                  profile={matchData.profile}
                  age={matchData.age}
                  compatibility_percentage={matchData.compatibility_percentage}
                />
              ))}
            </div>

            {/* Statistics section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              <Card className="border-rose-200">
                <CardContent className="p-6 text-center">
                  <Heart className="h-8 w-8 text-[#D02E32] mx-auto mb-2" fill="currentColor" />
                  <h3 className="font-semibold text-gray-900">Total Matches</h3>
                  <p className="text-2xl font-bold text-[#D02E32]">{matches.length}</p>
                </CardContent>
              </Card>

              <Card className="border-rose-200">
                <CardContent className="p-6 text-center">
                  <Sparkles className="h-8 w-8 text-[#CBA415] mx-auto mb-2" />
                  <h3 className="font-semibold text-gray-900">Average Compatibility</h3>
                  <p className="text-2xl font-bold text-[#CBA415]">
                    {matches.length > 0 
                      ? Math.round(matches.reduce((acc, m) => acc + m.compatibility_percentage, 0) / matches.length)
                      : 0
                    }%
                  </p>
                </CardContent>
              </Card>

              <Card className="border-rose-200">
                <CardContent className="p-6 text-center">
                  <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-gray-900">High Compatibility</h3>
                  <p className="text-2xl font-bold text-green-600">
                    {matches.filter(m => m.compatibility_percentage >= 85).length}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  )
} 