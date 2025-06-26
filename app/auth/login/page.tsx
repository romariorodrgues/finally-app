"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Eye, EyeOff, Heart, Mail, Lock, ArrowRight, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { signIn} from "next-auth/react"

export default function LoginPage() {
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [emailNotVerified, setEmailNotVerified] = useState(false)
  const [showVerificationSuccess, setShowVerificationSuccess] = useState(false)

  // Check for verification success message
  useEffect(() => {
    const verified = searchParams.get('verified')
    if (verified === 'true') {
      setShowVerificationSuccess(true)
      // Hide message after 5 seconds
      setTimeout(() => setShowVerificationSuccess(false), 5000)
    }
  }, [searchParams])
  
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value
    setEmail(newEmail)
    if (error) setError('')
    if (emailNotVerified) setEmailNotVerified(false)
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value
    setPassword(newPassword)
    if (error) setError('')
    if (emailNotVerified) setEmailNotVerified(false)
  }

  const handlePasswordToggle = () => {
    setShowPassword(!showPassword)
  }

  const handleRememberMeChange = (checked: boolean) => {
    setRememberMe(checked)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setEmailNotVerified(false)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        if (result.error === 'EMAIL_NOT_VERIFIED') {
          setEmailNotVerified(true)
          setError("Your email has not been verified yet. Check your inbox.")
        } else {
          setError("Invalid email or password")
        }
      } else {
        // Redirect will be handled by middleware based on user role
        window.location.href = "/"
      }
    } catch (error: unknown) {
      if (error instanceof Error && error.message === 'EMAIL_NOT_VERIFIED') {
        setEmailNotVerified(true)
        setError("Your email has not been verified yet. Check your inbox.")
      } else {
        setError("Internal error. Please try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendVerification = async () => {
    if (!email) {
      setError("Enter your email first to resend verification")
      return
    }

    setIsLoading(true)
    try {
      // Here you could implement a resend verification API
      console.log('Resending verification to:', email)
      setError("Verification link resent! Check your inbox.")
      setEmailNotVerified(false)
    } catch {
      setError("Error resending verification. Contact support.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Verification Success Message */}
      {showVerificationSuccess && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <div className="flex-shrink-0">
              <Mail className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <h3 className="text-green-800 font-medium">Email verified successfully! 🎉</h3>
              <p className="text-green-600 text-sm mt-1">
                You can now log in normally.
              </p>
            </div>
          </div>
        </div>
      )}

      <Card className="border-rose-200 shadow-xl">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto mb-4 w-16 h-16 bg-[#D02E32] rounded-full flex items-center justify-center">
            <Heart className="w-8 h-8 text-white" fill="currentColor" />
          </div>
          <CardTitle className="text-3xl font-serif font-bold text-gray-900">Finally</CardTitle>
          <CardDescription className="text-gray-600 mt-2">
            Log in to continue your journey
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={handleEmailChange}
                  className="pl-10 h-12 border-rose-200 focus:border-[#D02E32] focus:ring-[#D02E32]"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Your password"
                  value={password}
                  onChange={handlePasswordChange}
                  className="pl-10 pr-10 h-12 border-rose-200 focus:border-[#D02E32] focus:ring-[#D02E32]"
                  required
                />
                <button
                  type="button"
                  onClick={handlePasswordToggle}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="remember" 
                checked={rememberMe}
                onCheckedChange={handleRememberMeChange}
              />
              <Label htmlFor="remember" className="text-sm text-gray-600">
                Remember me
              </Label>
            </div>

            {/* Error Messages */}
            {error && (
              <div className={`flex items-center space-x-2 p-3 rounded-lg ${
                emailNotVerified 
                  ? 'bg-orange-50 border border-orange-200' 
                  : error.includes('resent') 
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-red-50 border border-red-200'
              }`}>
                <AlertCircle className={`h-4 w-4 ${
                  emailNotVerified 
                    ? 'text-orange-500' 
                    : error.includes('resent')
                      ? 'text-green-500'
                      : 'text-red-500'
                }`} />
                <span className={`text-sm ${
                  emailNotVerified 
                    ? 'text-orange-700' 
                    : error.includes('resent')
                      ? 'text-green-700'
                      : 'text-red-700'
                }`}>
                  {error}
                </span>
              </div>
            )}

            {/* Email Not Verified Actions */}
            {emailNotVerified && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-blue-800 font-medium mb-2">📧 Email not verified</h4>
                <p className="text-blue-600 text-sm mb-3">
                  Check your inbox (including spam) for the verification email.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleResendVerification}
                  disabled={isLoading}
                  className="w-full border-blue-300 text-blue-700 hover:bg-blue-100"
                >
                  {isLoading ? 'Resending...' : 'Resend Verification Email'}
                </Button>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-[#CBA415] to-[#956F02] text-white hover:from-[#956F02] hover:to-[#CBA415] transition-all duration-300 font-medium"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Logging in...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              )}
            </Button>
          </form>

          {/* Footer Links */}
          <div className="mt-6 text-center space-y-2">
            <Link href="/auth/forgot-password" className="text-sm text-gray-600 hover:text-[#D02E32] transition-colors">
              Forgot your password?
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
