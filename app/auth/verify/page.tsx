"use client"

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'expired'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const token = searchParams.get('token')
    
    if (!token) {
      setStatus('error')
      setMessage('Token de verificação não encontrado.')
      return
    }

    const verifyEmail = async (token: string) => {
      try {
        console.log('🔐 [VERIFY] Verificando token:', token)

        const response = await fetch('/api/auth/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token })
        })

        const result = await response.json()

        if (response.ok && result.success) {
          setStatus('success')
          setMessage('Email verificado com sucesso! Sua conta está agora ativa.')
          
          // Redirecionar para login após 3 segundos
          setTimeout(() => {
            router.push('/auth/login?verified=true')
          }, 3000)
        } else {
          if (result.error === 'Token expired') {
            setStatus('expired')
            setMessage('O link de verificação expirou. Solicite um novo link de verificação.')
          } else {
            setStatus('error')
            setMessage(result.error || 'Erro ao verificar email.')
          }
        }
      } catch (error) {
        console.error('❌ [VERIFY] Erro ao verificar email:', error)
        setStatus('error')
        setMessage('Erro interno. Tente novamente.')
      }
    }

    verifyEmail(token)
  }, [searchParams, router])

  const getIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader2 className="h-16 w-16 text-blue-500 animate-spin" />
      case 'success':
        return <CheckCircle className="h-16 w-16 text-green-500" />
      case 'expired':
        return <Clock className="h-16 w-16 text-orange-500" />
      case 'error':
        return <XCircle className="h-16 w-16 text-red-500" />
    }
  }

  const getTitle = () => {
    switch (status) {
      case 'loading':
        return 'Verifying your email...'
      case 'success':
        return 'Email verified successfully!'
      case 'expired':
        return 'Link expired'
      case 'error':
        return 'Verification error'
    }
  }

  const getColor = () => {
    switch (status) {
      case 'loading':
        return 'text-blue-600'
      case 'success':
        return 'text-green-600'
      case 'expired':
        return 'text-orange-600'
      case 'error':
        return 'text-red-600'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-yellow-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto mb-4">
              {getIcon()}
            </div>
            <CardTitle className={`text-2xl font-bold ${getColor()}`}>
              {getTitle()}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="text-center space-y-6">
            <p className="text-gray-600 leading-relaxed">
              {message}
            </p>

            {status === 'success' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-700 font-medium mb-2">
                  🎉 Welcome to Finally Match!
                </p>
                <p className="text-green-600 text-sm">
                  You will be redirected to login in a few seconds...
                </p>
              </div>
            )}

            {status === 'expired' && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <p className="text-orange-700 font-medium mb-2">
                  ⏰ Link expired
                </p>
                <p className="text-orange-600 text-sm">
                  Contact support to request a new verification link.
                </p>
              </div>
            )}

            <div className="flex flex-col space-y-3">
              {status === 'success' && (
                <Link href="/auth/login?verified=true">
                  <Button className="w-full bg-[#D02E32] hover:bg-[#AF2427]">
                    Login Now
                  </Button>
                </Link>
              )}
              
              {(status === 'error' || status === 'expired') && (
                <Link href="/auth/login">
                  <Button className="w-full bg-[#D02E32] hover:bg-[#AF2427]">
                    Back to Login
                  </Button>
                </Link>
              )}

              <Link href="/">
                <Button variant="outline" className="w-full">
                  Home Page
                </Button>
              </Link>
            </div>

            {(status === 'error' || status === 'expired') && (
              <div className="text-center pt-4 border-t">
                <p className="text-sm text-gray-500 mb-2">Need help?</p>
                <a 
                  href="mailto:suporte@finallymatch.com" 
                  className="text-[#D02E32] hover:underline text-sm font-medium"
                >
                  Contact support
                </a>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 