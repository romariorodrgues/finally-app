import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('🔍 [TEST-SUPABASE] Testando conexão com Supabase...')
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      return NextResponse.json({
        success: false,
        error: 'Variáveis de ambiente não configuradas',
        env: {
          url: !!supabaseUrl,
          key: !!supabaseServiceRoleKey
        }
      }, { status: 500 })
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
    
    // Testar conexão listando tabelas
    const { data, error } = await supabase
      .from('users')
      .select('count', { count: 'exact', head: true })
    
    console.log('📊 [TEST-SUPABASE] Resultado:', { data, error })
    
    return NextResponse.json({
      success: !error,
      message: error ? 'Erro na conexão' : 'Conexão OK',
      error: error?.message,
      userCount: data,
      config: {
        url: supabaseUrl,
        hasServiceRole: !!supabaseServiceRoleKey
      }
    })
    
  } catch (error) {
    console.error('❌ [TEST-SUPABASE] Erro:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}

export async function POST() {
  return GET() // Para facilitar teste via POST também
}
