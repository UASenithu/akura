import { NextResponse } from 'next/server'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'

export async function middleware(req) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  
  try {
    const { data: { session } } = await supabase.auth.getSession()
    console.log('🔐 Middleware - Session:', session?.user?.email || 'No session')
    return res
  } catch (error) {
    console.error('Middleware error:', error)
    return res
  }
}

// Only run middleware on specific paths
export const config = {
  matcher: [
    '/student/:path*',
    '/admin/:path*',
    '/api/:path*',
  ],
}