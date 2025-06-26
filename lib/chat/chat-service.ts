import { createClient } from '@/lib/supabase/server';

interface ChatData {
  id: number;
  match_id: number;
  user1_id: string;
  user2_id: string;
  status: 'active' | 'archived' | 'blocked_by_user1' | 'blocked_by_user2' | 'blocked_by_admin';
  chat_type: 'match_chat' | 'support_chat';
  total_messages: number;
  last_message_at?: string;
  last_message_preview?: string;
  last_message_sender_id?: string;
  user1_last_read_at?: string;
  user2_last_read_at?: string;
  user1_unread_count: number;
  user2_unread_count: number;
  created_at: string;
  updated_at: string;
}

interface MessageData {
  id: number;
  chat_id: number;
  sender_id: string;
  content: string;
  message_type: 'text' | 'image' | 'emoji' | 'system' | 'gif';
  media_url?: string;
  status: 'sent' | 'delivered' | 'read' | 'failed' | 'deleted';
  is_filtered: boolean;
  filtered_reason?: string;
  original_content?: string;
  reply_to_message_id?: number;
  read_by_recipient_at?: string;
  created_at: string;
}

interface UserProfile {
  user_id: string;
  first_name: string;
  last_name: string;
  profile_picture_url?: string;
}

export class ChatService {
  
  // Regex patterns to detect sensitive data
  private static SENSITIVE_DATA_PATTERNS = {
    email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    phone: /(\+55\s?)?\(?(\d{2})\)?\s?(\d{4,5})-?(\d{4})/g,
    whatsapp: /\b(whatsapp|zap|wpp)\b.*?(\d{2,3}[\s\-]?\d{8,9})/gi,
    telegram: /\b(telegram|tele)\b.*?(@\w+|\d+)/gi,
    instagram: /\b(instagram|insta)\b.*?(@\w+)/gi,
    facebook: /\b(facebook|face|fb)\b.*?(@\w+|facebook\.com)/gi
  };

  /**
   * Filter sensitive content from messages
   */
  static filterSensitiveContent(content: string): { filtered: string; isFiltered: boolean; reason?: string } {
    let filtered = content;
    let isFiltered = false;
    const reasons: string[] = [];

    // Filter emails
    if (this.SENSITIVE_DATA_PATTERNS.email.test(content)) {
      filtered = filtered.replace(this.SENSITIVE_DATA_PATTERNS.email, '[EMAIL REMOVED]');
      isFiltered = true;
      reasons.push('email detected');
    }

    // Filter phones
    if (this.SENSITIVE_DATA_PATTERNS.phone.test(content)) {
      filtered = filtered.replace(this.SENSITIVE_DATA_PATTERNS.phone, '[PHONE REMOVED]');
      isFiltered = true;
      reasons.push('phone detected');
    }

    // Filter WhatsApp
    if (this.SENSITIVE_DATA_PATTERNS.whatsapp.test(content)) {
      filtered = filtered.replace(this.SENSITIVE_DATA_PATTERNS.whatsapp, 'WhatsApp [CONTACT REMOVED]');
      isFiltered = true;
      reasons.push('WhatsApp detected');
    }

    // Filter Telegram
    if (this.SENSITIVE_DATA_PATTERNS.telegram.test(content)) {
      filtered = filtered.replace(this.SENSITIVE_DATA_PATTERNS.telegram, 'Telegram [CONTACT REMOVED]');
      isFiltered = true;
      reasons.push('Telegram detected');
    }

    // Filter Instagram
    if (this.SENSITIVE_DATA_PATTERNS.instagram.test(content)) {
      filtered = filtered.replace(this.SENSITIVE_DATA_PATTERNS.instagram, 'Instagram [USER REMOVED]');
      isFiltered = true;
      reasons.push('Instagram detected');
    }

    // Filter Facebook
    if (this.SENSITIVE_DATA_PATTERNS.facebook.test(content)) {
      filtered = filtered.replace(this.SENSITIVE_DATA_PATTERNS.facebook, 'Facebook [USER REMOVED]');
      isFiltered = true;
      reasons.push('Facebook detected');
    }

    return {
      filtered,
      isFiltered,
      reason: reasons.length > 0 ? reasons.join(', ') : undefined
    };
  }

