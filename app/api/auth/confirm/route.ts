import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

type EmailOtpType = 'signup' | 'invite' | 'magiclink' | 'recovery' | 'email_change'

export async function GET(request: NextRequest) {
  
  const { searchParams, origin } = new URL(request.url)
  
  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/dashboard'

  
  const supabase = await createClient()

  if (code) {
    
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    
    
    if (!error) {
      
      return NextResponse.redirect(`${origin}${next}`)
    } else {
      console.error('❌ PKCE Error:', error)
    }
  }

  if (token_hash && type) {
    
    const { data, error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })
    
    
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    } else {
      console.error('❌ OTP Error:', error)
    }
  }

  console.error('❌ No valid params found, redirecting to error page')
  return NextResponse.redirect(`${origin}/error`)
}