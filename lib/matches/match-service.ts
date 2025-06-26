import { createClient } from '@/lib/supabase/server';
import { CompatibilityAnalyzer } from '@/lib/ai/compatibility-analyzer';

interface MatchData {
  id: number;
  user1_id: string;
  user2_id: string;
  compatibility_score: number;
  ai_analysis: {
    summary: string;
    strengths: string[];
    potential_challenges: string[];
    relationship_advice: string[];
    conversation_starters: string[];
  };
  matching_factors: {
    personality_alignment: number;
    lifestyle_compatibility: number;
    values_alignment: number;
    communication_style: number;
    future_goals_alignment: number;
    physical_chemistry_potential: number;
  };
  potential_challenges: Record<string, unknown>;
  status: 'pending_approval' | 'approved' | 'rejected' | 'suggested' | 'mutual_like' | 'chat_started' | 'blocked' | 'expired';
  user1_action?: string;
  user2_action?: string;
  match_source: string;
  priority_level: number;
  admin_approved_by?: string;
  admin_approved_at?: string;
  admin_rejection_reason?: string;
  created_at: string;
  updated_at: string;
}

interface UserMatchProfile {
  user_id: string;
  first_name: string;
  last_name: string;
  birth_date: string;
  gender: string;
  location_city: string;
  location_state: string;
  occupation?: string;
  bio: string;
  interests: string[];
  profile_picture_url?: string;
}

export class MatchService {
  
  /**
   * Gera matches baseados em IA para um usuário (ficam pendentes de aprovação)
   */
  static async generateMatches(userId: string, limit: number = 5): Promise<MatchData[]> {
    const supabase = await createClient();
    
    try {
      // Verificar se o usuário tem perfil completo
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (!profile) {
        throw new Error('Perfil não encontrado');
      }

      // Verificar se o questionário foi preenchido
      const { data: questionnaire } = await supabase
        .from('questionnaires')
        .select('completion_percentage')
        .eq('user_id', userId)
        .single();

      if (!questionnaire || questionnaire.completion_percentage < 80) {
        throw new Error('Questionário incompleto. Complete pelo menos 80% para gerar matches.');
      }

      // Buscar potenciais matches usando o algoritmo básico
      const potentialMatchIds = await CompatibilityAnalyzer.findPotentialMatches(userId, 20);
      
      if (potentialMatchIds.length === 0) {
        return [];
      }

      // Verificar matches que já existem para evitar duplicatas (incluindo pendentes)
      const { data: existingMatches } = await supabase
        .from('matches')
        .select('user2_id')
        .eq('user1_id', userId);

      const existingMatchIds = new Set(existingMatches?.map(m => m.user2_id) || []);
      
      // Filtrar potenciais matches que ainda não foram analisados
      const newPotentialMatches = potentialMatchIds.filter(matchId => !existingMatchIds.has(matchId));
      
      if (newPotentialMatches.length === 0) {
        return this.getApprovedMatches(userId, limit);
      }

      // Analisar compatibilidade com IA para os top matches
      const analysisPromises = newPotentialMatches
        .slice(0, Math.min(limit, newPotentialMatches.length))
        .map(async (matchId) => {
          try {
            const analysis = await CompatibilityAnalyzer.analyzeCompatibility(userId, matchId);
            return { matchId, analysis };
          } catch (error) {
            console.error(`Erro na análise de compatibilidade com ${matchId}:`, error);
            return null;
          }
        });

      const analysisResults = (await Promise.all(analysisPromises)).filter(result => result !== null);

      // Criar matches no banco de dados com status 'pending_approval'
      const matchesData = analysisResults.map(result => ({
        user1_id: userId,
        user2_id: result!.matchId,
        compatibility_score: result!.analysis.compatibility_score,
        ai_analysis: result!.analysis.ai_analysis,
        matching_factors: result!.analysis.matching_factors,
        potential_challenges: result!.analysis.ai_analysis.potential_challenges,
        status: 'pending_approval' as const,
        match_source: 'ai_algorithm',
        priority_level: Math.floor(result!.analysis.compatibility_score / 20), // 1-5 baseado no score
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 dias
      }));

      if (matchesData.length > 0) {
        const { error } = await supabase
          .from('matches')
          .insert(matchesData);

        if (error) {
          console.error('Erro ao criar matches:', error);
          return [];
        }

        // Retornar matches já aprovados em vez dos recém-criados (que estão pendentes)
        return this.getApprovedMatches(userId, limit);
      }

      return [];
      
    } catch (error) {
      console.error('Erro na geração de matches:', error);
      throw new Error('Falha na geração de matches');
    }
  }

