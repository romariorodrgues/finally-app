'use client'

import { useState } from 'react'
import { Heart, MapPin, Briefcase, Star, CheckCircle, XCircle, Calendar, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { useRouter } from 'next/navigation'

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
  created_at: string
}

interface UserProfile {
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

interface AdminMatchCardProps {
  match: MatchData
  user1Profile: UserProfile
  user2Profile: UserProfile
  adminUserId: string
}

export function AdminMatchCard({ match, user1Profile, user2Profile, adminUserId }: AdminMatchCardProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const router = useRouter()

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const calculateAge = (birthDate: string) => {
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
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

  const handleApprove = async () => {
    setIsProcessing(true)
    
    try {
      const response = await fetch('/api/admin/matches/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          matchId: match.id,
          adminUserId
        }),
      })

      const result = await response.json()
      
      if (result.success) {
        router.refresh()
      }
    } catch (error) {
      console.error('Erro ao aprovar match:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReject = async () => {
    setIsProcessing(true)
    
    try {
      const response = await fetch('/api/admin/matches/reject', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          matchId: match.id,
          adminUserId,
          reason: rejectionReason
        }),
      })

      const result = await response.json()
      
      if (result.success) {
        setIsRejectDialogOpen(false)
        router.refresh()
      }
    } catch (error) {
      console.error('Erro ao rejeitar match:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <Card className={`relative overflow-hidden transition-all duration-300 ${getCompatibilityBg(match.compatibility_score)}`}>
      {/* Badge de compatibilidade */}
      <div className="absolute top-4 right-4 z-10">
        <Badge className={`${getCompatibilityColor(match.compatibility_score)} bg-white/90 backdrop-blur-sm border-0 font-semibold`}>
          {Math.round(match.compatibility_score)}% compatível
        </Badge>
      </div>

      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <span className="text-lg font-serif text-gray-900">Match #{match.id}</span>
          <div className="flex items-center space-x-1">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-500">{formatDate(match.created_at)}</span>
          </div>
        </CardTitle>

        {/* Perfis dos usuários */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          {/* Usuário 1 */}
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12 border-2 border-white shadow-md">
              <AvatarImage src={user1Profile.profile_picture_url} />
              <AvatarFallback className="bg-[#D02E32] text-white text-sm font-semibold">
                {getInitials(user1Profile.first_name, user1Profile.last_name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">
                {user1Profile.first_name} {user1Profile.last_name}
              </p>
              <p className="text-sm text-gray-600 flex items-center">
                <span>{calculateAge(user1Profile.birth_date)} anos</span>
                <span className="mx-1">•</span>
                <MapPin className="h-3 w-3 mr-1" />
                <span className="truncate">{user1Profile.location_city}</span>
              </p>
              {user1Profile.occupation && (
                <p className="text-xs text-gray-500 flex items-center mt-1">
                  <Briefcase className="h-3 w-3 mr-1" />
                  <span className="truncate">{user1Profile.occupation}</span>
                </p>
              )}
            </div>
          </div>

          {/* VS */}
          <div className="flex items-center justify-center">
            <div className="bg-white rounded-full p-2 shadow-md">
              <Heart className="h-6 w-6 text-[#D02E32]" fill="currentColor" />
            </div>
          </div>

          {/* Usuário 2 */}
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12 border-2 border-white shadow-md">
              <AvatarImage src={user2Profile.profile_picture_url} />
              <AvatarFallback className="bg-[#D02E32] text-white text-sm font-semibold">
                {getInitials(user2Profile.first_name, user2Profile.last_name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">
                {user2Profile.first_name} {user2Profile.last_name}
              </p>
              <p className="text-sm text-gray-600 flex items-center">
                <span>{calculateAge(user2Profile.birth_date)} anos</span>
                <span className="mx-1">•</span>
                <MapPin className="h-3 w-3 mr-1" />
                <span className="truncate">{user2Profile.location_city}</span>
              </p>
              {user2Profile.occupation && (
                <p className="text-xs text-gray-500 flex items-center mt-1">
                  <Briefcase className="h-3 w-3 mr-1" />
                  <span className="truncate">{user2Profile.occupation}</span>
                </p>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Barra de compatibilidade */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-600">Compatibilidade Geral</span>
            <span className={`text-sm font-semibold ${getCompatibilityColor(match.compatibility_score)}`}>
              {Math.round(match.compatibility_score)}%
            </span>
          </div>
          <Progress value={match.compatibility_score} className="h-3" />
        </div>

        {/* Fatores de compatibilidade */}
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

        {/* Interesses em comum */}
        <div>
          <p className="text-xs font-medium text-gray-500 mb-1">INTERESSES EM COMUM</p>
          <div className="flex flex-wrap gap-1">
            {user1Profile.interests?.filter(interest => 
              user2Profile.interests?.includes(interest)
            ).slice(0, 3).map((interest) => (
              <Badge key={interest} variant="secondary" className="text-xs bg-white/70 text-gray-700">
                {interest}
              </Badge>
            ))}
          </div>
        </div>

        {/* Botões de ação */}
        <div className="flex justify-between items-center pt-2 gap-2">
          <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                disabled={isProcessing}
                className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
              >
                <XCircle className="h-4 w-4 mr-1" />
                Rejeitar
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <span>Rejeitar Match</span>
                </DialogTitle>
                <DialogDescription>
                  Você está prestes a rejeitar este match. Esta ação não pode ser desfeita.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Motivo da rejeição (opcional)
                  </label>
                  <Textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Descreva o motivo da rejeição..."
                    className="mt-1"
                  />
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsRejectDialogOpen(false)}
                    disabled={isProcessing}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleReject}
                    disabled={isProcessing}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {isProcessing ? 'Rejeitando...' : 'Confirmar Rejeição'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button
            size="sm"
            onClick={handleApprove}
            disabled={isProcessing}
            className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            {isProcessing ? 'Aprovando...' : 'Aprovar'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
} 