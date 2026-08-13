import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon)
     * - api/auth (auth routes)
     * - login (login page)
     * - signup (signup page)
     */
    '/((?!_next/static|_next/image|favicon.ico|api/auth|login|signup).*)',
  ],
}