  /**
   * Busca matches aprovados pelo admin
   */
  static async getApprovedMatches(userId: string, limit: number = 10): Promise<MatchData[]> {
    const supabase = await createClient();
    
    const { data: matches } = await supabase
      .from('matches')
      .select('*')
      .eq('user1_id', userId)
      .in('status', ['approved', 'suggested'])
      .order('priority_level', { ascending: false })
      .order('compatibility_score', { ascending: false })
      .limit(limit);

    return matches as MatchData[] || [];
  }

  /**
   * Busca matches existentes do usuário (apenas aprovados)
   */
  static async getExistingMatches(userId: string, limit: number = 10): Promise<MatchData[]> {
    return this.getApprovedMatches(userId, limit);
  }

  /**
   * Busca matches com perfis completos dos usuários (apenas aprovados)
   */
  static async getMatchesWithProfiles(userId: string, limit: number = 10): Promise<Array<{
    match: MatchData;
    profile: UserMatchProfile;
    age: number;
    compatibility_percentage: number;
  }>> {
    const matches = await this.getApprovedMatches(userId, limit);
    
    if (matches.length === 0) {
      return [];
    }

    const supabase = await createClient();
    
    // Buscar perfis dos matches
    const matchUserIds = matches.map(m => m.user2_id);
    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id, first_name, last_name, birth_date, gender, location_city, location_state, occupation, bio, interests, profile_picture_url')
      .in('user_id', matchUserIds);

    if (!profiles) {
      return [];
    }

    // Combinar matches com perfis
    const matchesWithProfiles = matches.map(match => {
      const profile = profiles.find(p => p.user_id === match.user2_id);
      if (!profile) return null;

      const age = this.calculateAge(profile.birth_date);
      
      return {
        match,
        profile: profile as UserMatchProfile,
        age,
        compatibility_percentage: Math.round(match.compatibility_score)
      };
    }).filter(Boolean) as Array<{
      match: MatchData;
      profile: UserMatchProfile;
      age: number;
      compatibility_percentage: number;
    }>;

    return matchesWithProfiles;
  }

  /**
   * Registra ação do usuário em um match (like, pass, super_like)
   */
  static async recordUserAction(
    userId: string, 
    matchId: number, 
    action: 'like' | 'pass' | 'super_like'
  ): Promise<{ success: boolean; mutualMatch?: boolean }> {
    const supabase = await createClient();
    
    try {
      // Buscar o match
      const { data: match } = await supabase
        .from('matches')
        .select('*')
        .eq('id', matchId)
        .eq('user1_id', userId)
        .single();

      if (!match) {
        throw new Error('Match não encontrado');
      }

      // Determinar qual usuário está fazendo a ação
      const isUser1 = match.user1_id === userId;
      const updateField = isUser1 ? 'user1_action' : 'user2_action';
      const actionTimeField = isUser1 ? 'user1_action_at' : 'user2_action_at';
      
      // Atualizar ação do usuário
      const updateData = {
        [updateField]: action,
        [actionTimeField]: new Date().toISOString()
      };

      // Se ambos deram like, marcar como mutual_like
      let newStatus = match.status;
      let mutualMatch = false;
      
      if (action === 'like' || action === 'super_like') {
        const otherUserAction = isUser1 ? match.user2_action : match.user1_action;
        if (otherUserAction === 'like' || otherUserAction === 'super_like') {
          newStatus = 'mutual_like';
          mutualMatch = true;
        }
      } else if (action === 'pass') {
        newStatus = 'expired';
      }

      await supabase
        .from('matches')
        .update({
          ...updateData,
          status: newStatus,
          last_interaction_at: new Date().toISOString()
        })
        .eq('id', matchId);

      // Se houve match mútuo, criar chat automaticamente
      if (mutualMatch) {
        await this.createChatForMatch(matchId);
      }

      return { success: true, mutualMatch };
      
    } catch (error) {
      console.error('Erro ao registrar ação:', error);
      return { success: false };
    }
  }

