"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Heart, Users, MessageCircle, Settings, Bell, Menu, Shield, BarChart3, FileText, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { SignOutButton } from '@/components/auth/sign-out-button'
import { useAuth } from '@/hooks/use-auth'

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { user, isAdmin } = useAuth()
  const pathname = usePathname()

  // Don't show header on auth pages
  if (pathname?.startsWith('/auth')) {
    return null
  }

  // Don't show header if no authenticated user
  if (!user) {
    return null
  }

  // Navigation for regular users
  const userNavigationItems = [
    { id: "dashboard", label: "Dashboard", icon: Heart, href: "/" },
    { id: "matches", label: "Matches", icon: Users, href: "/matches" },
    { id: "chat", label: "Conversations", icon: MessageCircle, href: "/chat" },
    { id: "questionnaire", label: "Questionnaire", icon: Settings, href: "/onboarding/questionnaire" },
    { id: "therapists", label: "Therapists", icon: Users, href: "/therapist" },
  ]

  // Navigation for admins
  const adminNavigationItems = [
    { id: "admin-dashboard", label: "Dashboard", icon: BarChart3, href: "/admin" },
    { id: "admin-users", label: "Users", icon: Users, href: "/admin/users" },
    { id: "admin-matches", label: "Matches", icon: Heart, href: "/admin/matches" },
    { id: "admin-reports", label: "Reports", icon: FileText, href: "/admin/reports" },
    { id: "admin-moderation", label: "Moderation", icon: AlertTriangle, href: "/admin/moderation" },
  ]

  // Choose navigation based on user role
  const navigationItems = isAdmin ? adminNavigationItems : userNavigationItems
  
  return (
    <>
      {/* Header */}
      <header className="bg-white border-b border-rose-100 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-4">
              <Link href={isAdmin ? "/admin" : "/"} className="flex items-center space-x-2">
                <Heart className="h-8 w-8 text-[#D02E32]" fill="currentColor" />
                <span className="text-2xl font-serif font-bold text-[#D02E32]">
                  Finally {isAdmin && <span className="text-[#CBA415]">Admin</span>}
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-6">
              {navigationItems.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`text-sm font-medium transition-colors flex items-center space-x-1 ${
                    pathname === item.href || (pathname?.startsWith(item.href) && item.href !== '/')
                      ? isAdmin 
                        ? "text-[#CBA415]"
                        : "text-[#D02E32]"
                      : "text-gray-600 hover:text-[#D02E32]"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>

            {/* Right side - Desktop */}
            <div className="hidden md:flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
              <Avatar>
                <AvatarImage src={user.image || undefined} />
                <AvatarFallback className="bg-[#D02E32] text-white">
                  {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {isAdmin && (
                <div className="flex items-center space-x-1 px-2 py-1 bg-[#CBA415] text-white rounded-full text-xs font-medium">
                  <Shield className="h-3 w-3" />
                  <span>Admin</span>
                </div>
              )}
              <SignOutButton />
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center space-x-2">
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80">
                  <div className="flex flex-col h-full">
                    {/* Mobile menu header */}
                    <div className="flex items-center justify-between pb-4 border-b border-rose-100">
                      <div className="flex items-center space-x-2">
                        <Heart className="h-6 w-6 text-[#D02E32]" fill="currentColor" />
                        <span className="text-xl font-serif font-bold text-[#D02E32]">
                          Finally {isAdmin && <span className="text-[#CBA415]">Admin</span>}
                        </span>
                      </div>
                    </div>

                    {/* User profile */}
                    <div className="py-4 border-b border-rose-100">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={user.image || undefined} />
                          <AvatarFallback className="bg-[#D02E32] text-white">
                            {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <p className="font-medium text-gray-900">{user.name || 'User'}</p>
                            {isAdmin && (
                              <div className="flex items-center space-x-1 px-2 py-0.5 bg-[#CBA415] text-white rounded-full text-xs font-medium">
                                <Shield className="h-3 w-3" />
                                <span>Admin</span>
                              </div>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{user.email}</p>
                        </div>
                      </div>
                    </div>

                    {/* Mobile navigation */}
                    <nav className="flex-1 py-4">
                      <div className="space-y-2">
                        {isAdmin && (
                          <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
                            Admin Panel
                          </p>
                        )}
                        
                        {navigationItems.map((item) => {
                          const IconComponent = item.icon
                          return (
                            <Link
                              key={item.id}
                              href={item.href}
                              onClick={() => setIsMobileMenuOpen(false)}
                              className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-left transition-colors ${
                                pathname === item.href || (pathname?.startsWith(item.href) && item.href !== '/')
                                  ? isAdmin 
                                    ? "bg-yellow-50 text-[#CBA415] border-l-4 border-[#CBA415]"
                                    : "bg-rose-50 text-[#D02E32] border-l-4 border-[#D02E32]"
                                  : "text-gray-600 hover:bg-gray-50"
                              }`}
                            >
                              <IconComponent className="h-5 w-5" />
                              <span className="font-medium">{item.label}</span>
                            </Link>
                          )
                        })}
                        
                        {/* Link to switch between admin and user view */}
                        {isAdmin && (
                          <div className="border-t border-gray-200 pt-4 mt-4">
                            <Link
                              href="/"
                              onClick={() => setIsMobileMenuOpen(false)}
                              className="w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-left transition-colors text-gray-600 hover:bg-rose-50 hover:text-[#D02E32]"
                            >
                              <Heart className="h-5 w-5" />
                              <span className="font-medium">View as user</span>
                            </Link>
                          </div>
                        )}
                      </div>
                    </nav>

                    {/* Mobile menu footer */}
                    <div className="border-t border-rose-100 pt-4">
                      <div className="space-y-2">
                        <Link href="/profile">
                          <Button variant="outline" className="w-full justify-start" size="sm">
                            <Settings className="h-4 w-4 mr-2" />
                            Settings
                          </Button>
                        </Link>
                        <SignOutButton />
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Tab Bar - ONLY for regular users */}
      {!isAdmin && (
        <div className="md:hidden bg-white border-t border-rose-100 fixed bottom-0 left-0 right-0 z-40">
          <div className="grid grid-cols-5 gap-1">
            {userNavigationItems.map((item) => {
              const IconComponent = item.icon
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`flex flex-col items-center py-2 px-1 transition-colors ${
                    pathname === item.href ? "text-[#D02E32]" : "text-gray-600"
                  }`}
                >
                  <IconComponent className="h-5 w-5 mb-1" />
                  <span className="text-xs font-medium truncate">{item.label}</span>
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </>
  )
} 