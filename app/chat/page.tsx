import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ChatService } from '@/lib/chat/chat-service'
import { ChatList } from '@/components/chat/chat-list'
import { MessageCircle, Heart } from 'lucide-react'

export default async function ChatsPage() {
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

  // Fetch user chats
  let chats: Awaited<ReturnType<typeof ChatService.getUserChats>> = []
  let errorMessage = ''

  try {
    chats = await ChatService.getUserChats(user.id)
  } catch (error) {
    console.error('Error fetching chats:', error)
    errorMessage = 'Error loading conversations'
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
              <span className="text-sm font-medium text-gray-600 hover:text-[#D02E32] cursor-pointer">Matches</span>
              <span className="text-sm font-medium text-[#D02E32]">Conversations</span>
              <span className="text-sm font-medium text-gray-600 hover:text-[#D02E32] cursor-pointer">Questionnaire</span>
              <span className="text-sm font-medium text-gray-600 hover:text-[#D02E32] cursor-pointer">Therapists</span>
            </nav>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Hello, {profile.first_name}!
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-serif font-bold text-gray-900 mb-2 flex items-center justify-center">
            <MessageCircle className="h-10 w-10 text-[#D02E32] mr-3" />
            Your Conversations
          </h1>
          <p className="text-lg text-gray-600">
            Connect with your matches and build meaningful relationships
          </p>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600 text-center">{errorMessage}</p>
          </div>
        )}

        {/* Chat List */}
        <ChatList 
          chats={chats} 
          currentUserId={user.id}
        />
      </main>
    </div>
  )
} 