"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Mail, Send, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isEmailSent, setIsEmailSent] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setIsEmailSent(true)
      } else {
        setError(data.error || 'Erro ao enviar email de recuperação')
      }
    } catch (error) {
      console.error('Forgot password error:', error)
      setError('Erro interno. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isEmailSent) {
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
              <CardTitle className="text-2xl font-serif text-gray-900">Email sent!</CardTitle>
              <CardDescription className="text-gray-600 mt-2">
                We sent a recovery link to your email
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <p className="text-sm text-gray-600">
                Check your inbox and click the link to reset your password. The link expires in 1 hour.
              </p>

              <div className="p-4 bg-rose-50 rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong>Email sent to:</strong>
                  <br />
                  {email}
                </p>
              </div>

              <p className="text-xs text-gray-500">
                Didn&apos;t receive the email? Check your spam folder or{" "}
                <button
                  onClick={() => setIsEmailSent(false)}
                  className="text-[#D02E32] hover:text-[#AF2427] font-medium"
                >
                  try again
                </button>
                .
              </p>
            </div>

            <Button asChild className="w-full bg-[#D02E32] hover:bg-[#AF2427]">
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
            <CardTitle className="text-2xl font-serif text-gray-900">Forgot your password?</CardTitle>
            <CardDescription className="text-gray-600 mt-2">
              Don&apos;t worry! Enter your email and we&apos;ll send you a link to reset your password.
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
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 border-rose-200 focus:border-[#D02E32] focus:ring-[#D02E32]"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[#CBA415] to-[#956F02] text-white hover:from-[#956F02] hover:to-[#CBA415] transition-all duration-300 h-11"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Sending...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Send className="h-4 w-4" />
                  <span>Send recovery link</span>
                </div>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Remember your password?{" "}
              <Link href="/auth/login" className="text-[#D02E32] hover:text-[#AF2427] font-medium transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
