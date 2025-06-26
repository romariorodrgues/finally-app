import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    console.log('👥 [CREATE-TEST-USERS] Iniciando criação de usuários de teste...')
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      return NextResponse.json({
        success: false,
        error: 'Variáveis de ambiente não configuradas'
      }, { status: 500 })
    }
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
    
    // Criar usuários usando SQL direto para bypass auth problems
    console.log('📝 [CREATE-TEST-USERS] Executando SQL para criar usuários...')
    
    const createUsersSQL = `
      -- Primeiro, criar registros na tabela auth.users (usando service role)
      INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        invited_at,
        confirmation_token,
        confirmation_sent_at,
        recovery_token,
        recovery_sent_at,
        email_change_token_new,
        email_change,
        email_change_sent_at,
        last_sign_in_at,
        raw_app_meta_data,
        raw_user_meta_data,
        is_super_admin,
        created_at,
        updated_at,
        phone,
        phone_confirmed_at,
        phone_change,
        phone_change_token,
        phone_change_sent_at,
        email_change_token_current,
        email_change_confirm_status,
        banned_until,
        reauthentication_token,
        reauthentication_sent_at,
        is_sso_user,
        deleted_at
      ) VALUES 
      (
        '00000000-0000-0000-0000-000000000000',
        'b1111111-1111-1111-1111-111111111111',
        'authenticated',
        'authenticated',
        'admin@finally.app',
        crypt('Admin123456!!14!', gen_salt('bf')),
        NOW(),
        NOW(),
        '',
        NOW(),
        '',
        NULL,
        '',
        '',
        NULL,
        NOW(),
        '{"provider":"email","providers":["email"]}',
        '{}',
        false,
        NOW(),
        NOW(),
        NULL,
        NULL,
        '',
        '',
        NULL,
        '',
        0,
        NULL,
        '',
        NULL,
        false,
        NULL
      ),
      (
        '00000000-0000-0000-0000-000000000000',
        'c2222222-2222-2222-2222-222222222222',
        'authenticated',
        'authenticated',
        'therapist@finally.app',
        crypt('Therapist123!', gen_salt('bf')),
        NOW(),
        NOW(),
        '',
        NOW(),
        '',
        NULL,
        '',
        '',
        NULL,
        NOW(),
        '{"provider":"email","providers":["email"]}',
        '{}',
        false,
        NOW(),
        NOW(),
        NULL,
        NULL,
        '',
        '',
        NULL,
        '',
        0,
        NULL,
        '',
        NULL,
        false,
        NULL
      ),
      (
        '00000000-0000-0000-0000-000000000000',
        'd3333333-3333-3333-3333-333333333333',
        'authenticated',
        'authenticated',
        'user@finally.app',
        crypt('User123!', gen_salt('bf')),
        NOW(),
        NOW(),
        '',
        NOW(),
        '',
        NULL,
        '',
        '',
        NULL,
        NOW(),
        '{"provider":"email","providers":["email"]}',
        '{}',
        false,
        NOW(),
        NOW(),
        NULL,
        NULL,
        '',
        '',
        NULL,
        '',
        0,
        NULL,
        '',
        NULL,
        false,
        NULL
      )
      ON CONFLICT (id) DO NOTHING;
      
      -- Depois, criar registros correspondentes na tabela public.users
      INSERT INTO public.users (id, email, role, created_at, updated_at) VALUES 
      ('b1111111-1111-1111-1111-111111111111', 'admin@finally.app', 'admin', NOW(), NOW()),
      ('c2222222-2222-2222-2222-222222222222', 'therapist@finally.app', 'therapist', NOW(), NOW()),
      ('d3333333-3333-3333-3333-333333333333', 'user@finally.app', 'user', NOW(), NOW())
      ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        role = EXCLUDED.role,
        updated_at = NOW();
    `
    
    // Executar SQL usando RPC ou função
    const { data: sqlResult, error: sqlError } = await supabaseAdmin.rpc('exec_sql', {
      sql_query: createUsersSQL
    })
    
    if (sqlError) {
      console.error('❌ [CREATE-TEST-USERS] Erro ao executar SQL:', sqlError)
      
      // Fallback: tentar criar apenas na tabela public.users
      console.log('🔄 [CREATE-TEST-USERS] Tentando fallback - criar apenas em public.users...')
      
      const users = [
        { id: 'b1111111-1111-1111-1111-111111111111', email: 'admin@finally.app', role: 'admin' },
        { id: 'c2222222-2222-2222-2222-222222222222', email: 'therapist@finally.app', role: 'therapist' },
        { id: 'd3333333-3333-3333-3333-333333333333', email: 'user@finally.app', role: 'user' }
      ]
      
      const results = []
      for (const user of users) {
        const { error } = await supabaseAdmin
          .from('users')
          .upsert(user)
          .select()
        
        results.push({ user: user.email, success: !error, error: error?.message })
        console.log(`👤 [CREATE-TEST-USERS] ${user.email}:`, { success: !error, error })
      }
      
      return NextResponse.json({
        success: true,
        method: 'fallback',
        message: 'Usuários criados apenas na tabela public.users (auth schema inacessível)',
        results,
        sqlError: sqlError.message
      })
    }
    
    console.log('✅ [CREATE-TEST-USERS] SQL executado com sucesso:', sqlResult)
    
    // Verificar usuários criados
    const { data: createdUsers, error: checkError } = await supabaseAdmin
      .from('users')
      .select('id, email, role')
      .in('email', ['admin@finally.app', 'therapist@finally.app', 'user@finally.app'])
    
    return NextResponse.json({
      success: true,
      method: 'sql',
      message: 'Usuários de teste criados com sucesso',
      users: createdUsers,
      checkError: checkError?.message
    })
    
  } catch (error) {
    console.error('❌ [CREATE-TEST-USERS] Erro:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
} 