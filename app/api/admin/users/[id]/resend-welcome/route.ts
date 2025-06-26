import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { sendWelcomeEmail } from '@/lib/email/welcome-email-service'
import { randomBytes } from 'crypto'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params
    console.log('📧 [RESEND-WELCOME] Reenviando email de boas-vindas para usuário:', userId)

    // Verificar se o usuário existe
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select(`
        id,
        email,
        name,
        role,
        profiles (
          first_name,
          last_name
        )
      `)
      .eq('id', userId)
      .single()

    if (userError || !user) {
      console.error('❌ [RESEND-WELCOME] Usuário não encontrado:', userError)
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    console.log('✅ [RESEND-WELCOME] Usuário encontrado:', user.email, 'role:', user.role)

    // Gerar token de verificação
    const verificationToken = randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 horas

    // Estratégia para resolver o problema de conflito:
    // 1. Primeiro, marcar tokens antigos do mesmo tipo como "usados" para evitar conflito
    // 2. Depois inserir o novo token
    
    const now = new Date()
    
    // Invalidar tokens antigos não utilizados do mesmo tipo para este usuário
    const { error: invalidateError } = await supabaseAdmin
      .from('user_verification_tokens')
      .update({
        used_at: now.toISOString(),
        updated_at: now.toISOString()
      })
      .eq('user_id', userId)
      .eq('type', 'email_verification')
      .is('used_at', null)

    if (invalidateError) {
      console.error('❌ [RESEND-WELCOME] Erro ao invalidar tokens antigos:', invalidateError)
      return NextResponse.json(
        { error: 'Erro interno ao processar tokens de verificação' },
        { status: 500 }
      )
    }

    console.log('✅ [RESEND-WELCOME] Tokens antigos invalidados')

    // Agora inserir o novo token sem conflito
    const { error: tokenError } = await supabaseAdmin
      .from('user_verification_tokens')
      .insert({
        user_id: userId,
        token: verificationToken,
        type: 'email_verification',
        expires_at: expiresAt.toISOString(),
        created_at: now.toISOString(),
        updated_at: now.toISOString()
      })

    if (tokenError) {
      console.error('❌ [RESEND-WELCOME] Erro ao salvar token:', tokenError)
      return NextResponse.json(
        { error: 'Erro interno ao gerar token de verificação' },
        { status: 500 }
      )
    }

    console.log('✅ [RESEND-WELCOME] Token de verificação criado')

    // Preparar dados para o email - prioritizar nome da tabela users
    const profile = Array.isArray(user.profiles) ? user.profiles[0] : user.profiles
    const userName = user.name || 
      (profile?.first_name 
        ? `${profile.first_name} ${profile.last_name || ''}`.trim()
        : user.email.split('@')[0])

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const verificationUrl = `${baseUrl}/auth/verify?token=${verificationToken}`

    // Enviar email de boas-vindas com verificação usando o role correto
    const emailResult = await sendWelcomeEmail({
      email: user.email,
      name: userName,
      role: user.role as 'user' | 'therapist' | 'admin',
      verificationUrl,
      isResend: true
    })

    if (!emailResult.success) {
      console.error('❌ [RESEND-WELCOME] Falha ao enviar email:', emailResult.error)
      return NextResponse.json(
        { error: 'Erro ao enviar email de boas-vindas' },
        { status: 500 }
      )
    }

    console.log('✅ [RESEND-WELCOME] Email reenviado com sucesso')

    // Log da ação do admin
    try {
      await supabaseAdmin
        .from('admin_actions')
        .insert({
          admin_id: userId, // Aqui deveria ser o ID do admin logado
          action_type: 'resend_welcome_email',
          target_user_id: userId,
          details: {
            email: user.email,
            role: user.role,
            verification_token_id: verificationToken
          },
          created_at: new Date().toISOString()
        })
    } catch (logError) {
      console.error('⚠️ [RESEND-WELCOME] Erro ao registrar log (não crítico):', logError)
    }

    return NextResponse.json({
      success: true,
      message: `Email de ${user.role === 'therapist' ? 'verificação (therapist)' : 'boas-vindas'} reenviado com sucesso`,
      data: {
        email: user.email,
        userName,
        role: user.role,
        verificationTokenGenerated: true
      }
    })

  } catch (error) {
    console.error('💥 [RESEND-WELCOME] Erro interno:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 