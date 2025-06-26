"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Lock, Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function ResetPasswordPage() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isValidatingToken, setIsValidatingToken] = useState(true)
  const [tokenValid, setTokenValid] = useState(false)
  const [tokenError, setTokenError] = useState("")
  const [resetSuccess, setResetSuccess] = useState(false)
  const [error, setError] = useState("")

  // Validate token on component mount
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setTokenError("Recovery token not found")
        setIsValidatingToken(false)
        return
      }

      try {
        const response = await fetch(`/api/auth/reset-password?token=${token}`)
        const data = await response.json()

        if (data.valid) {
          setTokenValid(true)
        } else {
          setTokenError(data.error || "Invalid token")
        }
      } catch (error) {
        console.error('Token validation error:', error)
        setTokenError("Error validating token")
      } finally {
        setIsValidatingToken(false)
      }
    }

    validateToken()
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords don't match")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          newPassword,
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setResetSuccess(true)
      } else {
        setError(data.error || 'Error resetting password')
      }
    } catch (error) {
      console.error('Reset password error:', error)
      setError('Internal error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Loading state while validating token
  if (isValidatingToken) {
    return (
      <div className="w-full max-w-md mx-auto">
        <Card className="border-rose-200 shadow-xl">
          <CardContent className="p-8">
            <div className="text-center space-y-4">
              <div className="w-8 h-8 border-2 border-[#CBA415] border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-gray-600">Validating recovery token...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Invalid token state
  if (!tokenValid) {
    return (
      <div className="w-full max-w-md mx-auto">
        <Card className="border-rose-200 shadow-xl">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
            </div>
            <div>
              <CardTitle className="text-2xl font-serif text-gray-900">Invalid Token</CardTitle>
              <CardDescription className="text-gray-600 mt-2">
                {tokenError}
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <p className="text-sm text-gray-600">
                The recovery link may have expired or already been used.
              </p>
              
              <Button asChild className="w-full bg-[#CBA415] hover:bg-[#956F02]">
                <Link href="/auth/forgot-password">
                  Request new link
                </Link>
              </Button>
            </div>

            <Button asChild variant="outline" className="w-full">
              <Link href="/auth/login">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to login
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Success state
  if (resetSuccess) {
    return (
      <div className="w-full max-w-md mx-auto">
        <Card className="border-rose-200 shadow-xl">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <div>
              <CardTitle className="text-2xl font-serif text-gray-900">Password Reset!</CardTitle>
              <CardDescription className="text-gray-600 mt-2">
                Your password has been successfully updated
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <p className="text-sm text-gray-600">
                You can now login with your new password.
              </p>
            </div>

            <Button asChild className="w-full bg-[#D02E32] hover:bg-[#AF2427]">
              <Link href="/auth/login">
                Sign in
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Reset password form
  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="border-rose-200 shadow-xl">
        <CardHeader className="space-y-4">
          <Button variant="ghost" asChild className="w-fit p-0 h-auto text-gray-600 hover:text-[#D02E32]">
            <Link href="/auth/login">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to login
            </Link>
          </Button>

          <div className="text-center">
            <CardTitle className="text-2xl font-serif text-gray-900">New Password</CardTitle>
            <CardDescription className="text-gray-600 mt-2">
              Enter your new password to complete the recovery.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-sm font-medium text-gray-700">
                New Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pl-10 pr-10 border-rose-200 focus:border-[#D02E32] focus:ring-[#D02E32]"
                  autoComplete="new-password"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                Confirm New Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10 pr-10 border-rose-200 focus:border-[#D02E32] focus:ring-[#D02E32]"
                  autoComplete="new-password"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {newPassword && (
              <div className="text-xs text-gray-600 space-y-1">
                <p className={newPassword.length >= 6 ? "text-green-600" : "text-red-600"}>
                  • At least 6 characters
                </p>
                {confirmPassword && (
                  <p className={newPassword === confirmPassword ? "text-green-600" : "text-red-600"}>
                    • Passwords {newPassword === confirmPassword ? "match" : "don't match"}
                  </p>
                )}
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading || newPassword.length < 6 || newPassword !== confirmPassword}
              className="w-full bg-gradient-to-r from-[#CBA415] to-[#956F02] text-white hover:from-[#956F02] hover:to-[#CBA415] transition-all duration-300 h-11"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Resetting...</span>
                </div>
              ) : (
                <span>Reset password</span>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 