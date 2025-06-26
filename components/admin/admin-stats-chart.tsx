'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AdminStats } from '@/lib/admin/admin-service'

interface AdminStatsChartProps {
  stats: AdminStats
  loading: boolean
}

export function AdminStatsChart({ stats, loading }: AdminStatsChartProps) {
  if (loading) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-[#D02E32]">
            Platform Growth
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <p className="text-gray-600">Loading metrics...</p>
        </CardContent>
      </Card>
    )
  }

  const metrics = [
    {
      label: 'New Users',
      value: stats.recentGrowth.usersGrowth,
      color: 'bg-blue-500',
      total: stats.totalUsers
    },
    {
      label: 'Created Matches',
      value: stats.recentGrowth.matchesGrowth,
      color: 'bg-rose-500',
      total: stats.totalMatches
    },
    {
      label: 'Started Conversations',
      value: stats.recentGrowth.chatsGrowth,
      color: 'bg-green-500',
      total: stats.activeChats
    }
  ]

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-[#D02E32]">
          Platform Growth (Last Month)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {metrics.map((metric, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">
                  {metric.label}
                </span>
                <span className="text-sm text-gray-600">
                  +{metric.value}% ({metric.total.toLocaleString()} total)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${metric.color} transition-all duration-500`}
                  style={{
                    width: `${Math.min(metric.value, 100)}%`
                  }}
                />
              </div>
            </div>
          ))}
        </div>
        
        {/* Summary */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Average platform growth
            </p>
            <p className="text-2xl font-bold text-[#D02E32]">
              +{Math.round((stats.recentGrowth.usersGrowth + stats.recentGrowth.matchesGrowth + stats.recentGrowth.chatsGrowth) / 3)}%
            </p>
            <p className="text-xs text-gray-500">
              compared to the previous month
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 