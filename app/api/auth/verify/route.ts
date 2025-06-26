import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()
    console.log('🔐 [VERIFY] Processando verificação de token')

    if (!token) {
      return NextResponse.json(
        { error: 'Token é obrigatório' },
        { status: 400 }
      )
    }

    // Buscar o token na base de dados
    const { data: tokenData, error: tokenError } = await supabaseAdmin
      .from('user_verification_tokens')
      .select(`
        id,
        user_id,
        type,
        expires_at,
        used_at,
        users (
          id,
          email,
          role,
          email_verified
        )
      `)
      .eq('token', token)
      .eq('type', 'email_verification')
      .single()

    if (tokenError || !tokenData) {
      console.error('❌ [VERIFY] Token não encontrado:', tokenError)
      return NextResponse.json(
        { error: 'Token inválido ou não encontrado' },
        { status: 404 }
      )
    }

    console.log('✅ [VERIFY] Token encontrado para usuário:', tokenData.user_id)

    // Verificar se o token já foi usado
    if (tokenData.used_at) {
      console.warn('⚠️ [VERIFY] Token já foi usado')
      return NextResponse.json(
        { error: 'Este link de verificação já foi usado' },
        { status: 400 }
      )
    }

    // Verificar se o token expirou
    const now = new Date()
    const expiresAt = new Date(tokenData.expires_at)
    
    if (now > expiresAt) {
      console.warn('⚠️ [VERIFY] Token expirado')
      return NextResponse.json(
        { error: 'Token expired' },
        { status: 400 }
      )
    }

    // Marcar o token como usado
    const { error: updateTokenError } = await supabaseAdmin
      .from('user_verification_tokens')
      .update({
        used_at: now.toISOString(),
        updated_at: now.toISOString()
      })
      .eq('id', tokenData.id)

    if (updateTokenError) {
      console.error('❌ [VERIFY] Erro ao marcar token como usado:', updateTokenError)
      return NextResponse.json(
        { error: 'Erro interno ao processar verificação' },
        { status: 500 }
      )
    }

    // Marcar o email como verificado na tabela users principal
    const { error: verifyUserError } = await supabaseAdmin
      .from('users')
      .update({
        email_verified: true,
        updated_at: now.toISOString()
      })
      .eq('id', tokenData.user_id)

    if (verifyUserError) {
      console.error('❌ [VERIFY] Erro ao marcar email como verificado:', verifyUserError)
      return NextResponse.json(
        { error: 'Erro ao verificar email do usuário' },
        { status: 500 }
      )
    }

    console.log('✅ [VERIFY] Email verificado com sucesso na tabela users')

    // Log da verificação bem-sucedida
    try {
      await supabaseAdmin
        .from('admin_actions')
        .insert({
          admin_id: tokenData.user_id, // O próprio usuário
          action_type: 'email_verified',
          target_user_id: tokenData.user_id,
          details: {
            token_id: tokenData.id,
            verified_at: now.toISOString()
          },
          created_at: now.toISOString()
        })
    } catch (logError) {
      console.error('⚠️ [VERIFY] Erro ao registrar log (não crítico):', logError)
    }

    const user = Array.isArray(tokenData.users) ? tokenData.users[0] : tokenData.users

    return NextResponse.json({
      success: true,
      message: 'Email verificado com sucesso',
      data: {
        userId: tokenData.user_id,
        email: user?.email,
        verifiedAt: now.toISOString()
      }
    })

  } catch (error) {
    console.error('💥 [VERIFY] Erro interno:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 