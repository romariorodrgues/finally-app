import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    message: 'Hello World! API funcionando!',
    timestamp: new Date().toISOString(),
    env: {
      NODE_ENV: process.env.NODE_ENV,
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasSupabaseKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
    }
  })
}

export async function POST() {
  return GET()
}
