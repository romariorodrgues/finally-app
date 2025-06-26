"use client"

import { useState, useEffect } from "react"
import { Shield, Users, Search, Filter, CheckCircle, MoreVertical, Ban, RefreshCw, ChevronLeft, ChevronRight, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { AdminRouteGuard } from '@/components/auth/admin-route-guard'
import Link from 'next/link'
import { useAdminUsers } from '@/hooks/use-admin-users'
import { AdminUser, UsersFilters } from '@/lib/admin/users-service'

function AdminUsersContent() {
  const {
    users,
    stats,
    loading,
    error,
    pagination,
    filters,
    setFilters,
    refresh,
    updateUserRole,
    toggleUserBan,
    resendWelcomeEmail
  } = useAdminUsers()

  const [searchInput, setSearchInput] = useState("")
  const [emailLoading, setEmailLoading] = useState<string | null>(null)

  // Debounce da busca
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters({ search: searchInput })
    }, 500)

    return () => clearTimeout(timer)
  }, [searchInput, setFilters])

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800'
      case 'therapist':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'banned':
        return 'bg-red-100 text-red-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleRoleChange = async (userId: string, newRole: string) => {
    const success = await updateUserRole(userId, newRole)
    if (!success) {
      alert('Error updating user role')
    }
  }

  const handleBanToggle = async (user: AdminUser) => {
    const shouldBan = user.status !== 'banned'
    const success = await toggleUserBan(user.id, shouldBan)
    if (!success) {
      alert('Error banning/unbanning user')
    }
  }

  const handleResendWelcomeEmail = async (user: AdminUser) => {
    try {
      setEmailLoading(user.id)
      const success = await resendWelcomeEmail(user.id)
      
      if (success) {
        alert(`Email de boas-vindas reenviado com sucesso para ${user.email}!`)
      } else {
        alert('Erro ao reenviar email de boas-vindas. Tente novamente.')
      }
    } catch (error) {
      console.error('Erro ao reenviar email:', error)
      alert('Erro interno. Tente novamente.')
    } finally {
      setEmailLoading(null)
    }
  }

  const handlePageChange = (newPage: number) => {
    setFilters({ page: newPage })
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600 mt-1">Manage all platform users</p>
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
            <Link href="/admin/users/create">
              <Button className="bg-[#D02E32] hover:bg-[#AF2427]">
                <Users className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </Link>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#D02E32]">
                {loading ? '...' : stats.totalUsers.toLocaleString()}
              </div>
              <p className="text-xs text-green-600">All users</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Active Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {loading ? '...' : stats.activeUsers.toLocaleString()}
              </div>
              <p className="text-xs text-green-600">
                {loading ? '...' : `${Math.round((stats.activeUsers / stats.totalUsers) * 100)}% do total`}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Therapeutic</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {loading ? '...' : stats.therapists.toLocaleString()}
              </div>
              <p className="text-xs text-green-600">Professionals verified</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {loading ? '...' : stats.pendingUsers.toLocaleString()}
              </div>
              <p className="text-xs text-gray-600">Waiting for approval</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters and Search</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search by name or email..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select 
                value={filters.role || 'all'} 
                onValueChange={(value) => setFilters({ role: value as UsersFilters['role'] })}
              >
                <SelectTrigger className="w-full md:w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All roles</SelectItem>
                  <SelectItem value="user">Users</SelectItem>
                  <SelectItem value="therapist">Therapist</SelectItem>
                  <SelectItem value="admin">Admins</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              Users ({loading ? '...' : pagination.total.toLocaleString()})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <p className="text-gray-600">Loading users...</p>
              </div>
            ) : users.length > 0 ? (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Member since</TableHead>
                      <TableHead>Last activity</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={`/placeholder.svg?height=32&width=32`} />
                              <AvatarFallback>
                                {user.name.split(" ").map(n => n[0]).join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{user.name}</p>
                              <p className="text-sm text-gray-600">{user.email}</p>
                              {user.verified && (
                                <div className="flex items-center space-x-1 mt-1">
                                  <CheckCircle className="h-3 w-3 text-green-500" />
                                  <span className="text-xs text-green-600">Verified</span>
                                </div>
                              )}
                              {user.isPremium && (
                                <div className="flex items-center space-x-1 mt-1">
                                  <span className="text-xs bg-yellow-100 text-yellow-800 px-1 rounded">Premium</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getRoleBadgeColor(user.role)}>
                            {user.role === 'admin' ? 'Admin' : 
                             user.role === 'therapist' ? 'Therapist' : 'User'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusBadgeColor(user.status)}>
                            {user.status === 'active' ? 'Active' : 
                             user.status === 'banned' ? 'Banned' : 'Pending'}
                          </Badge>
                        </TableCell>
                        <TableCell>{user.joinDate}</TableCell>
                        <TableCell>{user.lastActive}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {user.location || 'Not informed'}
                            {user.age && (
                              <div className="text-xs text-gray-500">{user.age} years</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Shield className="h-4 w-4 mr-2" />
                                View profile
                              </DropdownMenuItem>
                              
                              <DropdownMenuSeparator />
                              
                              <DropdownMenuItem 
                                onClick={() => handleResendWelcomeEmail(user)}
                                disabled={emailLoading === user.id}
                              >
                                <Mail className="h-4 w-4 mr-2" />
                                {emailLoading === user.id ? 'Sending...' : 'Re-send Welcome Email'}
                              </DropdownMenuItem>
                              
                              <DropdownMenuSeparator />
                              
                              <DropdownMenuItem onClick={() => handleRoleChange(user.id, user.role === 'admin' ? 'user' : 'admin')}>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                {user.role === 'admin' ? 'Remove admin' : 'Make admin'}
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-red-600"
                                onClick={() => handleBanToggle(user)}
                              >
                                <Ban className="h-4 w-4 mr-2" />
                                {user.status === 'banned' ? 'Unban user' : 'Ban user'}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Paginação */}
                {pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6">
                    <div className="text-sm text-gray-600">
                      Page {pagination.page} of {pagination.totalPages} 
                      ({pagination.total.toLocaleString()} users total)
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page <= 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page >= pagination.totalPages}
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600">No users found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function AdminUsersPage() {
  return (
    <AdminRouteGuard>
      <AdminUsersContent />
    </AdminRouteGuard>
  )
} 