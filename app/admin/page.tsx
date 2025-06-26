"use client"

import { Shield, AlertTriangle, Users, Heart, Clock, BarChart3, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AdminRouteGuard } from '@/components/auth/admin-route-guard'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useAdminData } from '@/hooks/use-admin-data'
import { RecentActivity } from '@/lib/admin/admin-service'
import { AdminStatsChart } from '@/components/admin/admin-stats-chart'

interface SessionUser {
  id?: string
  email?: string | null
  name?: string | null
  image?: string | null
  role?: string
}

function AdminPanelContent() {
  const { data: session } = useSession()
  const user = session?.user as SessionUser | undefined
  
  const { stats, recentActivity, loading, error, refresh } = useAdminData()
  
  const formatTimeAgo = (timestamp: string) => {
    const now = new Date().getTime()
    const time = new Date(timestamp).getTime()
    const diffInMinutes = Math.floor((now - time) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'a few seconds ago'
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours} hours ago`
    
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays} days ago`
  }
  
  const getActivityColor = (type: RecentActivity['type']) => {
    switch (type) {
      case 'user_registered': return 'bg-green-500'
      case 'match_created': return 'bg-blue-500'
      case 'report_created': return 'bg-orange-500'
      default: return 'bg-gray-500'
    }
  }
  
  const getActivityDescription = (activity: RecentActivity) => {
    switch (activity.type) {
      case 'user_registered':
        return activity.user?.name ? `${activity.user.name} registered` : 'New user registered'
      case 'match_created':
        return 'New match created'
      case 'report_created':
        return activity.user?.name ? `${activity.user.name} made a report` : 'New report created'
      default:
        return activity.description
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-rose-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <Shield className="h-8 w-8 text-[#CBA415]" />
                <h1 className="text-3xl font-serif font-bold text-gray-900">
                  Welcome, {user?.name || 'Admin'}!
                </h1>
              </div>
              <p className="text-gray-600">Finally platform control center</p>
            </div>
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
          
          {/* Error Message */}
          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600">{error}</p>
            </div>
          )}
        </div>

        {/* Quick Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-blue-200 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {loading ? '...' : stats.totalUsers.toLocaleString()}
              </div>
              <p className="text-xs text-green-600">
                {loading ? '...' : `+${stats.recentGrowth.usersGrowth}% this month`}
              </p>
            </CardContent>
          </Card>

          <Card className="border-rose-200 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Matches Created</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#D02E32]">
                {loading ? '...' : stats.totalMatches.toLocaleString()}
              </div>
              <p className="text-xs text-green-600">
                {loading ? '...' : `+${stats.recentGrowth.matchesGrowth}% this month`}
              </p>
            </CardContent>
          </Card>

          <Card className="border-green-200 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Active Conversations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {loading ? '...' : stats.activeChats.toLocaleString()}
              </div>
              <p className="text-xs text-green-600">
                {loading ? '...' : `+${stats.recentGrowth.chatsGrowth}% this month`}
              </p>
            </CardContent>
          </Card>

          <Card className="border-amber-200 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">
                {loading ? '...' : stats.pendingMatches}
              </div>
              <p className="text-xs text-gray-600">Matches awaiting approval</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <AdminStatsChart stats={stats} loading={loading} />
          
          {/* Recent Activity Summary */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-[#D02E32]">
                <Clock className="h-5 w-5 mr-2" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-4">
                  <p className="text-gray-600">Loading activities...</p>
                </div>
              ) : recentActivity.length > 0 ? (
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-2 mb-1">
                        <div className={`w-2 h-2 rounded-full ${getActivityColor(activity.type)}`}></div>
                        <span className="text-sm font-medium">
                          {getActivityDescription(activity)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 ml-4">
                        {formatTimeAgo(activity.timestamp)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-600">No recent activity</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-[#D02E32]">
                <Users className="h-5 w-5 mr-2" />
                User Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">Manage users, roles and permissions</p>
              <div className="flex flex-wrap gap-2">
                <Link href="/admin/users">
                  <Button className="bg-[#D02E32] hover:bg-[#AF2427]">
                    View All Users
                  </Button>
                </Link>
                <Link href="/admin/users/create">
                  <Button variant="outline">
                    Create User
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-[#D02E32]">
                <Heart className="h-5 w-5 mr-2" />
                Match Moderation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">Approve and moderate AI-generated matches</p>
              <div className="flex items-center justify-between">
                <Badge className="bg-yellow-100 text-yellow-800">
                  {loading ? '...' : `${stats.pendingMatches} Pending`}
                </Badge>
                <Link href="/admin/matches">
                  <Button className="bg-[#CBA415] hover:bg-[#A08912]">
                    Moderate Matches
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-[#D02E32]">
                <BarChart3 className="h-5 w-5 mr-2" />
                Reports and Analytics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">View metrics and generate reports</p>
              <div className="flex flex-wrap gap-2">
                <Link href="/admin/reports">
                  <Button variant="outline">
                    View Reports
                  </Button>
                </Link>
                <Button variant="outline" size="sm">
                  Export Data
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-[#D02E32]">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Content Moderation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">Manage reports and maintain security</p>
              <div className="flex items-center justify-between">
                <Badge className="bg-red-100 text-red-800">5 Reports</Badge>
                <Link href="/admin/moderation">
                  <Button className="bg-orange-600 hover:bg-orange-700">
                    Moderate Content
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

export default function AdminPanel() {
  return (
    <AdminRouteGuard>
      <AdminPanelContent />
    </AdminRouteGuard>
  )
}