  /**
   * Buscar chats do usuário
   */
  static async getUserChats(userId: string): Promise<Array<{
    chat: ChatData;
    otherUser: UserProfile;
    age: number;
  }>> {
    const supabase = await createClient();

    try {
      // Buscar chats onde o usuário participa
      const { data: chats } = await supabase
        .from('chats')
        .select('*')
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
        .eq('status', 'active')
        .order('last_message_at', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false });

      if (!chats || chats.length === 0) {
        return [];
      }

      // Buscar perfis dos outros usuários
      const otherUserIds = chats.map(chat => 
        chat.user1_id === userId ? chat.user2_id : chat.user1_id
      );

      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, first_name, last_name, birth_date, profile_picture_url')
        .in('user_id', otherUserIds);

      if (!profiles) return [];

      // Combinar dados
      return chats.map(chat => {
        const otherUserId = chat.user1_id === userId ? chat.user2_id : chat.user1_id;
        const profile = profiles.find(p => p.user_id === otherUserId);
        if (!profile) return null;

        const age = this.calculateAge(profile.birth_date);

        return {
          chat: chat as ChatData,
          otherUser: profile as UserProfile,
          age
        };
      }).filter(Boolean) as Array<{
        chat: ChatData;
        otherUser: UserProfile;
        age: number;
      }>;

    } catch (error) {
      console.error('Erro ao buscar chats do usuário:', error);
      return [];
    }
  }

  /**
   * Buscar um chat específico com validação de acesso
   */
  static async getChat(chatId: number, userId: string): Promise<{
    chat: ChatData;
    otherUser: UserProfile;
    age: number;
  } | null> {
    const supabase = await createClient();

    try {
      // Buscar chat verificando se usuário tem acesso
      const { data: chat } = await supabase
        .from('chats')
        .select('*')
        .eq('id', chatId)
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
        .single();

      if (!chat) return null;

      // Buscar perfil do outro usuário
      const otherUserId = chat.user1_id === userId ? chat.user2_id : chat.user1_id;
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('user_id, first_name, last_name, birth_date, profile_picture_url')
        .eq('user_id', otherUserId)
        .single();

      if (!profile) return null;

      const age = this.calculateAge(profile.birth_date);

      return {
        chat: chat as ChatData,
        otherUser: profile as UserProfile,
        age
      };

    } catch (error) {
      console.error('Erro ao buscar chat:', error);
      return null;
    }
  }

  /**
   * Buscar mensagens de um chat
   */
  static async getChatMessages(
    chatId: number, 
    userId: string, 
    limit: number = 50,
    before?: string
  ): Promise<MessageData[]> {
    const supabase = await createClient();

    try {
      // Verificar se usuário tem acesso ao chat
      const { data: chat } = await supabase
        .from('chats')
        .select('user1_id, user2_id')
        .eq('id', chatId)
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
        .single();

      if (!chat) return [];

      // Buscar mensagens
      let query = supabase
        .from('messages')
        .select('*')
        .eq('chat_id', chatId)
        .neq('status', 'deleted')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (before) {
        query = query.lt('created_at', before);
      }

      const { data: messages } = await query;

      return (messages as MessageData[])?.reverse() || [];

    } catch (error) {
      console.error('Erro ao buscar mensagens:', error);
      return [];
    }
  }

  /**
   * Enviar mensagem
   */
  static async sendMessage(
    chatId: number,
    senderId: string,
    content: string,
    messageType: 'text' | 'image' | 'emoji' = 'text',
    mediaUrl?: string,
    replyToMessageId?: number
  ): Promise<{ success: boolean; message?: MessageData; error?: string }> {
    const supabase = await createClient();

    try {
      // Verificar se usuário tem acesso ao chat
      const { data: chat } = await supabase
        .from('chats')
        .select('*')
        .eq('id', chatId)
        .or(`user1_id.eq.${senderId},user2_id.eq.${senderId}`)
        .single();

      if (!chat) {
        return { success: false, error: 'Chat not found or no access' };
      }

      if (chat.status !== 'active') {
        return { success: false, error: 'Chat is not active' };
      }

      // Filter sensitive content
      const { filtered, isFiltered, reason } = this.filterSensitiveContent(content);

      // Preparar dados da mensagem
      const messageData = {
        chat_id: chatId,
        sender_id: senderId,
        content: filtered,
        message_type: messageType,
        media_url: mediaUrl,
        is_filtered: isFiltered,
        filtered_reason: reason,
        original_content: isFiltered ? content : undefined,
        reply_to_message_id: replyToMessageId,
        status: 'sent' as const,
        delivered_at: new Date().toISOString()
      };

      // Inserir mensagem
      const { data: newMessage, error: messageError } = await supabase
        .from('messages')
        .insert(messageData)
        .select()
        .single();

      if (messageError) {
        console.error('Error inserting message:', messageError);
        return { success: false, error: 'Error sending message' };
      }

      // Atualizar contadores do chat
      const isUser1 = chat.user1_id === senderId;
      
      const updateData = {
        total_messages: chat.total_messages + 1,
        last_message_at: new Date().toISOString(),
        last_message_preview: filtered.slice(0, 100),
        last_message_sender_id: senderId,
        [isUser1 ? 'user2_unread_count' : 'user1_unread_count']: 
          (isUser1 ? chat.user2_unread_count : chat.user1_unread_count) + 1
      };

      await supabase
        .from('chats')
        .update(updateData)
        .eq('id', chatId);

      return { success: true, message: newMessage as MessageData };

    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      return { success: false, error: 'Erro interno do servidor' };
    }
  }

  /**
   * Marcar mensagens como lidas
   */
  static async markAsRead(chatId: number, userId: string): Promise<{ success: boolean }> {
    const supabase = await createClient();

    try {
      // Verificar acesso ao chat
      const { data: chat } = await supabase
        .from('chats')
        .select('*')
        .eq('id', chatId)
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
        .single();

      if (!chat) return { success: false };

      const isUser1 = chat.user1_id === userId;
      const now = new Date().toISOString();

      // Atualizar chat
      await supabase
        .from('chats')
        .update({
          [isUser1 ? 'user1_last_read_at' : 'user2_last_read_at']: now,
          [isUser1 ? 'user1_unread_count' : 'user2_unread_count']: 0
        })
        .eq('id', chatId);

      // Marcar mensagens não lidas como lidas
      await supabase
        .from('messages')
        .update({ 
          status: 'read',
          read_by_recipient_at: now 
        })
        .eq('chat_id', chatId)
        .neq('sender_id', userId)
        .is('read_by_recipient_at', null);

      return { success: true };

    } catch (error) {
      console.error('Erro ao marcar como lido:', error);
      return { success: false };
    }
  }

  /**
   * Denunciar mensagem
   */
  static async reportMessage(
    messageId: number
  ): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();

    try {
      const { error } = await supabase
        .from('messages')
        .update({ flagged_by_recipient: true })
        .eq('id', messageId);

      if (error) {
        console.error('Erro ao denunciar mensagem:', error);
        return { success: false, error: 'Erro ao denunciar mensagem' };
      }

      return { success: true };

    } catch (error) {
      console.error('Erro ao denunciar mensagem:', error);
      return { success: false, error: 'Erro interno do servidor' };
    }
  }

  /**
   * Bloquear chat
   */
  static async blockChat(
    chatId: number,
    userId: string
  ): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();

    try {
      // Verificar acesso ao chat
      const { data: chat } = await supabase
        .from('chats')
        .select('user1_id, user2_id')
        .eq('id', chatId)
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
        .single();

      if (!chat) {
        return { success: false, error: 'Chat não encontrado' };
      }

      const isUser1 = chat.user1_id === userId;
      const newStatus = isUser1 ? 'blocked_by_user1' : 'blocked_by_user2';

      const { error } = await supabase
        .from('chats')
        .update({ status: newStatus })
        .eq('id', chatId);

      if (error) {
        console.error('Erro ao bloquear chat:', error);
        return { success: false, error: 'Erro ao bloquear chat' };
      }

      return { success: true };

    } catch (error) {
      console.error('Erro ao bloquear chat:', error);
      return { success: false, error: 'Erro interno do servidor' };
    }
  }

  /**
   * ADMIN: Buscar todos os chats para moderação
   */
  static async getAllChatsForAdmin(
    limit: number = 50,
    status?: string
  ): Promise<Array<{
    chat: ChatData;
    user1Profile: UserProfile;
    user2Profile: UserProfile;
    flaggedMessagesCount: number;
  }>> {
    const supabase = await createClient();

    try {
      let query = supabase
        .from('chats')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(limit);

      if (status) {
        query = query.eq('status', status);
      }

      const { data: chats } = await query;

      if (!chats || chats.length === 0) return [];

      // Buscar perfis dos usuários
      const userIds = new Set<string>();
      chats.forEach(chat => {
        userIds.add(chat.user1_id);
        userIds.add(chat.user2_id);
      });

      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, first_name, last_name, profile_picture_url')
        .in('user_id', Array.from(userIds));

      if (!profiles) return [];

      // Buscar contagem de mensagens denunciadas por chat
      const { data: flaggedCounts } = await supabase
        .from('messages')
        .select('chat_id')
        .eq('flagged_by_recipient', true)
        .in('chat_id', chats.map(c => c.id));

      const flaggedCountsMap = new Map<number, number>();
      flaggedCounts?.forEach(msg => {
        flaggedCountsMap.set(msg.chat_id, (flaggedCountsMap.get(msg.chat_id) || 0) + 1);
      });

      // Combinar dados
      return chats.map(chat => {
        const user1Profile = profiles.find(p => p.user_id === chat.user1_id);
        const user2Profile = profiles.find(p => p.user_id === chat.user2_id);
        
        if (!user1Profile || !user2Profile) return null;

        return {
          chat: chat as ChatData,
          user1Profile: user1Profile as UserProfile,
          user2Profile: user2Profile as UserProfile,
          flaggedMessagesCount: flaggedCountsMap.get(chat.id) || 0
        };
      }).filter(Boolean) as Array<{
        chat: ChatData;
        user1Profile: UserProfile;
        user2Profile: UserProfile;
        flaggedMessagesCount: number;
      }>;

    } catch (error) {
      console.error('Erro ao buscar chats para admin:', error);
      return [];
    }
  }

  /**
   * ADMIN: Buscar mensagens denunciadas
   */
  static async getFlaggedMessages(limit: number = 50): Promise<Array<{
    message: MessageData;
    chat: ChatData;
    senderProfile: UserProfile;
  }>> {
    const supabase = await createClient();

    try {
      const { data: messages } = await supabase
        .from('messages')
        .select(`
          *,
          chats!inner(*)
        `)
        .eq('flagged_by_recipient', true)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (!messages || messages.length === 0) return [];

      // Buscar perfis dos remetentes
      const senderIds = messages.map(m => m.sender_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, first_name, last_name, profile_picture_url')
        .in('user_id', senderIds);

      if (!profiles) return [];

      // Combinar dados
      return messages.map(message => {
        const senderProfile = profiles.find(p => p.user_id === message.sender_id);
        if (!senderProfile) return null;

        const chat = Array.isArray(message.chats) ? message.chats[0] : message.chats;

        return {
          message: message as MessageData,
          chat: chat as ChatData,
          senderProfile: senderProfile as UserProfile
        };
      }).filter(Boolean) as Array<{
        message: MessageData;
        chat: ChatData;
        senderProfile: UserProfile;
      }>;

    } catch (error) {
      console.error('Erro ao buscar mensagens denunciadas:', error);
      return [];
    }
  }

  /**
   * Calcular idade baseada na data de nascimento
   */
  private static calculateAge(birthDate: string): number {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  }
} 