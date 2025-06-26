import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { notFound } from 'next/navigation'
import { ChatService } from '@/lib/chat/chat-service'
import { ChatWindow } from '@/components/chat/chat-window'

interface PageProps {
  params: Promise<{
    chatId: string
  }>
}

export default async function ChatPage({ params }: PageProps) {
  const supabase = await createClient()
  const { chatId: chatIdParam } = await params
  const chatId = parseInt(chatIdParam)

  if (isNaN(chatId)) {
    notFound()
  }

  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/auth/login')
  }

  // Buscar dados do chat
  const chatData = await ChatService.getChat(chatId, user.id)
  
  if (!chatData) {
    notFound()
  }

  // Buscar mensagens do chat
  const messages = await ChatService.getChatMessages(chatId, user.id)

  // Marcar mensagens como lidas
  await ChatService.markAsRead(chatId, user.id)

  // Funções de ação para o componente
  const handleSendMessage = async (content: string) => {
    'use server'
    return await ChatService.sendMessage(chatId, user.id, content)
  }

  const handleMarkAsRead = async () => {
    'use server'
    await ChatService.markAsRead(chatId, user.id)
  }

  const handleReportMessage = async (messageId: number) => {
    'use server'
    await ChatService.reportMessage(messageId)
  }

  const handleBlockChat = async () => {
    'use server'
    await ChatService.blockChat(chatId, user.id)
    redirect('/chat')
  }

  return (
    <ChatWindow
      chat={chatData.chat}
      otherUser={chatData.otherUser}
      age={chatData.age}
      currentUserId={user.id}
      initialMessages={messages}
      onSendMessage={handleSendMessage}
      onMarkAsRead={handleMarkAsRead}
      onReportMessage={handleReportMessage}
      onBlockChat={handleBlockChat}
    />
  )
} 