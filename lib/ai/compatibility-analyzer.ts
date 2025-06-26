import OpenAI from 'openai';
import { createClient } from '@/lib/supabase/server';

interface CompatibilityAnalysis {
  compatibility_score: number;
  matching_factors: {
    personality_alignment: number;
    lifestyle_compatibility: number;
    values_alignment: number;
    communication_style: number;
    future_goals_alignment: number;
    physical_chemistry_potential: number;
  };
  ai_analysis: {
    summary: string;
    strengths: string[];
    potential_challenges: string[];
    relationship_advice: string[];
    conversation_starters: string[];
  };
  detailed_breakdown: {
    personality_match: string;
    lifestyle_match: string;
    values_match: string;
    communication_match: string;
    long_term_potential: string;
  };
}

interface ProfileAnalysis {
  personality_summary: string;
  compatibility_factors: string[];
  strengths: string[];
  red_flags: string[];
  relationship_style: string;
  ideal_partner_traits: string[];
  growth_areas: string[];
}

interface DatabaseProfile {
  user_id: string;
  first_name: string;
  last_name: string;
  birth_date: string;
  gender: string;
  location_city: string;
  location_state: string;
  occupation?: string;
  education_level?: string;
  bio: string;
  interests: string[];
  relationship_status: string;
  has_children: boolean;
  wants_children?: string;
}

interface DatabaseQuestionnaire {
  user_id: string;
  relationship_goals?: string;
  personality_type?: string;
  values_priorities?: string;
  communication_style?: string;
  conflict_resolution_style?: string;
  love_language_primary?: string;
  future_plans_ten_year?: string;
  deal_breakers?: string;
  lifestyle_preferences?: string;
  [key: string]: unknown; // Para outros campos do questionário
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export class CompatibilityAnalyzer {
  
  static async analyzeUserProfile(userId: string): Promise<ProfileAnalysis | null> {
    const supabase = await createClient();
    
    // Buscar perfil e questionário do usuário
    const [profileResult, questionnaireResult] = await Promise.all([
      supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single(),
      supabase
        .from('questionnaires')
        .select('*')
        .eq('user_id', userId)
        .single()
    ]);

    if (!profileResult.data || !questionnaireResult.data) {
      throw new Error('Perfil ou questionário não encontrado');
    }

    const profile = profileResult.data as DatabaseProfile;
    const questionnaire = questionnaireResult.data as DatabaseQuestionnaire;

    // Criar prompt para análise individual do perfil
    const prompt = this.createProfileAnalysisPrompt(profile, questionnaire);
    
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `Você é um especialista em psicologia relacional e matchmaking. Analise o perfil do usuário e forneça insights profundos sobre sua personalidade, valores, estilo de relacionamento e compatibilidade geral. Seja específico, empático e construtivo.`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      });

      const analysis = completion.choices[0].message.content;
      
      // Parsear e estruturar a análise
      const structuredAnalysis = this.parseProfileAnalysis(analysis);
      
      // Salvar análise no banco
      if (structuredAnalysis) {
        await supabase
          .from('questionnaires')
          .update({
            ai_personality_summary: structuredAnalysis.personality_summary,
            ai_compatibility_factors: structuredAnalysis.compatibility_factors,
            ai_red_flags: structuredAnalysis.red_flags,
            ai_strengths: structuredAnalysis.strengths,
            ai_last_analyzed: new Date().toISOString()
          })
          .eq('user_id', userId);
      }

