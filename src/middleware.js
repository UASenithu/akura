import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function updateSession(request) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session if expired
  await supabase.auth.getUser()

  return supabaseResponse
}

export async function middleware(request) {
  // First, update session
  const response = await updateSession(request)
  
  // Get the pathname
  const path = request.nextUrl.pathname
  
  // ✅ If trying to access /student, check if user is O/L
  if (path === '/student' || path.startsWith('/student/')) {
    // Get user from cookie
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          },
        },
      }
    )
    
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      const userLevel = user.user_metadata?.level || 'A/L'
      
      // ✅ If O/L user tries to access A/L dashboard, redirect
      if (userLevel === 'O/L' && (path === '/student' || path === '/student/')) {
        return NextResponse.redirect(new URL('/student/ol-dashboard', request.url))
      }
      
      // ✅ If A/L user tries to access O/L dashboard, redirect
      if (userLevel === 'A/L' && path.startsWith('/student/ol-dashboard')) {
        return NextResponse.redirect(new URL('/student', request.url))
      }
    }
  }
  
  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/auth|login|signup|reset-password|update-password).*)',
  ],
}