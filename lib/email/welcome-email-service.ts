import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

interface WelcomeEmailData {
  email: string
  name?: string
  role?: 'user' | 'therapist' | 'admin'
  loginUrl?: string
  verificationUrl?: string
  isResend?: boolean
}

export async function sendWelcomeEmail({ 
  email, 
  name, 
  role = 'user',
  loginUrl, 
  verificationUrl,
  isResend = false 
}: WelcomeEmailData) {
  try {
    console.log('📧 [WELCOME-EMAIL] Sending welcome email to:', email, 'role:', role)

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const finalLoginUrl = loginUrl || `${baseUrl}/auth/login`

    // Always use verification for the first email (when isResend = false)
    // When verificationUrl is not provided, use loginUrl as fallback
    const finalVerificationUrl = verificationUrl || finalLoginUrl
    const requiresVerification = !isResend || !!verificationUrl

    // Define content based on user role
    const emailContent = getEmailContent(role, isResend, requiresVerification, name)
    const buttonUrl = requiresVerification ? finalVerificationUrl : finalLoginUrl

    const result = await resend.emails.send({
      from: process.env.FROM_EMAIL || 'Finally Match <noreply@finallymatch.com>',
      to: email,
      subject: emailContent.subject,
      html: emailContent.html
        .replace('{{BUTTON_URL}}', buttonUrl)
        .replace('{{BUTTON_TEXT}}', emailContent.buttonText)
    })

    if (result.error) {
      console.error('❌ [WELCOME-EMAIL] Error sending email:', result.error)
      return { success: false, error: result.error }
    }

    console.log('✅ [WELCOME-EMAIL] Email sent successfully:', result.data?.id)
    return { success: true, emailId: result.data?.id }

  } catch (error) {
    console.error('💥 [WELCOME-EMAIL] Unexpected error:', error)
    return { success: false, error: 'Internal error sending email' }
  }
}

function getEmailContent(role: string, isResend: boolean, requiresVerification: boolean, name?: string) {
  if (role === 'therapist') {
    return getTherapistEmailContent(isResend, requiresVerification, name)
  } else if (role === 'admin') {
    return getAdminEmailContent(isResend, requiresVerification, name)
  } else {
    return getUserEmailContent(isResend, requiresVerification, name)
  }
}

