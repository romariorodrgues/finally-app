"use client"

import { useState } from 'react'
import { Heart, Clock, CheckCircle, XCircle, Users, Filter, RefreshCw, ChevronLeft, ChevronRight, Star, MapPin, Briefcase, ThumbsUp, ThumbsDown } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { AdminRouteGuard } from '@/components/auth/admin-route-guard'
import { useAdminMatches } from '@/hooks/use-admin-matches'
import { AdminMatch, MatchesFilters } from '@/lib/admin/matches-service'

function AdminMatchesContent() {
  const {
    matches,
    stats,
    loading,
    error,
    pagination,
    filters,
    setFilters,
    refresh,
    approveMatch,
    rejectMatch
  } = useAdminMatches()

  const [rejectionReason, setRejectionReason] = useState("")
  const [selectedMatchForRejection, setSelectedMatchForRejection] = useState<string | null>(null)

  const handleApprove = async (matchId: string) => {
    const success = await approveMatch(matchId, 'admin-user-id') // TODO: Get logged admin ID
    if (!success) {
      alert('Error approving match')
    }
  }

  const handleReject = async (matchId: string, reason?: string) => {
    const success = await rejectMatch(matchId, 'admin-user-id', reason) // TODO: Get logged admin ID
    if (!success) {
      alert('Error rejecting match')
    }
    setSelectedMatchForRejection(null)
    setRejectionReason("")
  }

  const handlePageChange = (newPage: number) => {
    setFilters({ page: newPage })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-rose-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <Heart className="h-8 w-8 text-[#D02E32]" fill="currentColor" />
              <h1 className="text-3xl font-serif font-bold text-gray-900">Match Moderation</h1>
            </div>
            <p className="text-gray-600">Approve or reject AI-generated matches</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              onClick={refresh} 
              disabled={loading}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </Button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <Card className="border-yellow-200">
            <CardContent className="p-6 text-center">
              <Clock className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900">Pending</h3>
              <p className="text-2xl font-bold text-yellow-600">
                {loading ? '...' : stats.pending.toLocaleString()}
              </p>
            </CardContent>
          </Card>

          <Card className="border-green-200">
            <CardContent className="p-6 text-center">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900">Approved</h3>
              <p className="text-2xl font-bold text-green-600">
                {loading ? '...' : stats.approved.toLocaleString()}
              </p>
            </CardContent>
          </Card>

          <Card className="border-red-200">
            <CardContent className="p-6 text-center">
              <XCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900">Rejected</h3>
              <p className="text-2xl font-bold text-red-600">
                {loading ? '...' : stats.rejected.toLocaleString()}
              </p>
            </CardContent>
          </Card>

          <Card className="border-blue-200">
            <CardContent className="p-6 text-center">
              <Heart className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900">Mutual Matches</h3>
              <p className="text-2xl font-bold text-blue-600">
                {loading ? '...' : stats.mutualLikes.toLocaleString()}
              </p>
            </CardContent>
          </Card>

          <Card className="border-gray-200">
            <CardContent className="p-6 text-center">
              <Users className="h-8 w-8 text-gray-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900">Total</h3>
              <p className="text-2xl font-bold text-gray-600">
                {loading ? '...' : stats.total.toLocaleString()}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <Select 
                value={filters.status || 'all'} 
                onValueChange={(value) => setFilters({ status: value as MatchesFilters['status'] })}
              >
                <SelectTrigger className="w-full md:w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="pending_approval">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="mutual_like">Mutual Matches</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Matches */}
        {loading ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-600">Loading matches...</p>
            </CardContent>
          </Card>
        ) : matches.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Nenhum match encontrado
              </h3>
              <p className="text-gray-600 mb-6">
                Não há matches com os filtros selecionados.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                {pagination.total.toLocaleString()} {pagination.total === 1 ? 'Match Encontrado' : 'Matches Encontrados'}
              </h2>
            </div>

            {matches.map((match) => (
              <MatchCard 
                key={match.id} 
                match={match} 
                onApprove={handleApprove}
                onReject={(matchId) => {
                  setSelectedMatchForRejection(matchId)
                }}
              />
            ))}

            {/* Paginação */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-gray-600">
                  Página {pagination.page} de {pagination.totalPages} 
                  ({pagination.total.toLocaleString()} matches no total)
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page >= pagination.totalPages}
                  >
                    Próxima
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Dialog para Rejeição */}
        <Dialog 
          open={selectedMatchForRejection !== null} 
          onOpenChange={(open) => !open && setSelectedMatchForRejection(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Rejeitar Match</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-gray-600">
                Informe o motivo da rejeição (opcional):
              </p>
              <Textarea
                placeholder="Ex: Perfis incompatíveis, falta de informações..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setSelectedMatchForRejection(null)}>
                  Cancelar
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => selectedMatchForRejection && handleReject(selectedMatchForRejection, rejectionReason)}
                >
                  Rejeitar Match
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}

interface MatchCardProps {
  match: AdminMatch
  onApprove: (matchId: string) => void
  onReject: (matchId: string) => void
}

function MatchCard({ match, onApprove, onReject }: MatchCardProps) {
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'pending_approval':
        return 'bg-yellow-100 text-yellow-800'
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      case 'mutual_like':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending_approval':
        return 'Pending'
      case 'approved':
        return 'Approved'
      case 'rejected':
        return 'Rejected'
      case 'mutual_like':
        return 'Match Mútuo'
      default:
        return status
    }
  }

  return (
    <Card className="border-l-4 border-l-[#D02E32]">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Badge className={getStatusBadgeColor(match.status)}>
              {getStatusText(match.status)}
            </Badge>
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 text-yellow-500" fill="currentColor" />
              <span className="font-semibold">{match.compatibilityScore}%</span>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            {match.createdAgo}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* User 1 */}
          <div className="flex items-start space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={match.user1.photo} />
              <AvatarFallback>
                {match.user1.name.split(" ").map(n => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{match.user1.name}</h3>
              {match.user1.age && <p className="text-gray-600">{match.user1.age} years old</p>}
              {match.user1.location && (
                <div className="flex items-center space-x-1 text-sm text-gray-500">
                  <MapPin className="h-3 w-3" />
                  <span>{match.user1.location}</span>
                </div>
              )}
              {match.user1.occupation && (
                <div className="flex items-center space-x-1 text-sm text-gray-500">
                  <Briefcase className="h-3 w-3" />
                  <span>{match.user1.occupation}</span>
                </div>
              )}
              {match.user1.interests.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {match.user1.interests.slice(0, 3).map((interest, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {interest}
                    </Badge>
                  ))}
                  {match.user1.interests.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{match.user1.interests.length - 3}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* User 2 */}
          <div className="flex items-start space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={match.user2.photo} />
              <AvatarFallback>
                {match.user2.name.split(" ").map(n => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{match.user2.name}</h3>
              {match.user2.age && <p className="text-gray-600">{match.user2.age} years old</p>}
              {match.user2.location && (
                <div className="flex items-center space-x-1 text-sm text-gray-500">
                  <MapPin className="h-3 w-3" />
                  <span>{match.user2.location}</span>
                </div>
              )}
              {match.user2.occupation && (
                <div className="flex items-center space-x-1 text-sm text-gray-500">
                  <Briefcase className="h-3 w-3" />
                  <span>{match.user2.occupation}</span>
                </div>
              )}
              {match.user2.interests.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {match.user2.interests.slice(0, 3).map((interest, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {interest}
                    </Badge>
                  ))}
                  {match.user2.interests.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{match.user2.interests.length - 3}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* AI Analysis */}
        {match.aiAnalysis && (
          <div className="bg-blue-50 p-4 rounded-lg mb-4">
            <h4 className="font-semibold text-blue-900 mb-2">AI Analysis</h4>
            <p className="text-blue-800 text-sm">{match.aiAnalysis}</p>
          </div>
        )}

        {/* Compatibility Factors */}
        {match.matchingFactors && match.matchingFactors.length > 0 && (
          <div className="bg-green-50 p-4 rounded-lg mb-4">
            <h4 className="font-semibold text-green-900 mb-2">Compatibility Factors</h4>
            <ul className="list-disc list-inside text-green-800 text-sm space-y-1">
              {match.matchingFactors.map((factor, index) => (
                <li key={index}>{factor}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Potential Challenges */}
        {match.potentialChallenges && match.potentialChallenges.length > 0 && (
          <div className="bg-orange-50 p-4 rounded-lg mb-4">
            <h4 className="font-semibold text-orange-900 mb-2">Potential Challenges</h4>
            <ul className="list-disc list-inside text-orange-800 text-sm space-y-1">
              {match.potentialChallenges.map((challenge, index) => (
                <li key={index}>{challenge}</li>
              ))}
            </ul>
          </div>
        )}

        {/* User Actions */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <span className="text-sm text-gray-600">User 1:</span>
              {match.user1Action === 'like' ? (
                <div className="flex items-center space-x-1 text-green-600">
                  <ThumbsUp className="h-4 w-4" />
                  <span className="text-sm">Liked</span>
                </div>
              ) : match.user1Action === 'dislike' ? (
                <div className="flex items-center space-x-1 text-red-600">
                  <ThumbsDown className="h-4 w-4" />
                  <span className="text-sm">Did not like</span>
                </div>
              ) : (
                <span className="text-sm text-gray-400">No action</span>
              )}
            </div>
            
            <div className="flex items-center space-x-1">
              <span className="text-sm text-gray-600">User 2:</span>
              {match.user2Action === 'like' ? (
                <div className="flex items-center space-x-1 text-green-600">
                  <ThumbsUp className="h-4 w-4" />
                  <span className="text-sm">Liked</span>
                </div>
              ) : match.user2Action === 'dislike' ? (
                <div className="flex items-center space-x-1 text-red-600">
                  <ThumbsDown className="h-4 w-4" />
                  <span className="text-sm">Did not like</span>
                </div>
              ) : (
                <span className="text-sm text-gray-400"> No action</span>
              )}
            </div>
          </div>
        </div>

        {/* Admin Actions (only for pending matches) */}
        {match.status === 'pending_approval' && (
          <div className="flex justify-end space-x-2">
            <Button 
              variant="outline" 
              className="border-red-500 text-red-600 hover:bg-red-50"
              onClick={() => onReject(match.id)}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject
            </Button>
            <Button 
              className="bg-green-600 hover:bg-green-700"
              onClick={() => onApprove(match.id)}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve
            </Button>
          </div>
        )}

        {/* Informações de Admin para matches processados */}
        {match.status !== 'pending_approval' && match.adminApprovedBy && (
          <div className="text-xs text-gray-500 mt-4 pt-4 border-t">
            {match.status === 'approved' ? 'Approved' : 'Rejected'} by admin on{' '}
            {match.adminApprovedAt && new Date(match.adminApprovedAt).toLocaleDateString('en-US')}
            {match.adminRejectionReason && (
              <div className="mt-1">
                <span className="font-medium">Reason:</span> {match.adminRejectionReason}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function AdminMatchesPage() {
  return (
    <AdminRouteGuard>
      <AdminMatchesContent />
    </AdminRouteGuard>
  )
} 