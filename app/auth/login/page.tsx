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
import { signIn } from "next-auth/react"
import Image from "next/image"
import loginImage from "@/public/assets/login-side.jpg"
import logoImage from "@/public/assets/logo-768x319.webp"
import iconapple from "@/public/assets/icon-apple.png"
import iconegoogle from "@/public/assets/icone-google.png"
import iconface from "@/public/assets/icon-face.png"





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

  useEffect(() => {
    const verified = searchParams.get("verified")
    if (verified === "true") {
      setShowVerificationSuccess(true)
      setTimeout(() => setShowVerificationSuccess(false), 5000)
    }
  }, [searchParams])

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
    if (error) setError("")
    if (emailNotVerified) setEmailNotVerified(false)
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value)
    if (error) setError("")
    if (emailNotVerified) setEmailNotVerified(false)
  }

  const handlePasswordToggle = () => setShowPassword(!showPassword)
  const handleRememberMeChange = (checked: boolean) => setRememberMe(checked)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setEmailNotVerified(false)

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        if (result.error === "EMAIL_NOT_VERIFIED") {
          setEmailNotVerified(true)
          setError("Your email has not been verified yet. Check your inbox.")
        } else {
          setError("Invalid email or password")
        }
      } else {
        window.location.href = "/"
      }
    } catch {
      setError("Internal error. Please try again.")
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
      console.log("Resending verification to:", email)
      setError("Verification link resent! Check your inbox.")
      setEmailNotVerified(false)
    } catch {
      setError("Error resending verification. Contact support.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 rounded-3xl overflow-hidden ">
      {/* --- LADO ESQUERDO (imagem + overlay ) --- */}
      <div className="hidden lg:flex items-center justify-center relative">
        <Image
          src={loginImage}
          alt="Login illustration"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* --- LADO DIREITO (formulário) --- */}
      <div className="flex items-center justify-center bg-white relative">
        <div className="w-full max-w-4xl space-y-8">
          {showVerificationSuccess && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-2">
              <Mail className="h-5 w-5 text-green-500" />
              <div>
                <h3 className="text-green-800 font-medium">Email verified successfully! 🎉</h3>
                <p className="text-green-600 text-sm">You can now log in normally.</p>
              </div>
            </div>
          )}

          <Card className="border-none p-4">
            <CardHeader className="text-center pb-4">
              <Image
                src={logoImage}
                alt="Login illustration"
                // className="object-cover"
                priority
                width={180}
                height={60}
                className="w-auto max-w-[70%] h-auto mx-auto md:max-w-[200px]"
              />
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* EMAIL */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={handleEmailChange}
                      className="pl-10 h-12 rounded-lg border border-gray-200 focus:border-[#D02E32] focus:ring-[#D02E32]"
                      required
                    />
                  </div>
                </div>

                {/* PASSWORD */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-700">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Your password"
                      value={password}
                      onChange={handlePasswordChange}
                      className="pl-10 pr-10 h-12 rounded-lg border border-gray-200 focus:border-[#D02E32] focus:ring-[#D02E32]"
                      required
                    />
                    <button
                      type="button"
                      onClick={handlePasswordToggle}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="mt-4 text-right space-y-2">
                  <Link href="/auth/forgot-password" className="text-sm text-gray-600 hover:text-[#D02E32] transition-colors">
                    Forgot your password?
                  </Link>
                </div>

                {/* ERROS */}
                {error && (
                  <div
                    className={`flex items-center space-x-2 p-3 rounded-lg ${emailNotVerified
                      ? "bg-orange-50 border border-orange-200"
                      : error.includes("resent")
                        ? "bg-green-50 border border-green-200"
                        : "bg-red-50 border border-red-200"
                      }`}
                  >
                    <AlertCircle
                      className={`h-4 w-4 ${emailNotVerified
                        ? "text-orange-500"
                        : error.includes("resent")
                          ? "text-green-500"
                          : "text-red-500"
                        }`}
                    />
                    <span
                      className={`text-sm ${emailNotVerified
                        ? "text-orange-700"
                        : error.includes("resent")
                          ? "text-green-700"
                          : "text-red-700"
                        }`}
                    >
                      {error}
                    </span>
                  </div>
                )}

                {/* EMAIL NOT VERIFIED */}
                {emailNotVerified && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="text-blue-800 font-medium ">📧 Email not verified</h4>
                    <p className="text-blue-600 text-sm ">
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
                      {isLoading ? "Resending..." : "Resend Verification Email"}
                    </Button>
                  </div>
                )}

                {/* BOTÃO LOGIN */}
                <Button
                  type="submit"
                  className="w-full h-12 bg-[#E5586B] text-white hover:bg-[#CC4B5E] transition-all duration-300 font-medium rounded-lg shadow-md"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Logging in...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <span>Log in</span>
                    </div>
                  )}
                </Button>
              </form>
              {/* Divisor com 'or' centralizado */}
              <div className="flex items-center w-full my-6">
                <div className="flex-grow border-t border-[#EAEAEA]"></div>
                <span className="px-3 text-gray-500 text-sm">or</span>
                <div className="flex-grow border-t border-[#EAEAEA]"></div>
              </div>

              {/* BOTÕES SOCIAIS */}
              <div className="mt-4 space-y-3">

                {/* APPLE */}
                <Button
                  type="button"
                  className="w-full h-12 flex items-center justify-center gap-3 bg-black text-white hover:bg-neutral-800 transition-all duration-300 font-medium"
                >
                  <Image
                    src={iconapple}
                    alt="Login illustration"
                    className="object-cover"
                    priority
                    width={20}
                    height={20}
                  />
                  Log in with Apple
                </Button>

                {/* GOOGLE */}
                <Button
                  type="button"
                  className="w-full h-12 flex items-center justify-center gap-3 bg-white text-black border border-[#EAEAEA] hover:bg-gray-100 transition-all duration-300 font-medium"
                >
                  <Image
                    src={iconegoogle}
                    alt="Login illustration"
                    className="object-cover"
                    priority
                    width={20}
                    height={20}
                  />
                  Log in with Google
                </Button>

                {/* FACEBOOK */}
                <Button
                  type="button"
                  className="w-full h-12 flex items-center justify-center gap-3 bg-[#1877F2] text-white hover:bg-[#145DB2] transition-all duration-300 font-medium"
                >
                  <Image
                    src={iconface}
                    alt="Login illustration"
                    className="object-cover"
                    priority
                    width={20}
                    height={20}
                  />
                  Log in with Facebook
                </Button>

              </div>

            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
