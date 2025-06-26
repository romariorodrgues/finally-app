import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { randomBytes } from 'crypto'
import { sendWelcomeEmail } from '@/lib/email/welcome-email-service'

export async function POST(request: Request) {
  try {
    console.log('📝 [CREATE-USER] Iniciando criação de usuário')

    const { email, password, name } = await request.json()

    console.log('🔧 [CREATE-USER] Dados recebidos:', {
      email,
      hasPassword: !!password,
      hasName: !!name
    })

    // Validar dados de entrada
    if (!email || !password) {
      return NextResponse.json({
        error: 'Email and password are required'
      }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({
        error: 'Password must be at least 8 characters long'
      }, { status: 400 })
    }

    // Configurar cliente Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      console.error('Missing Supabase configuration')
      return NextResponse.json({
        error: 'Server configuration error'
      }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

    // Verificar se usuário já existe
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (existingUser) {
      return NextResponse.json({
        error: 'User already exists with this email'
      }, { status: 400 })
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 12)

    // Criar usuário na tabela users principal
    const { data: newUser, error: userError } = await supabase
      .from('users')
      .insert({
        email,
        password: hashedPassword,
        name: name || null,
        role: 'user', // Usuários criados pela API pública são sempre 'user'
        email_verified: false
      })
      .select('id, email, name, role')
      .single()

    if (userError) {
      console.error('❌ [CREATE-USER] Erro ao criar usuário:', userError)
      return NextResponse.json({
        error: 'Failed to create user in database'
      }, { status: 500 })
    }

    console.log('✅ [CREATE-USER] Usuário criado:', newUser.id)

    // Gerar token de verificação
    const verificationToken = randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 horas

    const { error: tokenError } = await supabase
      .from('user_verification_tokens')
      .insert({
        user_id: newUser.id,
        token: verificationToken,
        type: 'email_verification',
        expires_at: expiresAt.toISOString()
      })

    if (tokenError) {
      console.error('❌ [CREATE-USER] Erro ao criar token:', tokenError)
      return NextResponse.json({
        error: 'Failed to generate verification token'
      }, { status: 500 })
    }

    // Enviar email de boas-vindas com verificação obrigatória
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const verificationUrl = `${baseUrl}/auth/verify?token=${verificationToken}`

    const emailResult = await sendWelcomeEmail({
      email: newUser.email,
      name: newUser.name,
      role: 'user', // Sempre user para esta API
      verificationUrl,
      isResend: false
    })

    if (!emailResult.success) {
      console.error('❌ [CREATE-USER] Erro ao enviar email:', emailResult.error)
      // Continue mesmo com erro no email
    } else {
      console.log('✅ [CREATE-USER] Email de verificação enviado')
    }

    return NextResponse.json({
      success: true,
      message: 'User created successfully! Please check your email to verify your account.',
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        email_verified: false
      },
      emailSent: emailResult.success
    })

  } catch (error) {
    console.error('💥 [CREATE-USER] Erro inesperado:', error)
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 })
  }
} 