function getTherapistEmailContent(isResend: boolean, requiresVerification: boolean, name?: string) {
  const subject = isResend 
    ? '🔄 Verify Your Finally Match Therapist Account' 
    : '🩺 Welcome to Finally Match - Therapist Platform'

  const headerText = isResend
    ? 'Verify Your Account'
    : 'Welcome to Finally Match!'

  const introText = isResend
    ? 'Click the button below to verify your email and activate your therapist account on Finally Match.'
    : 'Thank you for joining our mental health professional network! We\'re excited to have you as part of our community helping couples build stronger relationships.'

  const buttonText = requiresVerification
    ? '✅ Verify My Account'
    : '🚀 Access Therapist Dashboard'

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${headerText}</title>
    </head>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
      
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #059669 0%, #047857 100%); color: white; padding: 40px 30px; text-align: center; border-radius: 15px 15px 0 0;">
        <h1 style="margin: 0; font-size: 28px; font-weight: bold;">${requiresVerification ? '🔐' : '🩺'} ${headerText}</h1>
        <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Professional Mental Health Network</p>
      </div>

      <!-- Main Content -->
      <div style="background: white; padding: 40px 30px; border-radius: 0 0 15px 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
        
        <!-- Personal Greeting -->
        <div style="margin-bottom: 30px;">
          <h2 style="color: #059669; margin: 0 0 15px 0; font-size: 24px;">
            Hello${name ? `, ${name}` : ''}! 👋
          </h2>
          <p style="margin: 0; font-size: 16px; color: #555;">
            ${introText}
          </p>
        </div>

        ${requiresVerification ? `
        <!-- Verification Info -->
        <div style="background: #f0fdf4; padding: 25px; border-radius: 10px; margin-bottom: 30px; border-left: 4px solid #22c55e;">
          <h3 style="color: #059669; margin: 0 0 15px 0; font-size: 20px;">🔐 Email Verification Required:</h3>
          <p style="margin: 0 0 10px 0; color: #555;">
            To ensure the security of our professional network, we need to verify your email address. 
            This link is valid for 24 hours.
          </p>
          <p style="margin: 0; color: #666; font-size: 14px;">
            ⚠️ <strong>Important:</strong> You can only access your therapist dashboard after verification.
          </p>
        </div>
        ` : `
        <!-- What's Next Section -->
        <div style="background: #f8f9fa; padding: 25px; border-radius: 10px; margin-bottom: 30px; border-left: 4px solid #059669;">
          <h3 style="color: #059669; margin: 0 0 15px 0; font-size: 20px;">🚀 Next Steps:</h3>
          <ul style="margin: 0; padding-left: 20px; color: #555;">
            <li style="margin-bottom: 8px;">Complete your professional profile with credentials and specializations</li>
            <li style="margin-bottom: 8px;">Set your availability and consultation rates</li>
            <li style="margin-bottom: 8px;">Review and approve couple therapy requests</li>
            <li style="margin-bottom: 8px;">Start helping couples build stronger relationships!</li>
          </ul>
        </div>
        `}

        <!-- CTA Button -->
        <div style="text-align: center; margin: 40px 0;">
          <a href="{{BUTTON_URL}}" style="display: inline-block; background: linear-gradient(135deg, #059669 0%, #047857 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 15px rgba(5, 150, 105, 0.3);">
            {{BUTTON_TEXT}}
          </a>
        </div>

        ${requiresVerification ? `
        <!-- Security Note -->
        <div style="background: #fef3f2; padding: 20px; border-radius: 10px; text-align: center; margin-top: 30px; border: 1px solid #fecaca;">
          <h4 style="color: #dc2626; margin: 0 0 10px 0;">🛡️ Security Note</h4>
          <p style="margin: 0; font-size: 14px; color: #666;">
            ${isResend 
              ? 'If you did not request this verification, you can safely ignore this email.'
              : 'If you did not create a therapist account on Finally Match, you can safely ignore this email.'
            } 
            Only you can verify your account using this link.
          </p>
        </div>
        ` : `
        <!-- Professional Support Section -->
        <div style="background: #f7fafc; padding: 20px; border-radius: 10px; text-align: center; margin-top: 30px;">
          <h4 style="color: #059669; margin: 0 0 10px 0;">💬 Professional Support</h4>
          <p style="margin: 0; font-size: 14px; color: #666;">
            Our team is here to support your professional journey! Contact us at 
            <a href="mailto:therapists@finallymatch.com" style="color: #059669; text-decoration: none;">therapists@finallymatch.com</a>
          </p>
        </div>
        `}

      </div>

      <!-- Footer -->
      <div style="text-align: center; padding: 30px 20px; color: #666; font-size: 12px;">
        <p style="margin: 0 0 10px 0;">
          © 2024 Finally Match Professional Network. All rights reserved.
        </p>
        <p style="margin: 0;">
          ${isResend 
            ? 'This email was resent at the request of our support team.'
            : 'You are receiving this email because a therapist account was created on Finally Match with this address.'
          }
        </p>
      </div>

    </body>
    </html>
  `

  return { subject, html, buttonText }
}

function getAdminEmailContent(isResend: boolean, requiresVerification: boolean, name?: string) {
  const subject = isResend 
    ? '🔄 Verify Your Finally Match Admin Account' 
    : '⚙️ Welcome Admin - Finally Match'

  const headerText = isResend
    ? 'Verify Your Account'
    : 'Administrative Access'

  const introText = isResend
    ? 'Click the button below to verify your email and activate your administrative account.'
    : 'Your administrative account has been successfully created. You now have full access to the Finally Match admin panel.'

  const buttonText = requiresVerification
    ? '✅ Verify My Account'
    : '⚙️ Access Admin Panel'

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${headerText}</title>
    </head>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
      
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%); color: white; padding: 40px 30px; text-align: center; border-radius: 15px 15px 0 0;">
        <h1 style="margin: 0; font-size: 28px; font-weight: bold;">${requiresVerification ? '🔐' : '⚙️'} ${headerText}</h1>
        <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Administration System</p>
      </div>

      <!-- Main Content -->
      <div style="background: white; padding: 40px 30px; border-radius: 0 0 15px 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
        
        <!-- Personal Greeting -->
        <div style="margin-bottom: 30px;">
          <h2 style="color: #7c3aed; margin: 0 0 15px 0; font-size: 24px;">
            Hello${name ? `, ${name}` : ''}! 👋
          </h2>
          <p style="margin: 0; font-size: 16px; color: #555;">
            ${introText}
          </p>
        </div>

        <!-- CTA Button -->
        <div style="text-align: center; margin: 40px 0;">
          <a href="{{BUTTON_URL}}" style="display: inline-block; background: linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 15px rgba(124, 58, 237, 0.3);">
            {{BUTTON_TEXT}}
          </a>
        </div>

      </div>

      <!-- Footer -->
      <div style="text-align: center; padding: 30px 20px; color: #666; font-size: 12px;">
        <p style="margin: 0 0 10px 0;">
          © 2024 Finally Match. All rights reserved.
        </p>
      </div>

    </body>
    </html>
  `

  return { subject, html, buttonText }
}

