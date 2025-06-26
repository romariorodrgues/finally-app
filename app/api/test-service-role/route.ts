import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('🧪 [TEST-SERVICE-ROLE] Iniciando teste do service role key...')
    
    // Verificar variáveis de ambiente
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    console.log('🌐 [TEST-SERVICE-ROLE] Variáveis de ambiente:', {
      url: !!supabaseUrl,
      serviceRoleKey: !!supabaseServiceRoleKey,
      anonKey: !!supabaseAnonKey,
      urlValue: supabaseUrl
    })
    
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      return NextResponse.json({
        success: false,
        error: 'Variáveis de ambiente não configuradas',
        details: {
          hasUrl: !!supabaseUrl,
          hasServiceRoleKey: !!supabaseServiceRoleKey
        }
      }, { status: 500 })
    }
    
    // Testar cliente service role
    console.log('🔑 [TEST-SERVICE-ROLE] Criando cliente service role...')
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
    
    // Testar consulta simples com service role - usando sintaxe correta
    console.log('📊 [TEST-SERVICE-ROLE] Testando consulta com service role...')
    const { data: adminTest, error: adminError, count: adminCount } = await supabaseAdmin
      .from('users')
      .select('id', { count: 'exact' })
      .limit(1)
    
    console.log('📊 [TEST-SERVICE-ROLE] Resultado consulta admin:', { adminTest, adminError, adminCount })
    
    // Teste de autenticação específico - tentar listar usuários
    let authTest = null
    let authError = null
    try {
      console.log('🔐 [TEST-SERVICE-ROLE] Testando Auth API...')
      
      // Teste 1: Verificar se consegue acessar auth.users diretamente
      const { data: authUsers, error: authUsersError } = await supabaseAdmin
        .from('auth.users')
        .select('id, email')
        .limit(1)
      
      console.log('👥 [TEST-SERVICE-ROLE] Resultado auth.users:', { authUsers, authUsersError })
      
      // Teste 2: Admin listUsers
      const { data: adminUsers, error: adminUsersError } = await supabaseAdmin.auth.admin.listUsers()
      console.log('👑 [TEST-SERVICE-ROLE] Resultado admin.listUsers:', { 
        count: adminUsers?.users?.length, 
        adminUsersError 
      })
      
      authTest = {
        directQuery: { success: !authUsersError, error: authUsersError?.message },
        adminAPI: { success: !adminUsersError, count: adminUsers?.users?.length || 0, error: adminUsersError?.message }
      }
      
    } catch (e) {
      console.log('🔐 [TEST-SERVICE-ROLE] Erro auth:', e)
      authError = e instanceof Error ? e.message : 'Erro desconhecido'
    }
    
    // Teste de autenticação com credenciais específicas
    let loginTest = null
    let loginError = null
    try {
      console.log('🔓 [TEST-SERVICE-ROLE] Testando login com admin...')
      const { data: loginData, error: loginErr } = await supabaseAdmin.auth.signInWithPassword({
        email: 'admin@finally.app',
        password: 'Admin123456!!14!'
      })
      
      loginTest = {
        success: !loginErr,
        hasUser: !!loginData?.user,
        hasSession: !!loginData?.session
      }
      loginError = loginErr
      
      console.log('🔓 [TEST-SERVICE-ROLE] Resultado login:', { loginTest, loginErr })
      
      // Se login funcionou, fazer logout
      if (loginData?.session) {
        await supabaseAdmin.auth.signOut()
      }
      
    } catch (e) {
      console.log('🔓 [TEST-SERVICE-ROLE] Erro login:', e)
      loginError = e instanceof Error ? e.message : 'Erro desconhecido'
    }
    
    // Testar cliente regular (anon key)
    console.log('🔐 [TEST-SERVICE-ROLE] Testando cliente regular...')
    const cookieStore = await cookies()
    const supabaseRegular = createServerClient(
      supabaseUrl,
      supabaseAnonKey!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
    )
    
    const { data: regularTest, error: regularError, count: regularCount } = await supabaseRegular
      .from('profiles')
      .select('id', { count: 'exact' })
      .limit(1)
    
    console.log('📊 [TEST-SERVICE-ROLE] Resultado consulta regular:', { regularTest, regularError, regularCount })
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      tests: {
        admin: {
          success: !adminError,
          data: adminTest,
          count: adminCount,
          error: adminError?.message
        },
        regular: {
          success: !regularError,
          data: regularTest,
          count: regularCount,
          error: regularError?.message
        },
        auth: {
          success: !authError,
          data: authTest,
          error: authError
        },
        login: {
          success: !loginError,
          data: loginTest,
          error: loginError instanceof Error ? loginError.message : (typeof loginError === 'string' ? loginError : String(loginError))
        }
      }
    })
    
  } catch (error) {
    console.error('❌ [TEST-SERVICE-ROLE] Erro no teste:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
} 