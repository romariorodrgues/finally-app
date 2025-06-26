import { createClient } from '@/lib/supabase/server'
import { ChatService } from '@/lib/chat/chat-service'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ 
        success: false, 
        error: 'User not authenticated' 
      }, { status: 401 })
    }

    const { chatId, content, messageType, mediaUrl, replyToMessageId } = await request.json()
    
    // Validate parameters
    if (!chatId || !content?.trim()) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid parameters' 
      }, { status: 400 })
    }

    // Send message
    const result = await ChatService.sendMessage(
      parseInt(chatId),
      user.id,
      content.trim(),
      messageType || 'text',
      mediaUrl,
      replyToMessageId
    )
    
    return NextResponse.json(result)
    
  } catch (error) {
    console.error('Error in message sending API:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    
    return NextResponse.json({ 
      success: false, 
      error: errorMessage 
    }, { status: 500 })
  }
} 