"use client"

import { useState } from 'react'
import { AlertTriangle, Flag, Eye, Ban, CheckCircle, Clock, MessageCircle, Shield, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { AdminRouteGuard } from '@/components/auth/admin-route-guard'
import { useAdminModeration } from '@/hooks/use-admin-moderation'
import { useAuth } from '@/hooks/use-auth'

function AdminModerationContent() {
  const { user } = useAuth()
  const {
    reports,
    stats,
    recentActivities,
    pagination,
    loading,
    error,
    filters,
    setFilters,
    refresh,
    resolveReport,
    dismissReport,
    goToPage
  } = useAdminModeration()

  const [selectedReport, setSelectedReport] = useState<string | null>(null)
  const [actionType, setActionType] = useState<'resolve' | 'dismiss' | null>(null)
  const [notes, setNotes] = useState('')
  const [banAction, setBanAction] = useState<'ban' | 'warn' | 'none'>('none')

  const handleAction = async (reportId: string, action: 'resolve' | 'dismiss') => {
    setSelectedReport(reportId)
    setActionType(action)
    setNotes('')
    setBanAction('none')
  }

  const confirmAction = async () => {
    if (!selectedReport || !actionType || !user?.id) return

    let success = false
    if (actionType === 'resolve') {
      success = await resolveReport(selectedReport, user.id, notes, banAction)
    } else {
      success = await dismissReport(selectedReport, user.id, notes)
    }

    if (success) {
      setSelectedReport(null)
      setActionType(null)
      setNotes('')
      setBanAction('none')
    } else {
      alert('Error processing action. Please try again.')
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case 'resolved':
        return <Badge className="bg-green-100 text-green-800">Resolved</Badge>
      case 'dismissed':
        return <Badge className="bg-gray-100 text-gray-800">Dismissed</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'perfil':
        return <Badge variant="outline" className="border-blue-500 text-blue-700">Profile</Badge>
      case 'mensagem':
        return <Badge variant="outline" className="border-purple-500 text-purple-700">Message</Badge>
      case 'foto':
        return <Badge variant="outline" className="border-orange-500 text-orange-700">Photo</Badge>
      case 'comportamento':
        return <Badge variant="outline" className="border-red-500 text-red-700">Behavior</Badge>
      default:
        return <Badge variant="outline">Other</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-rose-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <AlertTriangle className="h-8 w-8 text-orange-600" />
              <h1 className="text-3xl font-serif font-bold text-gray-900">Content Moderation</h1>
            </div>
            <p className="text-gray-600">Manage reports and keep the community safe</p>
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-yellow-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                Pending Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {loading ? '...' : stats.pending.toLocaleString()}
              </div>
              <p className="text-xs text-gray-600">Awaiting analysis</p>
            </CardContent>
          </Card>

          <Card className="border-green-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <CheckCircle className="h-4 w-4 mr-2" />
                Resolved Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {loading ? '...' : stats.resolvedToday.toLocaleString()}
              </div>
              <p className="text-xs text-green-600">Actions taken</p>
            </CardContent>
          </Card>

          <Card className="border-red-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <Ban className="h-4 w-4 mr-2" />
                Banned Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {loading ? '...' : stats.bannedUsers.toLocaleString()}
              </div>
              <p className="text-xs text-gray-600">Total active</p>
            </CardContent>
          </Card>

          <Card className="border-orange-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <Flag className="h-4 w-4 mr-2" />
                Flagged Content
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {loading ? '...' : stats.flaggedContent.toLocaleString()}
              </div>
              <p className="text-xs text-gray-600">Awaiting review</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <Select value={filters.status || 'all'} onValueChange={(value) => setFilters({ status: value as 'all' | 'pending' | 'resolved' | 'dismissed' })}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="dismissed">Dismissed</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={filters.type || 'all'} onValueChange={(value) => setFilters({ type: value as 'all' | 'profile' | 'message' | 'photo' | 'behavior' })}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="profile">Profile</SelectItem>
              <SelectItem value="message">Message</SelectItem>
              <SelectItem value="photo">Photo</SelectItem>
              <SelectItem value="behavior">Behavior</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Reports Table */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-orange-600" />
              Reports ({pagination.total.toLocaleString()})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <Shield className="h-12 w-12 text-[#CBA415] mx-auto mb-4 animate-pulse" />
                <p className="text-gray-600">Loading reports...</p>
              </div>
            ) : reports.length === 0 ? (
              <div className="text-center py-8">
                <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No reports found</p>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Reported by</TableHead>
                      <TableHead>Reported User</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell>
                          {getTypeBadge(report.type)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-gray-200">
                                {report.reporter.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium">{report.reporter}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-red-100 text-red-700">
                                {report.reportedUser.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium">{report.reportedUser}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm font-medium">{report.reason}</p>
                            <p className="text-xs text-gray-600">{report.description}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {report.createdAgo}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(report.status)}
                        </TableCell>
                        <TableCell>
                          {report.status === 'pending' ? (
                            <div className="flex space-x-2">
                              <Button 
                                size="sm" 
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => handleAction(report.id, 'resolve')}
                              >
                                <CheckCircle className="h-3 w-3" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="border-red-500 text-red-600 hover:bg-red-50"
                                onClick={() => handleAction(report.id, 'dismiss')}
                              >
                                <Ban className="h-3 w-3" />
                              </Button>
                            </div>
                          ) : (
                            <Button size="sm" variant="outline" disabled>
                              <Eye className="h-3 w-3" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6">
                    <p className="text-sm text-gray-600">
                      Page {pagination.page} of {pagination.totalPages} 
                      ({pagination.total.toLocaleString()} reports)
                    </p>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => goToPage(pagination.page - 1)}
                        disabled={pagination.page === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => goToPage(pagination.page + 1)}
                        disabled={pagination.page >= pagination.totalPages}
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Recent Activities */}
        {recentActivities.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageCircle className="h-5 w-5 mr-2 text-blue-600" />
                Recent Activities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.slice(0, 5).map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${
                        activity.status === 'resolved' ? 'bg-green-500' : 'bg-gray-500'
                      }`} />
                      <div>
                        <p className="text-sm font-medium">
                          {activity.type} report {activity.status === 'resolved' ? 'resolved' : 'dismissed'}
                        </p>
                        <p className="text-xs text-gray-600">
                          {activity.reporter} reported {activity.reportedUser}
                        </p>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(activity.updatedAt).toLocaleString('en-US')}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Dialog */}
        <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {actionType === 'resolve' ? 'Resolve Report' : 'Dismiss Report'}
              </DialogTitle>
              <DialogDescription>
                {actionType === 'resolve' 
                  ? 'Choose the appropriate action and add observations about the resolution.'
                  : 'Add a justification for dismissing this report.'
                }
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {actionType === 'resolve' && (
                <div>
                  <label className="block text-sm font-medium mb-2">Action</label>
                  <Select value={banAction} onValueChange={(value) => setBanAction(value as 'ban' | 'warn' | 'none')}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Only resolve</SelectItem>
                      <SelectItem value="warn">Warn user</SelectItem>
                      <SelectItem value="ban">Ban user</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium mb-2">Observations</label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add observations about this action..."
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedReport(null)}>
                Cancel
              </Button>
              <Button onClick={confirmAction}>
                {actionType === 'resolve' ? 'Resolve' : 'Dismiss'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}

export default function AdminModerationPage() {
  return (
    <AdminRouteGuard>
      <AdminModerationContent />
    </AdminRouteGuard>
  )
} 