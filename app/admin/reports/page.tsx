"use client"

import { FileText, TrendingUp, Users, Heart, Calendar, Download, RefreshCw, BarChart3, PieChart, Activity } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AdminRouteGuard } from '@/components/auth/admin-route-guard'
import { useAdminReports } from '@/hooks/use-admin-reports'

function AdminReportsContent() {
  const {
    data,
    loading,
    error,
    filters,
    setFilters,
    refresh,
    exportReport
  } = useAdminReports()

  const handleExport = async (format: 'pdf' | 'excel') => {
    const success = await exportReport(format)
    if (!success) {
      alert('Error exporting report')
    }
  }

  const formatGrowthRate = (rate: number) => {
    const sign = rate >= 0 ? '+' : ''
    return `${sign}${rate}%`
  }

  const getGrowthColor = (rate: number) => {
    return rate >= 0 ? 'text-green-600' : 'text-red-600'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-rose-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <FileText className="h-8 w-8 text-[#CBA415]" />
              <h1 className="text-3xl font-serif font-bold text-gray-900">Reports</h1>
            </div>
            <p className="text-gray-600">Platform analysis and statistics</p>
          </div>
          <div className="flex items-center space-x-2">
            <Select 
              value={filters.period || '30'} 
              onValueChange={(value) => setFilters({ period: value })}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
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

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-4 mb-8">
          <Button 
            className="bg-[#CBA415] hover:bg-[#A08912]"
            onClick={() => handleExport('pdf')}
          >
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Button 
            variant="outline"
            onClick={() => handleExport('excel')}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Schedule Report
          </Button>
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <Users className="h-4 w-4 mr-2" />
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {loading ? '...' : data.overview.totalUsers.toLocaleString()}
              </div>
              <p className={`text-xs ${getGrowthColor(data.overview.userGrowthRate)}`}>
                {formatGrowthRate(data.overview.userGrowthRate)} this month
              </p>
            </CardContent>
          </Card>

          <Card className="border-rose-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <Heart className="h-4 w-4 mr-2" />
                Matches Made
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#D02E32]">
                {loading ? '...' : data.overview.totalMatches.toLocaleString()}
              </div>
              <p className={`text-xs ${getGrowthColor(data.overview.matchGrowthRate)}`}>
                {formatGrowthRate(data.overview.matchGrowthRate)} this month
              </p>
            </CardContent>
          </Card>

          <Card className="border-green-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <TrendingUp className="h-4 w-4 mr-2" />
                Active Conversations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {loading ? '...' : data.overview.totalChats.toLocaleString()}
              </div>
              <p className={`text-xs ${getGrowthColor(data.overview.chatGrowthRate)}`}>
                {formatGrowthRate(data.overview.chatGrowthRate)} this month
              </p>
            </CardContent>
          </Card>

          <Card className="border-amber-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                Success Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">
                {loading ? '...' : `${data.overview.successRate}%`}
              </div>
              <p className="text-xs text-gray-600">Matches that become conversations</p>
            </CardContent>
          </Card>
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Premium Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-purple-600">
                {loading ? '...' : data.overview.premiumUsers.toLocaleString()}
              </div>
              <p className="text-xs text-gray-600">
                {data.features.premiumAdoption}% of users
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Therapists</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-indigo-600">
                {loading ? '...' : data.overview.totalTherapists.toLocaleString()}
              </div>
              <p className="text-xs text-gray-600">
                {data.features.therapistUsage}% of users
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Verified Profiles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-emerald-600">
                {loading ? '...' : data.overview.verifiedUsers.toLocaleString()}
              </div>
              <p className="text-xs text-gray-600">
                {data.features.verificationRate}% of users
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Reports */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Daily Activity Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2 text-blue-600" />
                Daily Activity (Last 7 days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <p className="text-gray-600">Loading data...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {data.dailyActivity.map((day, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm font-medium">
                        {new Date(day.date).toLocaleDateString('en-US', { 
                          day: '2-digit', 
                          month: 'short' 
                        })}
                      </div>
                      <div className="flex space-x-4 text-sm">
                        <span className="text-blue-600">
                          {day.newUsers} users
                        </span>
                        <span className="text-red-600">
                          {day.newMatches} matches
                        </span>
                        <span className="text-green-600">
                          {day.newChats} chats
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Match Success Rate */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Heart className="h-5 w-5 mr-2 text-rose-600" />
                Match Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Total Matches</span>
                  <Badge className="bg-blue-100 text-blue-800">
                    {loading ? '...' : data.matches.total.toLocaleString()}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Pending</span>
                  <Badge className="bg-yellow-100 text-yellow-800">
                    {loading ? '...' : data.matches.pending.toLocaleString()}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Approved</span>
                  <Badge className="bg-green-100 text-green-800">
                    {loading ? '...' : data.matches.approved.toLocaleString()}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Mutual Matches</span>
                  <Badge className="bg-purple-100 text-purple-800">
                    {loading ? '...' : data.matches.mutualLikes.toLocaleString()}
                  </Badge>
                </div>
                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Success Rate</span>
                    <Badge className="bg-emerald-100 text-emerald-800">
                      {loading ? '...' : `${data.matches.successRate}%`}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Features Usage */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <PieChart className="h-5 w-5 mr-2 text-purple-600" />
                Feature Usage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Profile Completion</span>
                  <Badge className="bg-green-100 text-green-800">
                    {loading ? '...' : `${data.features.profileCompletion}%`}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Premium Adoption</span>
                  <Badge className="bg-purple-100 text-purple-800">
                    {loading ? '...' : `${data.features.premiumAdoption}%`}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Therapist Usage</span>
                  <Badge className="bg-indigo-100 text-indigo-800">
                    {loading ? '...' : `${data.features.therapistUsage}%`}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Verification Rate</span>
                  <Badge className="bg-emerald-100 text-emerald-800">
                    {loading ? '...' : `${data.features.verificationRate}%`}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Geographic Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Geographic Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ) : data.geographic.length > 0 ? (
                <div className="space-y-4">
                  {data.geographic.map((location, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span>{location.state}</span>
                      <Badge className="bg-blue-100 text-blue-800">
                        {location.percentage}%
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600">No geographic data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

export default function AdminReportsPage() {
  return (
    <AdminRouteGuard>
      <AdminReportsContent />
    </AdminRouteGuard>
  )
} 