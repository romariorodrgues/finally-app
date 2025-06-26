import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import bcrypt from 'bcryptjs'
import { randomBytes } from 'crypto'
import { sendWelcomeEmail } from '@/lib/email/welcome-email-service'

export async function POST(request: NextRequest) {
  try {
    console.log('📝 [ADMIN-CREATE-USER] Iniciando criação de usuário')

    // Get request data
    const { email, password, name, role = 'user' } = await request.json()

    console.log('🔧 [ADMIN-CREATE-USER] Dados recebidos:', {
      email,
      name,
      role,
      hasPassword: !!password
    })

    // Validate required fields
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, senha e nome são obrigatórios' },
        { status: 400 }
      )
    }

    // Validate role
    if (!['user', 'therapist', 'admin'].includes(role)) {
      return NextResponse.json(
        { error: 'Role inválido. Use: user, therapist ou admin' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Check if user already exists
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id, email')
      .eq('email', email)
      .single()

    if (existingUser) {
      return NextResponse.json(
        { error: 'Usuário já existe com este email' },
        { status: 400 }
      )
    }

    // Create user in users table
    const { data: newUser, error: userError } = await supabaseAdmin
      .from('users')
      .insert({
        email,
        password: hashedPassword,
        name,
        role,
        email_verified: false // Sempre criar não verificado
      })
      .select('id, email, name, role')
      .single()

    if (userError) {
      console.error('❌ [ADMIN-CREATE-USER] Erro ao criar usuário:', userError)
      return NextResponse.json(
        { error: 'Erro ao criar usuário na base de dados' },
        { status: 500 }
      )
    }

    console.log('✅ [ADMIN-CREATE-USER] Usuário criado:', newUser.id)

    // Gerar token de verificação
    const verificationToken = randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 horas

    console.log('🔑 [ADMIN-CREATE-USER] Gerando token de verificação')

    const { error: tokenError } = await supabaseAdmin
      .from('user_verification_tokens')
      .insert({
        user_id: newUser.id,
        token: verificationToken,
        type: 'email_verification',
        expires_at: expiresAt.toISOString()
      })

    if (tokenError) {
      console.error('❌ [ADMIN-CREATE-USER] Erro ao criar token:', tokenError)
      return NextResponse.json(
        { error: 'Erro ao gerar token de verificação' },
        { status: 500 }
      )
    }

    // Enviar email de boas-vindas com verificação obrigatória
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const verificationUrl = `${baseUrl}/auth/verify?token=${verificationToken}`

    const emailResult = await sendWelcomeEmail({
      email: newUser.email,
      name: newUser.name,
      role: newUser.role as 'user' | 'therapist' | 'admin',
      verificationUrl,
      isResend: false
    })

    if (!emailResult.success) {
      console.error('❌ [ADMIN-CREATE-USER] Erro ao enviar email:', emailResult.error)
      // Continue mesmo com erro no email
    } else {
      console.log('✅ [ADMIN-CREATE-USER] Email de verificação enviado')
    }

    return NextResponse.json({
      success: true,
      message: role === 'therapist' 
        ? 'Terapeuta criado com sucesso! Email de verificação enviado. O perfil profissional deve ser completado após a verificação.'
        : 'Usuário criado com sucesso! Email de verificação enviado.',
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        email_verified: false
      },
      emailSent: emailResult.success,
      nextSteps: role === 'therapist' 
        ? ['Verificar email', 'Completar perfil profissional', 'Aguardar aprovação da equipe']
        : ['Verificar email', 'Completar perfil pessoal', 'Começar a usar a plataforma']
    })

  } catch (error) {
    console.error('💥 [ADMIN-CREATE-USER] Erro inesperado:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 