'use client'

import { useState } from 'react'
import { Heart, MapPin, Briefcase, Star, ThumbsDown, Zap, Info } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

interface MatchData {
  id: number
  user1_id: string
  user2_id: string
  compatibility_score: number
  ai_analysis: {
    summary: string
    strengths: string[]
    potential_challenges: string[]
    relationship_advice: string[]
    conversation_starters: string[]
  }
  matching_factors: {
    personality_alignment: number
    lifestyle_compatibility: number
    values_alignment: number
    communication_style: number
    future_goals_alignment: number
    physical_chemistry_potential: number
  }
  status: string
}

interface UserMatchProfile {
  user_id: string
  first_name: string
  last_name: string
  birth_date: string
  gender: string
  location_city: string
  location_state: string
  occupation?: string
  bio: string
  interests: string[]
  profile_picture_url?: string
}

interface MatchCardProps {
  match: MatchData
  profile: UserMatchProfile
  age: number
  compatibility_percentage: number
}

export function MatchCard({ match, profile, age, compatibility_percentage }: MatchCardProps) {
  const [isProcessing, setIsProcessing] = useState(false)

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const getCompatibilityColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600'
    if (percentage >= 80) return 'text-blue-600'
    if (percentage >= 70) return 'text-amber-600'
    return 'text-gray-600'
  }

  const getCompatibilityBg = (percentage: number) => {
    if (percentage >= 90) return 'bg-green-50 border-green-200'
    if (percentage >= 80) return 'bg-blue-50 border-blue-200'
    if (percentage >= 70) return 'bg-amber-50 border-amber-200'
    return 'bg-gray-50 border-gray-200'
  }

  const handleAction = async (action: 'like' | 'pass' | 'super_like') => {
    setIsProcessing(true)
    
    try {
      const response = await fetch('/api/matches/action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          matchId: match.id,
          action
        }),
      })

      const result = await response.json()
      
      if (result.success) {
        if (result.mutualMatch) {
          // Redirect to chat or show success message
          console.log('Match mútuo! Redirecionando para chat...')
        }
        // Refresh page or update state
        window.location.reload()
      }
    } catch (error) {
      console.error('Erro ao processar ação:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Card className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-105 ${getCompatibilityBg(compatibility_percentage)}`}>
      {/* Badge de compatibilidade */}
      <div className="absolute top-4 right-4 z-10">
        <Badge className={`${getCompatibilityColor(compatibility_percentage)} bg-white/90 backdrop-blur-sm border-0 font-semibold`}>
          {compatibility_percentage}% compatível
        </Badge>
      </div>

      <CardHeader className="pb-4">
        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16 border-4 border-white shadow-lg">
            <AvatarImage src={profile.profile_picture_url} />
            <AvatarFallback className="bg-[#D02E32] text-white text-lg font-semibold">
              {getInitials(profile.first_name, profile.last_name)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <CardTitle className="text-xl font-serif text-gray-900">
              {profile.first_name} {profile.last_name}
            </CardTitle>
            <p className="text-gray-600 flex items-center space-x-1">
              <span>{age} anos</span>
              <span>•</span>
              <MapPin className="h-3 w-3" />
              <span>{profile.location_city}, {profile.location_state}</span>
            </p>
            {profile.occupation && (
              <p className="text-gray-500 flex items-center space-x-1 mt-1">
                <Briefcase className="h-3 w-3" />
                <span className="text-sm">{profile.occupation}</span>
              </p>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Bio */}
        <div>
          <p className="text-gray-700 text-sm leading-relaxed line-clamp-3">
            {profile.bio}
          </p>
        </div>

        {/* Interesses */}
        {profile.interests && profile.interests.length > 0 && (
          <div>
            <p className="text-xs font-medium text-gray-500 mb-2">INTERESSES</p>
            <div className="flex flex-wrap gap-1">
              {profile.interests.slice(0, 4).map((interest) => (
                <Badge key={interest} variant="secondary" className="text-xs bg-white/70 text-gray-700">
                  {interest}
                </Badge>
              ))}
              {profile.interests.length > 4 && (
                <Badge variant="outline" className="text-xs">
                  +{profile.interests.length - 4} mais
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Barra de compatibilidade detalhada */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium text-gray-600">Compatibilidade Geral</span>
            <span className={`text-xs font-semibold ${getCompatibilityColor(compatibility_percentage)}`}>
              {compatibility_percentage}%
            </span>
          </div>
          <Progress 
            value={compatibility_percentage} 
            className="h-2"
          />
        </div>

        {/* Fatores de compatibilidade principais */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-500">Personalidade:</span>
            <span className="font-medium">{Math.round(match.matching_factors.personality_alignment)}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Estilo de vida:</span>
            <span className="font-medium">{Math.round(match.matching_factors.lifestyle_compatibility)}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Valores:</span>
            <span className="font-medium">{Math.round(match.matching_factors.values_alignment)}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Objetivos:</span>
            <span className="font-medium">{Math.round(match.matching_factors.future_goals_alignment)}%</span>
          </div>
        </div>

        {/* Resumo da IA */}
        <div className="bg-white/70 rounded-lg p-3">
          <p className="text-xs text-gray-700 leading-relaxed line-clamp-3">
            <Star className="inline h-3 w-3 text-yellow-500 mr-1" />
            {match.ai_analysis.summary}
          </p>
        </div>

        {/* Botões de ação */}
        <div className="flex justify-between items-center pt-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleAction('pass')}
            disabled={isProcessing}
            className="flex-1 border-gray-300 hover:bg-gray-50"
          >
            <ThumbsDown className="h-4 w-4 mr-1" />
            Passar
          </Button>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="px-3">
                <Info className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  <span>Análise Detalhada</span>
                  <Badge className={getCompatibilityColor(compatibility_percentage)}>
                    {compatibility_percentage}% compatível
                  </Badge>
                </DialogTitle>
                <DialogDescription>
                  Análise completa de compatibilidade gerada por IA
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Resumo */}
                <div>
                  <h4 className="font-semibold mb-2">Resumo da Compatibilidade</h4>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {match.ai_analysis.summary}
                  </p>
                </div>

                {/* Pontos fortes */}
                <div>
                  <h4 className="font-semibold mb-2 text-green-700">Pontos Fortes</h4>
                  <ul className="space-y-1">
                    {match.ai_analysis.strengths.map((strength, index) => (
                      <li key={index} className="text-sm text-gray-700 flex items-start">
                        <span className="text-green-500 mr-2">•</span>
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Desafios potenciais */}
                <div>
                  <h4 className="font-semibold mb-2 text-amber-700">Desafios Potenciais</h4>
                  <ul className="space-y-1">
                    {match.ai_analysis.potential_challenges.map((challenge, index) => (
                      <li key={index} className="text-sm text-gray-700 flex items-start">
                        <span className="text-amber-500 mr-2">•</span>
                        {challenge}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Sugestões de conversa */}
                <div>
                  <h4 className="font-semibold mb-2 text-blue-700">Tópicos para Conversa</h4>
                  <ul className="space-y-1">
                    {match.ai_analysis.conversation_starters.map((starter, index) => (
                      <li key={index} className="text-sm text-gray-700 flex items-start">
                        <span className="text-blue-500 mr-2">•</span>
                        {starter}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Métricas detalhadas */}
                <div>
                  <h4 className="font-semibold mb-3">Métricas de Compatibilidade</h4>
                  <div className="space-y-3">
                    {Object.entries(match.matching_factors).map(([key, value]) => {
                      const labels: Record<string, string> = {
                        personality_alignment: 'Alinhamento de Personalidade',
                        lifestyle_compatibility: 'Compatibilidade de Estilo de Vida',
                        values_alignment: 'Alinhamento de Valores',
                        communication_style: 'Estilo de Comunicação',
                        future_goals_alignment: 'Alinhamento de Objetivos Futuros',
                        physical_chemistry_potential: 'Potencial de Química'
                      }
                      
                      return (
                        <div key={key}>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm text-gray-600">{labels[key] || key}</span>
                            <span className="text-sm font-medium">{Math.round(value as number)}%</span>
                          </div>
                          <Progress value={value as number} className="h-2" />
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button
            size="sm"
            onClick={() => handleAction('like')}
            disabled={isProcessing}
            className="flex-1 bg-gradient-to-r from-[#D02E32] to-[#B91C1C] hover:from-[#B91C1C] hover:to-[#D02E32] text-white"
          >
            <Heart className="h-4 w-4 mr-1" fill="currentColor" />
            Curtir
          </Button>

          <Button
            size="sm"
            onClick={() => handleAction('super_like')}
            disabled={isProcessing}
            className="px-3 bg-gradient-to-r from-[#CBA415] to-[#956F02] hover:from-[#956F02] hover:to-[#CBA415] text-white"
          >
            <Zap className="h-4 w-4" fill="currentColor" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
} 