      return structuredAnalysis;
      
    } catch (error) {
      console.error('Erro na análise de perfil:', error);
      throw new Error('Falha na análise do perfil');
    }
  }

  static async analyzeCompatibility(
    user1Id: string, 
    user2Id: string
  ): Promise<CompatibilityAnalysis> {
    // Buscar perfis e questionários de ambos usuários
    const [user1Data, user2Data] = await Promise.all([
      this.getUserCompleteData(user1Id),
      this.getUserCompleteData(user2Id)
    ]);

    // Criar prompt detalhado para análise de compatibilidade
    const prompt = this.createCompatibilityPrompt(user1Data, user2Data);
    
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `Você é um especialista em psicologia de relacionamentos e matchmaking avançado. Analise a compatibilidade entre dois perfis considerando múltiplas dimensões: personalidade, valores, estilo de vida, comunicação, objetivos futuros e química potencial. Forneça análise detalhada, scores específicos e insights práticos.`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.6,
        max_tokens: 3000
      });

      const analysis = completion.choices[0].message.content;
      
      // Parsear e estruturar análise de compatibilidade
      const compatibilityAnalysis = this.parseCompatibilityAnalysis(analysis);
      
      return compatibilityAnalysis;
      
    } catch (error) {
      console.error('Erro na análise de compatibilidade:', error);
      throw new Error('Falha na análise de compatibilidade');
    }
  }

  private static async getUserCompleteData(userId: string) {
    const supabase = await createClient();
    
    const [profileResult, questionnaireResult] = await Promise.all([
      supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single(),
      supabase
        .from('questionnaires')
        .select('*')
        .eq('user_id', userId)
        .single()
    ]);

    return {
      profile: profileResult.data as DatabaseProfile,
      questionnaire: questionnaireResult.data as DatabaseQuestionnaire
    };
  }

  private static createProfileAnalysisPrompt(profile: DatabaseProfile, questionnaire: DatabaseQuestionnaire): string {
    return `
Analise este perfil de usuário completo para um app de relacionamentos:

## DADOS PESSOAIS:
- Nome: ${profile.first_name}
- Idade: ${this.calculateAge(profile.birth_date)} anos
- Gênero: ${profile.gender}
- Localização: ${profile.location_city}, ${profile.location_state}
- Profissão: ${profile.occupation || 'Não informado'}
- Educação: ${profile.education_level || 'Não informado'}
- Status: ${profile.relationship_status}
- Filhos: ${profile.has_children ? 'Sim' : 'Não'}
- Quer filhos: ${profile.wants_children || 'Não informado'}
- Bio: ${profile.bio}
- Interesses: ${profile.interests?.join(', ') || 'Não informado'}

## RESPOSTAS DO QUESTIONÁRIO (principais):
${this.formatQuestionnaireForAnalysis(questionnaire)}

Por favor, forneça uma análise estruturada em JSON com:
{
  "personality_summary": "Resumo da personalidade em 2-3 parágrafos",
  "compatibility_factors": ["fatores", "que", "influenciam", "compatibilidade"],
  "strengths": ["pontos", "fortes", "para", "relacionamentos"],
  "red_flags": ["possíveis", "desafios", "ou", "flags"],
  "relationship_style": "Descrição do estilo de relacionamento",
  "ideal_partner_traits": ["características", "ideais", "do", "parceiro"],
  "growth_areas": ["áreas", "para", "desenvolvimento", "pessoal"]
}
    `;
  }

  private static createCompatibilityPrompt(
    user1Data: { profile: DatabaseProfile; questionnaire: DatabaseQuestionnaire }, 
    user2Data: { profile: DatabaseProfile; questionnaire: DatabaseQuestionnaire }
  ): string {
    const user1 = user1Data.profile;
    const user2 = user2Data.profile;
    const q1 = user1Data.questionnaire;
    const q2 = user2Data.questionnaire;

    return `
Analise a compatibilidade entre estes dois usuários de um app de relacionamentos:

## USUÁRIO 1:
- Nome: ${user1.first_name}
- Idade: ${this.calculateAge(user1.birth_date)} anos
- Gênero: ${user1.gender}
- Localização: ${user1.location_city}, ${user1.location_state}
- Profissão: ${user1.occupation || 'Não informado'}
- Bio: ${user1.bio}
- Interesses: ${user1.interests?.join(', ') || 'Não informado'}
Questionário resumido: ${this.formatQuestionnaireForAnalysis(q1)}

## USUÁRIO 2:
- Nome: ${user2.first_name}
- Idade: ${this.calculateAge(user2.birth_date)} anos
- Gênero: ${user2.gender}
- Localização: ${user2.location_city}, ${user2.location_state}
- Profissão: ${user2.occupation || 'Não informado'}
- Bio: ${user2.bio}
- Interesses: ${user2.interests?.join(', ') || 'Não informado'}
Questionário resumido: ${this.formatQuestionnaireForAnalysis(q2)}

Forneça análise detalhada em JSON:
{
  "compatibility_score": 85, // 0-100
  "matching_factors": {
    "personality_alignment": 80, // 0-100
    "lifestyle_compatibility": 90,
    "values_alignment": 85,
    "communication_style": 75,
    "future_goals_alignment": 88,
    "physical_chemistry_potential": 82
  },
  "ai_analysis": {
    "summary": "Resumo da compatibilidade em 2-3 parágrafos",
    "strengths": ["pontos", "fortes", "da", "combinação"],
    "potential_challenges": ["desafios", "a", "superar"],
    "relationship_advice": ["conselhos", "específicos"],
    "conversation_starters": ["tópicos", "para", "primeiro", "contato"]
  },
  "detailed_breakdown": {
    "personality_match": "Análise das personalidades",
    "lifestyle_match": "Análise dos estilos de vida",
    "values_match": "Análise dos valores",
    "communication_match": "Análise da comunicação",
    "long_term_potential": "Potencial de longo prazo"
  }
}
    `;
  }

  private static formatQuestionnaireForAnalysis(questionnaire: DatabaseQuestionnaire): string {
    if (!questionnaire) return 'Questionário não preenchido';
    
    // Resumir as respostas mais importantes
    const keyFields = [
      'relationship_goals',
      'personality_type',
      'values_priorities',
      'communication_style',
      'conflict_resolution_style',
      'love_language_primary',
      'future_plans_ten_year',
      'deal_breakers',
      'lifestyle_preferences'
    ];

    const summary = keyFields
      .map(field => {
        const value = questionnaire[field];
        if (value) {
          return `${field}: ${value}`;
        }
        return null;
      })
      .filter(Boolean)
      .join('; ');

    return summary || 'Principais respostas não disponíveis';
  }

  private static parseProfileAnalysis(analysis: string | null): ProfileAnalysis | null {
    if (!analysis) return null;
    
    try {
      // Tentar extrair JSON da resposta
      const jsonMatch = analysis.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]) as ProfileAnalysis;
      }
      
      // Se não conseguir parsear, criar estrutura básica
      return {
        personality_summary: analysis.substring(0, 500),
        compatibility_factors: ['Análise manual necessária'],
        strengths: ['Perfil interessante'],
        red_flags: ['Análise incompleta'],
        relationship_style: 'A definir',
        ideal_partner_traits: ['Compatibilidade a avaliar'],
        growth_areas: ['Desenvolvimento contínuo']
      };
    } catch (error) {
      console.error('Erro ao parsear análise:', error);
      return null;
    }
  }

  private static parseCompatibilityAnalysis(analysis: string | null): CompatibilityAnalysis {
    if (!analysis) {
      throw new Error('Análise vazia');
    }
    
    try {
      // Tentar extrair JSON da resposta
      const jsonMatch = analysis.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return parsed as CompatibilityAnalysis;
      }
      
      // Fallback se não conseguir parsear
      return {
        compatibility_score: 75,
        matching_factors: {
          personality_alignment: 75,
          lifestyle_compatibility: 75,
          values_alignment: 75,
          communication_style: 75,
          future_goals_alignment: 75,
          physical_chemistry_potential: 75
        },
        ai_analysis: {
          summary: 'Análise detalhada em processamento. Compatibilidade promissora detectada.',
          strengths: ['Análise em progresso'],
          potential_challenges: ['Avaliação pendente'],
          relationship_advice: ['Recomendações a definir'],
          conversation_starters: ['Tópicos interessantes a explorar']
        },
        detailed_breakdown: {
          personality_match: 'Análise de personalidade em andamento',
          lifestyle_match: 'Avaliação de estilo de vida pendente',
          values_match: 'Análise de valores em progresso',
          communication_match: 'Avaliação de comunicação a definir',
          long_term_potential: 'Potencial de longo prazo promissor'
        }
      };
    } catch (error) {
      console.error('Erro ao parsear análise de compatibilidade:', error);
      throw new Error('Falha no processamento da análise');
    }
  }

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

  static async findPotentialMatches(userId: string, limit: number = 10): Promise<string[]> {
    const supabase = await createClient();
    
    // Buscar perfil do usuário atual
    const { data: currentUser } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (!currentUser) {
      throw new Error('Perfil não encontrado');
    }

    const typedCurrentUser = currentUser as DatabaseProfile;

    // Buscar usuários compatíveis baseado em critérios básicos
    const { data: potentialMatches } = await supabase
      .from('profiles')
      .select('user_id, first_name, gender, location_city, location_state, interests, birth_date')
      .neq('user_id', userId) // Não incluir o próprio usuário
      .eq('gender', typedCurrentUser.gender === 'masculino' ? 'feminino' : 'masculino') // Assumindo heterossexual por padrão
      .limit(50); // Buscar mais para depois filtrar

    if (!potentialMatches) {
      return [];
    }

    // Filtrar por idade (± 10 anos)
    const currentAge = this.calculateAge(typedCurrentUser.birth_date);
    const filteredByAge = potentialMatches.filter(match => {
      const matchAge = this.calculateAge(match.birth_date);
      return Math.abs(currentAge - matchAge) <= 10;
    });

    // Priorizar por proximidade geográfica e interesses em comum
    const scoredMatches = filteredByAge.map(match => {
      let score = 0;
      
      // Pontuação por localização
      if (match.location_city === typedCurrentUser.location_city) {
        score += 30;
      } else if (match.location_state === typedCurrentUser.location_state) {
        score += 15;
      }
      
      // Pontuação por interesses em comum
      const commonInterests = typedCurrentUser.interests?.filter(interest => 
        match.interests?.includes(interest)
      ).length || 0;
      score += commonInterests * 5;
      
      return { ...match, score };
    });

    // Ordenar por pontuação e retornar IDs
    return scoredMatches
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(match => match.user_id);
  }
} 