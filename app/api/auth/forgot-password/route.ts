import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import crypto from 'crypto'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Configure Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      console.error('Missing Supabase configuration')
      return NextResponse.json(
        { error: 'Incomplete server configuration' },
        { status: 500 }
      )
    }

    // Use service role key for admin operations
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

    // Check if user exists
    console.log('🔍 Checking if user exists:', email)
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', email)
      .single()

    if (userError || !users) {
      console.log('❌ User not found:', userError)
      // Don't reveal if user exists or not for security
      return NextResponse.json(
        { message: 'If the email exists in our database, a recovery link will be sent.' },
        { status: 200 }
      )
    }

    console.log('✅ User found:', users.id)

    // Rate limiting: Check recent password reset requests
    const rateLimitWindow = 15 * 60 * 1000 // 15 minutes
    const maxAttempts = 3
    const currentTime = new Date()
    const windowStart = new Date(currentTime.getTime() - rateLimitWindow)

    console.log('🔍 Checking rate limit for user:', users.id)
    
    // Count recent password reset token requests for this user
    const { data: recentTokens, error: rateLimitError } = await supabase
      .from('user_verification_tokens')
      .select('created_at')
      .eq('user_id', users.id)
      .eq('type', 'password_reset')
      .gte('created_at', windowStart.toISOString())
      .order('created_at', { ascending: false })

    if (rateLimitError) {
      console.error('❌ Error checking rate limit:', rateLimitError)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }

    if (recentTokens && recentTokens.length >= maxAttempts) {
      console.warn('⚠️ Rate limit exceeded for user:', users.id, 'attempts:', recentTokens.length)
      return NextResponse.json(
        { 
          error: 'Too many password reset attempts. Please try again in 15 minutes.',
          retryAfter: Math.ceil(rateLimitWindow / 1000 / 60) // minutes
        },
        { status: 429 }
      )
    }

    console.log('✅ Rate limit check passed. Recent attempts:', recentTokens?.length || 0)

    // Generate reset token
    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour from now
    const now = new Date()

    console.log('🔑 Generated token for user:', users.id)

    // Strategy to prevent unique constraint violation:
    // 1. First, invalidate any existing active password reset tokens for this user
    // 2. Then insert the new token
    
    console.log('🔄 Invalidating existing password reset tokens for user:', users.id)
    const { error: invalidateError } = await supabase
      .from('user_verification_tokens')
      .update({
        used_at: now.toISOString(),
        updated_at: now.toISOString()
      })
      .eq('user_id', users.id)
      .eq('type', 'password_reset')
      .is('used_at', null)

    if (invalidateError) {
      console.error('❌ Error invalidating existing tokens:', invalidateError)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }

    console.log('✅ Existing tokens invalidated')

    // Now save the new reset token without conflict
    const { error: tokenError } = await supabase
      .from('user_verification_tokens')
      .insert({
        user_id: users.id,
        token,
        type: 'password_reset',
        expires_at: expiresAt.toISOString(),
        created_at: now.toISOString(),
        updated_at: now.toISOString()
      })

    if (tokenError) {
      console.error('❌ Error saving token:', tokenError)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }

    console.log('💾 Token saved successfully')

    // Generate reset URL using request origin or environment variable
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `${request.nextUrl.protocol}//${request.nextUrl.host}`
    const resetUrl = `${baseUrl}/auth/reset-password?token=${token}`
    
    console.log('📧 Sending email to:', email)
    console.log('🔗 Reset URL:', resetUrl)

    // Send reset email
    const emailResult = await resend.emails.send({
      from: process.env.FROM_EMAIL || 'noreply@finallymatch.com',
      to: email,
      subject: 'Password Recovery - Finally',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #D02E32;">Password Recovery</h2>
          <p>Hello,</p>
          <p>You requested a password recovery. Click the link below to reset your password:</p>
          <a href="${resetUrl}" style="display: inline-block; background-color: #D02E32; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">
            Reset Password
          </a>
          <p>This link expires in 1 hour.</p>
          <p>If you did not request this recovery, please ignore this email.</p>
          <p>Best regards,<br>Finally Team</p>
        </div>
      `
    })

    if (emailResult.error) {
      console.error('❌ Error sending email:', emailResult.error)
      // Remove the token if email failed
      await supabase
        .from('user_verification_tokens')
        .delete()
        .eq('token', token)
      
      return NextResponse.json(
        { error: 'Error sending recovery email' },
        { status: 500 }
      )
    }

    console.log('✅ Email sent successfully:', emailResult.data?.id)

    return NextResponse.json(
      { message: 'Recovery email sent successfully!' },
      { status: 200 }
    )

  } catch (error) {
    console.error('💥 Unexpected error in forgot-password API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 