  /**
   * Cria chat quando há match mútuo
   */
  private static async createChatForMatch(matchId: number): Promise<void> {
    const supabase = await createClient();
    
    try {
      // Buscar dados do match
      const { data: match } = await supabase
        .from('matches')
        .select('user1_id, user2_id')
        .eq('id', matchId)
        .single();

      if (!match) return;

      // Verificar se chat já existe
      const { data: existingChat } = await supabase
        .from('chats')
        .select('id')
        .eq('match_id', matchId)
        .single();

      if (existingChat) return;

      // Criar novo chat
      await supabase
        .from('chats')
        .insert({
          match_id: matchId,
          user1_id: match.user1_id,
          user2_id: match.user2_id,
          status: 'active',
          chat_type: 'match_chat'
        });

      // Atualizar status do match
      await supabase
        .from('matches')
        .update({ status: 'chat_started' })
        .eq('id', matchId);
        
    } catch (error) {
      console.error('Erro ao criar chat:', error);
    }
  }

  /**
   * Busca matches mútuos (que viraram conversa)
   */
  static async getMutualMatches(userId: string): Promise<Array<{
    match: MatchData;
    profile: UserMatchProfile;
    chatId: number;
    lastMessage?: {
      content: string;
      timestamp: string;
      isFromCurrentUser: boolean;
    };
  }>> {
    const supabase = await createClient();
    
    // Buscar matches mútuos com chats
    const { data: mutualMatches } = await supabase
      .from('matches')
      .select(`
        *,
        chats!inner(id, last_message_preview, last_message_at, last_message_sender_id)
      `)
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
      .in('status', ['mutual_like', 'chat_started'])
      .order('updated_at', { ascending: false });

    if (!mutualMatches || mutualMatches.length === 0) {
      return [];
    }

    // Buscar perfis dos outros usuários
    const otherUserIds = mutualMatches.map(match => 
      match.user1_id === userId ? match.user2_id : match.user1_id
    );

    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id, first_name, last_name, birth_date, gender, location_city, location_state, occupation, bio, interests, profile_picture_url')
      .in('user_id', otherUserIds);

    if (!profiles) return [];

    // Combinar dados
    return mutualMatches.map(match => {
      const otherUserId = match.user1_id === userId ? match.user2_id : match.user1_id;
      const profile = profiles.find(p => p.user_id === otherUserId);
      if (!profile) return null;

      const chat = Array.isArray(match.chats) ? match.chats[0] : match.chats;
      
      return {
        match: match as MatchData,
        profile: profile as UserMatchProfile,
        chatId: chat.id,
        lastMessage: chat.last_message_preview ? {
          content: chat.last_message_preview,
          timestamp: chat.last_message_at,
          isFromCurrentUser: chat.last_message_sender_id === userId
        } : undefined
      };
    }).filter(Boolean) as Array<{
      match: MatchData;
      profile: UserMatchProfile;
      chatId: number;
      lastMessage?: {
        content: string;
        timestamp: string;
        isFromCurrentUser: boolean;
      };
    }>;
  }

  /**
   * Calcula idade baseada na data de nascimento
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

  /**
   * Força geração de novos matches (para debug/admin)
   */
  static async forceGenerateMatches(userId: string): Promise<MatchData[]> {
    // Primeiro, analisa o perfil do usuário se ainda não foi analisado
    try {
      await CompatibilityAnalyzer.analyzeUserProfile(userId);
    } catch (error) {
      console.error('Erro na análise de perfil:', error);
    }
    
    // Gera novos matches
    return this.generateMatches(userId, 5);
  }

