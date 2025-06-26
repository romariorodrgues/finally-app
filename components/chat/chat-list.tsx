'use client'

import { useState, useEffect } from 'react'
import { MessageCircle, Search, Heart, Clock, User } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface ChatData {
  id: number;
  match_id: number;
  user1_id: string;
  user2_id: string;
  status: string;
  total_messages: number;
  last_message_at?: string;
  last_message_preview?: string;
  last_message_sender_id?: string;
  user1_unread_count: number;
  user2_unread_count: number;
  created_at: string;
}

interface UserProfile {
  user_id: string;
  first_name: string;
  last_name: string;
  profile_picture_url?: string;
}

interface ChatWithProfile {
  chat: ChatData;
  otherUser: UserProfile;
  age: number;
}

interface ChatListProps {
  chats: ChatWithProfile[];
  currentUserId: string;
  onRefresh?: () => void;
}

export function ChatList({ chats, currentUserId, onRefresh }: ChatListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredChats, setFilteredChats] = useState<ChatWithProfile[]>(chats)

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredChats(chats)
    } else {
      const filtered = chats.filter(chatData =>
        `${chatData.otherUser.first_name} ${chatData.otherUser.last_name}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      )
      setFilteredChats(filtered)
    }
  }, [searchTerm, chats])

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const getUnreadCount = (chat: ChatData) => {
    const isUser1 = chat.user1_id === currentUserId;
    return isUser1 ? chat.user1_unread_count : chat.user2_unread_count;
  }

  const formatLastMessageTime = (timestamp: string) => {
    const now = new Date()
    const messageTime = new Date(timestamp)
    const diffInHours = (now.getTime() - messageTime.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 1) {
      const minutes = Math.floor(diffInHours * 60)
      return `${minutes}min`
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h`
    } else {
      const days = Math.floor(diffInHours / 24)
      return days === 1 ? '1 dia' : `${days} dias`
    }
  }

  const isLastMessageFromCurrentUser = (chat: ChatData) => {
    return chat.last_message_sender_id === currentUserId;
  }

  if (chats.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Nenhuma conversa ainda
          </h3>
          <p className="text-gray-600 mb-6">
            Quando você fizer match com alguém, suas conversas aparecerão aqui.
          </p>
          <Link href="/matches">
            <Button className="bg-gradient-to-r from-[#D02E32] to-[#A02225] text-white">
              <Heart className="h-4 w-4 mr-2" fill="currentColor" />
              Ver Matches
            </Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header com pesquisa */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MessageCircle className="h-6 w-6 text-[#D02E32]" />
              <span>Suas Conversas</span>
              <Badge variant="outline" className="ml-2">
                {chats.length}
              </Badge>
            </div>
            {onRefresh && (
              <Button variant="ghost" size="sm" onClick={onRefresh}>
                Atualizar
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por nome..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Lista de chats */}
      <div className="space-y-2">
        {filteredChats.map((chatData) => {
          const unreadCount = getUnreadCount(chatData.chat);
          
          return (
            <Link key={chatData.chat.id} href={`/chat/${chatData.chat.id}`}>
              <Card className="hover:bg-rose-50 transition-colors cursor-pointer border-l-4 border-l-transparent hover:border-l-[#D02E32]">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    {/* Avatar */}
                    <div className="relative">
                      <Avatar className="h-12 w-12 border-2 border-white shadow-md">
                        <AvatarImage src={chatData.otherUser.profile_picture_url} />
                        <AvatarFallback className="bg-[#D02E32] text-white font-semibold">
                          {getInitials(chatData.otherUser.first_name, chatData.otherUser.last_name)}
                        </AvatarFallback>
                      </Avatar>
                      {unreadCount > 0 && (
                        <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-[#D02E32] text-white text-xs">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </Badge>
                      )}
                    </div>

                    {/* Informações do chat */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-gray-900 truncate">
                            {chatData.otherUser.first_name} {chatData.otherUser.last_name}
                          </h3>
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <User className="h-3 w-3" />
                            <span>{chatData.age} anos</span>
                            <span>•</span>
                            <span>{chatData.chat.total_messages} mensagens</span>
                          </div>
                        </div>
                        
                        {chatData.chat.last_message_at && (
                          <div className="flex items-center space-x-1 text-xs text-gray-500">
                            <Clock className="h-3 w-3" />
                            <span>{formatLastMessageTime(chatData.chat.last_message_at)}</span>
                          </div>
                        )}
                      </div>

                      {/* Preview da última mensagem */}
                      {chatData.chat.last_message_preview && (
                        <div className="mt-2">
                          <p className={`text-sm truncate ${
                            unreadCount > 0 && !isLastMessageFromCurrentUser(chatData.chat)
                              ? 'font-medium text-gray-900' 
                              : 'text-gray-600'
                          }`}>
                            {isLastMessageFromCurrentUser(chatData.chat) && (
                              <span className="text-gray-400 mr-1">Você:</span>
                            )}
                            {chatData.chat.last_message_preview}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Indicador de mensagem não lida */}
                    {unreadCount > 0 && !isLastMessageFromCurrentUser(chatData.chat) && (
                      <div className="h-3 w-3 bg-[#D02E32] rounded-full"></div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      {filteredChats.length === 0 && searchTerm && (
        <Card className="text-center py-8">
          <CardContent>
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nenhuma conversa encontrada
            </h3>
            <p className="text-gray-600">
              Tente buscar por outro nome ou verifique se há erros de digitação.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 