/* eslint-disable @typescript-eslint/no-explicit-any */
import NextAuth from "next-auth/next"
import CredentialsProvider from "next-auth/providers/credentials"
import { createClient } from '@supabase/supabase-js'

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
          // Configure Supabase client for authentication
          const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
          )

          console.log('🔐 [AUTH] Tentando autenticar via Supabase Auth:', credentials.email)

          // Usar Supabase Auth para autenticação
          const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password,
          })

          if (authError || !authData.user) {
            console.log('❌ [AUTH] Falha na autenticação Supabase:', authError?.message)
            return null
          }

          const user = authData.user
          console.log('✅ [AUTH] Autenticação Supabase bem-sucedida:', user.email)

          // Buscar dados adicionais do usuário na tabela public.users se existir
          const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
          )

          const { data: userData } = await supabaseAdmin
            .from('users')
            .select('role, name')
            .eq('id', user.id)
            .single()

          // Se não existir na tabela users, criar entrada básica
          if (!userData) {
            console.log('📝 [AUTH] Criando entrada na tabela users para:', user.email)
            
            // Determinar role baseado no email ou usar admin como padrão para este usuário específico
            const defaultRole = user.email === 'admin@finally.app' ? 'admin' : 'user'
            
            const { data: newUserData } = await supabaseAdmin
              .from('users')
              .insert({
                id: user.id,
                email: user.email,
                role: defaultRole,
                name: user.user_metadata?.name || user.email?.split('@')[0] || 'Usuário',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              })
              .select()
              .single()
            
            console.log('✅ [AUTH] Usuário criado com role:', defaultRole)
            
            // Usar os dados do usuário recém-criado
            return {
              id: user.id,
              email: user.email,
              name: user.user_metadata?.name || user.email?.split('@')[0] || 'Usuário',
              role: defaultRole
            } as any
          }

          // Fazer logout do Supabase para não interferir com NextAuth sessions
          await supabase.auth.signOut()

          console.log('✅ [AUTH] Login bem-sucedido:', user.email)

          // Retornar dados do usuário para a sessão NextAuth
          return {
            id: user.id,
            email: user.email,
            name: userData?.name || user.user_metadata?.name || user.email?.split('@')[0] || 'Usuário',
            role: userData?.role || 'user'
          } as any
        } catch (error: unknown) {
          console.error('❌ [AUTH] Erro na autenticação:', error)
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
    async jwt({ token, user, trigger }: any) {
      console.log('🔧 [JWT] Callback executado - trigger:', trigger, 'user:', !!user)
      
      if (user) {
        token.id = user.id
        token.role = user.role
        console.log('🔧 [JWT] Token criado com role do user:', user.role)
      }
      
      // SEMPRE buscar dados atualizados do usuário a cada verificação de token
      if (token.email) {
        try {
          const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
          )
          
          const { data: userData } = await supabaseAdmin
            .from('users')
            .select('role, name')
            .eq('email', token.email)
            .single()
          
          if (userData) {
            // Só atualizar se o role mudou
            if (token.role !== userData.role) {
              console.log('🔧 [JWT] Role atualizado:', token.role, '->', userData.role)
            }
            token.role = userData.role
            token.name = userData.name
          }
        } catch (error) {
          console.error('🔧 [JWT] Erro ao buscar role:', error)
        }
      }
      
      console.log('🔧 [JWT] Token final - role:', token.role)
      return token
    },
    async session({ session, token }: any) {
      if (token) {
        session.user = {
          ...session.user,
          id: token.id as string,
          role: token.role as string
        }
        console.log('🔧 [SESSION] Sessão criada com role:', token.role)
      }
      return session
    }
  },
  // Usar JWT ao invés de database sessions para simplificar
  useSecureCookies: process.env.NODE_ENV === 'production',
  secret: process.env.NEXTAUTH_SECRET,
})

export { handler as GET, handler as POST } 