function getUserEmailContent(isResend: boolean, requiresVerification: boolean, name?: string) {
  const subject = isResend 
    ? '🔄 Verify Your Finally Match Account' 
    : '🎉 Welcome to Finally Match - Verify Your Email'

  const headerText = isResend
    ? 'Verify Your Account'
    : 'Welcome to Finally!'

  const introText = isResend
    ? 'Click the button below to verify your email and activate your account on Finally Match.'
    : 'It\'s a pleasure to have you with us! To ensure the security of our community, we need to verify your email before you can start using the platform.'

  const buttonText = requiresVerification
    ? '✅ Verify My Account'
    : '🚀 Login and Get Started'

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${headerText}</title>
    </head>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
      
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #D02E32 0%, #AF2427 100%); color: white; padding: 40px 30px; text-align: center; border-radius: 15px 15px 0 0;">
        <h1 style="margin: 0; font-size: 28px; font-weight: bold;">${requiresVerification ? '🔐' : '🎉'} ${headerText}</h1>
        <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">The relationship app that connects hearts</p>
      </div>

      <!-- Main Content -->
      <div style="background: white; padding: 40px 30px; border-radius: 0 0 15px 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
        
        <!-- Personal Greeting -->
        <div style="margin-bottom: 30px;">
          <h2 style="color: #D02E32; margin: 0 0 15px 0; font-size: 24px;">
            Hello${name ? `, ${name}` : ''}! 👋
          </h2>
          <p style="margin: 0; font-size: 16px; color: #555;">
            ${introText}
          </p>
        </div>

        ${requiresVerification ? `
        <!-- Verification Info -->
        <div style="background: #fff7ed; padding: 25px; border-radius: 10px; margin-bottom: 30px; border-left: 4px solid #f59e0b;">
          <h3 style="color: #D02E32; margin: 0 0 15px 0; font-size: 20px;">🔐 Verification Required:</h3>
          <p style="margin: 0 0 10px 0; color: #555;">
            To ensure the security of our community, we need to verify your email address. 
            This link is valid for 24 hours.
          </p>
          <p style="margin: 0; color: #666; font-size: 14px;">
            ⚠️ <strong>Important:</strong> You can only log in after verification.
          </p>
        </div>
        ` : `
        <!-- What's Next Section -->
        <div style="background: #f8f9fa; padding: 25px; border-radius: 10px; margin-bottom: 30px; border-left: 4px solid #CBA415;">
          <h3 style="color: #D02E32; margin: 0 0 15px 0; font-size: 20px;">🚀 Next Steps:</h3>
          <ul style="margin: 0; padding-left: 20px; color: #555;">
            <li style="margin-bottom: 8px;">Complete your profile with photos and personal information</li>
            <li style="margin-bottom: 8px;">Answer our compatibility questionnaire</li>
            <li style="margin-bottom: 8px;">Wait for match approval from our team</li>
            <li style="margin-bottom: 8px;">Start chatting with compatible people!</li>
          </ul>
        </div>
        `}

        <!-- CTA Button -->
        <div style="text-align: center; margin: 40px 0;">
          <a href="{{BUTTON_URL}}" style="display: inline-block; background: linear-gradient(135deg, #CBA415 0%, #956F02 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 15px rgba(203, 164, 21, 0.3);">
            {{BUTTON_TEXT}}
          </a>
        </div>

        ${requiresVerification ? `
        <!-- Security Note -->
        <div style="background: #fef3f2; padding: 20px; border-radius: 10px; text-align: center; margin-top: 30px; border: 1px solid #fecaca;">
          <h4 style="color: #dc2626; margin: 0 0 10px 0;">🛡️ Security Note</h4>
          <p style="margin: 0; font-size: 14px; color: #666;">
            ${isResend 
              ? 'If you did not request this verification, you can safely ignore this email.'
              : 'If you did not sign up for Finally Match, you can safely ignore this email.'
            } 
            Only you can verify your account using this link.
          </p>
        </div>
        ` : `
        <!-- Support Section -->
        <div style="background: #f7fafc; padding: 20px; border-radius: 10px; text-align: center; margin-top: 30px;">
          <h4 style="color: #D02E32; margin: 0 0 10px 0;">💬 Need help?</h4>
          <p style="margin: 0; font-size: 14px; color: #666;">
            Our team is here to help! Contact us at 
            <a href="mailto:support@finallymatch.com" style="color: #D02E32; text-decoration: none;">support@finallymatch.com</a>
          </p>
        </div>
        `}

      </div>

      <!-- Footer -->
      <div style="text-align: center; padding: 30px 20px; color: #666; font-size: 12px;">
        <p style="margin: 0 0 10px 0;">
          © 2024 Finally Match. All rights reserved.
        </p>
        <p style="margin: 0;">
          ${isResend 
            ? 'This email was resent at the request of our support team.'
            : 'You are receiving this email because an account was created on Finally Match with this address.'
          }
        </p>
      </div>

    </body>
    </html>
  `

  return { subject, html, buttonText }
}