  /**
   * ADMIN: Lista matches pendentes de aprovação
   */
  static async getPendingMatches(limit: number = 20): Promise<Array<{
    match: MatchData;
    user1Profile: UserMatchProfile;
    user2Profile: UserMatchProfile;
  }>> {
    const supabase = await createClient();
    
    const { data: pendingMatches } = await supabase
      .from('matches')
      .select('*')
      .eq('status', 'pending_approval')
      .order('created_at', { ascending: true })
      .limit(limit);

    if (!pendingMatches || pendingMatches.length === 0) {
      return [];
    }

    // Buscar perfis dos usuários envolvidos
    const userIds = new Set<string>();
    pendingMatches.forEach(match => {
      userIds.add(match.user1_id);
      userIds.add(match.user2_id);
    });

    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id, first_name, last_name, birth_date, gender, location_city, location_state, occupation, bio, interests, profile_picture_url')
      .in('user_id', Array.from(userIds));

    if (!profiles) {
      return [];
    }

    // Combinar matches com perfis
    return pendingMatches.map(match => {
      const user1Profile = profiles.find(p => p.user_id === match.user1_id);
      const user2Profile = profiles.find(p => p.user_id === match.user2_id);
      
      if (!user1Profile || !user2Profile) return null;

      return {
        match: match as MatchData,
        user1Profile: user1Profile as UserMatchProfile,
        user2Profile: user2Profile as UserMatchProfile
      };
    }).filter(Boolean) as Array<{
      match: MatchData;
      user1Profile: UserMatchProfile;
      user2Profile: UserMatchProfile;
    }>;
  }

  /**
   * ADMIN: Aprovar um match
   */
  static async approveMatch(
    matchId: number, 
    adminUserId: string
  ): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();
    
    try {
      const { error } = await supabase
        .from('matches')
        .update({
          status: 'approved',
          admin_approved_by: adminUserId,
          admin_approved_at: new Date().toISOString()
        })
        .eq('id', matchId)
        .eq('status', 'pending_approval');

      if (error) {
        console.error('Erro ao aprovar match:', error);
        return { success: false, error: 'Erro ao aprovar match' };
      }

      return { success: true };
    } catch (error) {
      console.error('Erro ao aprovar match:', error);
      return { success: false, error: 'Erro interno do servidor' };
    }
  }

  /**
   * ADMIN: Rejeitar um match
   */
  static async rejectMatch(
    matchId: number, 
    adminUserId: string, 
    reason?: string
  ): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();
    
    try {
      const { error } = await supabase
        .from('matches')
        .update({
          status: 'rejected',
          admin_approved_by: adminUserId,
          admin_approved_at: new Date().toISOString(),
          admin_rejection_reason: reason || 'Não especificado'
        })
        .eq('id', matchId)
        .eq('status', 'pending_approval');

      if (error) {
        console.error('Erro ao rejeitar match:', error);
        return { success: false, error: 'Erro ao rejeitar match' };
      }

      return { success: true };
    } catch (error) {
      console.error('Erro ao rejeitar match:', error);
      return { success: false, error: 'Erro interno do servidor' };
    }
  }

  /**
   * ADMIN: Aprovar matches em lote
   */
  static async batchApproveMatches(
    matchIds: number[], 
    adminUserId: string
  ): Promise<{ success: boolean; approvedCount: number; error?: string }> {
    const supabase = await createClient();
    
    try {
      const { data, error } = await supabase
        .from('matches')
        .update({
          status: 'approved',
          admin_approved_by: adminUserId,
          admin_approved_at: new Date().toISOString()
        })
        .in('id', matchIds)
        .eq('status', 'pending_approval')
        .select('id');

      if (error) {
        console.error('Erro ao aprovar matches em lote:', error);
        return { success: false, approvedCount: 0, error: 'Erro ao aprovar matches' };
      }

      return { success: true, approvedCount: data?.length || 0 };
    } catch (error) {
      console.error('Erro ao aprovar matches em lote:', error);
      return { success: false, approvedCount: 0, error: 'Erro interno do servidor' };
    }
  }
} 