import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { valid: false, error: 'Token não fornecido' },
        { status: 400 }
      )
    }

    // Configure Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      console.error('Missing Supabase configuration')
      return NextResponse.json(
        { valid: false, error: 'Configuração do servidor incompleta' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

    // Check if token exists and is valid
    const { data: resetToken, error: tokenError } = await supabase
      .from('user_verification_tokens')
      .select('*')
      .eq('token', token)
      .eq('type', 'password_reset')
      .is('used_at', null)
      .single()

    if (tokenError || !resetToken) {
      return NextResponse.json(
        { valid: false, error: 'Token inválido ou não encontrado' },
        { status: 400 }
      )
    }

    // Check if token has expired
    if (new Date(resetToken.expires_at) < new Date()) {
      return NextResponse.json(
        { valid: false, error: 'Token expirado' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { valid: true },
      { status: 200 }
    )

  } catch (error) {
    console.error('Token validation error:', error)
    return NextResponse.json(
      { valid: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { token, newPassword } = await request.json()

    if (!token || !newPassword) {
      return NextResponse.json(
        { error: 'Token e nova senha são obrigatórios' },
        { status: 400 }
      )
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'A senha deve ter pelo menos 6 caracteres' },
        { status: 400 }
      )
    }

    // Configure Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      console.error('Missing Supabase configuration')
      return NextResponse.json(
        { error: 'Configuração do servidor incompleta' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

    // Verify token is valid and not used
    const { data: resetToken, error: tokenError } = await supabase
      .from('user_verification_tokens')
      .select('*')
      .eq('token', token)
      .eq('type', 'password_reset')
      .is('used_at', null)
      .single()

    if (tokenError || !resetToken) {
      return NextResponse.json(
        { error: 'Token inválido ou já utilizado' },
        { status: 400 }
      )
    }

    // Check if token has expired
    if (new Date(resetToken.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'Token expirado' },
        { status: 400 }
      )
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Update user's password in users table and timestamp
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        password: hashedPassword,
        updated_at: new Date().toISOString()
      })
      .eq('id', resetToken.user_id)

    if (updateError) {
      console.error('Error updating password:', updateError)
      return NextResponse.json(
        { error: 'Erro ao atualizar senha' },
        { status: 500 }
      )
    }

    // Mark token as used
    const { error: markUsedError } = await supabase
      .from('user_verification_tokens')
      .update({ used_at: new Date().toISOString() })
      .eq('id', resetToken.id)

    if (markUsedError) {
      console.error('Error marking token as used:', markUsedError)
      // Don't fail the request if we can't mark as used, password was already changed
    }

    return NextResponse.json(
      { success: true, message: 'Senha atualizada com sucesso' },
      { status: 200 }
    )

  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 