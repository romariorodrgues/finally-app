/* eslint-disable @typescript-eslint/no-explicit-any */
import NextAuth from "next-auth/next"
import CredentialsProvider from "next-auth/providers/credentials"
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

// Force Node.js runtime to avoid Edge Runtime issues with NextAuth
export const runtime = 'nodejs'

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          // Configure Supabase client
          const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
          )

          console.log('🔐 [AUTH] Tentando autenticar:', credentials.email)

          // Buscar usuário na tabela users principal
          const { data: user, error } = await supabase
            .from('users')
            .select('id, email, password, name, role, email_verified')
            .eq('email', credentials.email)
            .single()

          if (error || !user) {
            console.log('❌ [AUTH] Usuário não encontrado:', credentials.email)
            return null
          }

          // Verificar se email foi verificado
          if (!user.email_verified) {
            console.log('❌ [AUTH] Email não verificado:', credentials.email)
            throw new Error('EMAIL_NOT_VERIFIED')
          }

          // Verificar senha
          if (!user.password) {
            console.log('❌ [AUTH] Usuário sem senha:', credentials.email)
            return null
          }

          const isValidPassword = await bcrypt.compare(credentials.password, user.password)
          
          if (!isValidPassword) {
            console.log('❌ [AUTH] Senha inválida para:', credentials.email)
            return null
          }

          console.log('✅ [AUTH] Login bem-sucedido:', credentials.email)

          // Retornar dados do usuário para a sessão
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
          } as any
        } catch (error: unknown) {
          console.error('❌ [AUTH] Erro na autenticação:', error)
          if (error instanceof Error && error.message === 'EMAIL_NOT_VERIFIED') {
            throw error
          }
          return null
        }
      }
    })
  ],
  pages: {
    signIn: '/auth/login',
    error: '/auth/login'
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    async session({ session, token }: any) {
      if (token) {
        session.user = {
          ...session.user,
          id: token.id as string,
          role: token.role as string
        }
      }
      return session
    }
  },
  // Usar JWT ao invés de database sessions para simplificar
  useSecureCookies: process.env.NODE_ENV === 'production',
  secret: process.env.NEXTAUTH_SECRET,
})

export { handler as GET, handler as POST } 