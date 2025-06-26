'use client'

import { useState, useEffect, useRef } from 'react'
import { Send, ArrowLeft, MoreVertical, Flag, Shield, Smile, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import Link from 'next/link'

interface MessageData {
  id: number;
  chat_id: number;
  sender_id: string;
  content: string;
  message_type: 'text' | 'image' | 'emoji' | 'system' | 'gif';
  status: 'sent' | 'delivered' | 'read' | 'failed' | 'deleted';
  is_filtered: boolean;
  filtered_reason?: string;
  original_content?: string;
  created_at: string;
}

interface ChatData {
  id: number;
  status: string;
  total_messages: number;
}

interface UserProfile {
  user_id: string;
  first_name: string;
  last_name: string;
  profile_picture_url?: string;
}

interface ChatWindowProps {
  chat: ChatData;
  otherUser: UserProfile;
  age: number;
  currentUserId: string;
  initialMessages: MessageData[];
  onSendMessage: (content: string) => Promise<{ success: boolean; error?: string }>;
  onMarkAsRead: () => Promise<void>;
  onReportMessage?: (messageId: number) => Promise<void>;
  onBlockChat?: () => Promise<void>;
}

export function ChatWindow({ 
  chat, 
  otherUser, 
  age, 
  currentUserId, 
  initialMessages,
  onSendMessage,
  onMarkAsRead,
  onReportMessage,
  onBlockChat
}: ChatWindowProps) {
  const [messages, ] = useState<MessageData[]>(initialMessages)
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setSending] = useState(false)
  const [showReportDialog, setShowReportDialog] = useState(false)
  const [showBlockDialog, setShowBlockDialog] = useState(false)
  const [selectedMessageId, setSelectedMessageId] = useState<number | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Marcar mensagens como lidas quando o componente é montado
    onMarkAsRead()
  }, [onMarkAsRead])

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const formatMessageTime = (timestamp: string) => {
    const messageTime = new Date(timestamp)
    return messageTime.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const formatMessageDate = (timestamp: string) => {
    const messageTime = new Date(timestamp)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (messageTime.toDateString() === today.toDateString()) {
      return 'Today'
    } else if (messageTime.toDateString() === yesterday.toDateString()) {
      return 'Yesterday'
    } else {
      return messageTime.toLocaleDateString('en-US', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newMessage.trim() || isLoading) return

    const messageContent = newMessage.trim()
    setNewMessage('')
    setSending(true)

    try {
      const result = await onSendMessage(messageContent)
      
      if (result.success) {
        // A mensagem será adicionada via props quando a página recarregar
        // ou via real-time updates no futuro
        inputRef.current?.focus()
      } else {
        // Restaurar mensagem em caso de erro
        setNewMessage(messageContent)
        alert(result.error || 'Error sending message')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      setNewMessage(messageContent)
      alert('Error sending message')
    } finally {
      setSending(false)
    }
  }

  const handleReportMessage = async (messageId: number) => {
    setSelectedMessageId(messageId)
    setShowReportDialog(true)
  }

  const confirmReportMessage = async () => {
    if (selectedMessageId && onReportMessage) {
      await onReportMessage(selectedMessageId)
      setShowReportDialog(false)
      setSelectedMessageId(null)
    }
  }

  const confirmBlockChat = async () => {
    if (onBlockChat) {
      await onBlockChat()
      setShowBlockDialog(false)
    }
  }

  // Agrupar mensagens por data
  const groupedMessages = messages.reduce((groups, message) => {
    const date = formatMessageDate(message.created_at)
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(message)
    return groups
  }, {} as Record<string, MessageData[]>)

  if (chat.status !== 'active') {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-8 text-center">
          <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Conversation not available
          </h3>
          <p className="text-gray-600 mb-6">
            This conversation has been blocked or archived.
          </p>
          <Link href="/chat">
            <Button variant="outline">
              Back to Conversations
            </Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-50 to-rose-50">
      {/* Header do chat */}
      <Card className="rounded-none border-b">
        <CardHeader className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/chat">
                <Button variant="ghost" size="sm" className="p-2">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              
              <Avatar className="h-10 w-10 border-2 border-white shadow-md">
                <AvatarImage src={otherUser.profile_picture_url} />
                <AvatarFallback className="bg-[#D02E32] text-white font-semibold">
                  {getInitials(otherUser.first_name, otherUser.last_name)}
                </AvatarFallback>
              </Avatar>
              
              <div>
                <h2 className="font-semibold text-gray-900">
                  {otherUser.first_name} {otherUser.last_name}
                </h2>
                <p className="text-sm text-gray-500">{age} years</p>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="p-2">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem 
                  onClick={() => setShowBlockDialog(true)}
                  className="text-red-600"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Block user
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
      </Card>

      {/* Área de mensagens */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {Object.entries(groupedMessages).map(([date, dateMessages]) => (
          <div key={date}>
            {/* Separador de data */}
            <div className="flex justify-center my-4">
              <Badge variant="secondary" className="bg-white/80 text-gray-600">
                {date}
              </Badge>
            </div>

            {/* Mensagens do dia */}
            {dateMessages.map((message, index) => {
              const isCurrentUser = message.sender_id === currentUserId
              const showAvatar = !isCurrentUser && (
                index === 0 || 
                dateMessages[index - 1]?.sender_id !== message.sender_id
              )

              return (
                <div
                  key={message.id}
                  className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-2`}
                >
                  {/* Avatar para mensagens recebidas */}
                  {showAvatar && !isCurrentUser && (
                    <Avatar className="h-8 w-8 mr-2 mt-2">
                      <AvatarImage src={otherUser.profile_picture_url} />
                      <AvatarFallback className="bg-[#D02E32] text-white text-xs">
                        {getInitials(otherUser.first_name, otherUser.last_name)}
                      </AvatarFallback>
                    </Avatar>
                  )}

                  {/* Espaço para manter alinhamento */}
                  {!showAvatar && !isCurrentUser && (
                    <div className="w-8 mr-2"></div>
                  )}

                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                      isCurrentUser
                        ? 'bg-[#D02E32] text-white rounded-br-md'
                        : 'bg-white text-gray-900 rounded-bl-md shadow-sm border'
                    }`}
                  >
                    {/* Conteúdo da mensagem */}
                    <p className="text-sm">{message.content}</p>
                    
                    {/* Indicador de conteúdo filtrado */}
                    {message.is_filtered && (
                      <div className="mt-1">
                        <Badge variant="outline" className="text-xs bg-yellow-50 border-yellow-200">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Filtered content
                        </Badge>
                      </div>
                    )}

                    {/* Horário e status */}
                    <div className={`flex items-center justify-between mt-1 text-xs ${
                      isCurrentUser ? 'text-white/70' : 'text-gray-500'
                    }`}>
                      <span>{formatMessageTime(message.created_at)}</span>
                      
                      {/* Menu de ações para mensagens recebidas */}
                      {!isCurrentUser && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-4 w-4 p-0 ml-2">
                              <MoreVertical className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem 
                              onClick={() => handleReportMessage(message.id)}
                              className="text-red-600"
                            >
                              <Flag className="h-3 w-3 mr-2" />
                              Report
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ))}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input de mensagem */}
      <Card className="rounded-none border-t">
        <CardContent className="p-4">
          <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="p-2 text-gray-500"
            >
              <Smile className="h-5 w-5" />
            </Button>
            
            <Input
              ref={inputRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              disabled={isLoading}
              className="flex-1"
              maxLength={1000}
            />
            
            <Button
              type="submit"
              disabled={!newMessage.trim() || isLoading}
              className="bg-[#D02E32] hover:bg-[#A02225] text-white p-2"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
          
          <p className="text-xs text-gray-500 mt-2">
            Data like phone numbers and emails are automatically filtered for your safety.
          </p>
        </CardContent>
      </Card>

      {/* Dialog de denúncia */}
      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Flag className="h-5 w-5 text-red-600" />
              <span>Report Message</span>
            </DialogTitle>
            <DialogDescription>
              This message will be reported to our moderation team.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowReportDialog(false)}>
              Cancel
            </Button>
            <Button onClick={confirmReportMessage} className="bg-red-600 hover:bg-red-700">
              Confirm Report
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de bloqueio */}
      <Dialog open={showBlockDialog} onOpenChange={setShowBlockDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-red-600" />
              <span>Block User</span>
            </DialogTitle>
            <DialogDescription>
              You will no longer receive messages from this person and the conversation will be archived. This action can be undone by contacting support.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowBlockDialog(false)}>
              Cancel
            </Button>
            <Button onClick={confirmBlockChat} className="bg-red-600 hover:bg-red-700">
              Confirm Block
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 