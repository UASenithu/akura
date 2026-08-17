'use server'

import { supabaseServer } from '@/lib/supabaseServer'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function signUp(formData) {
  const email = formData.get('email')
  const password = formData.get('password')
  const fullName = formData.get('fullName')
  const stream = formData.get('stream')
  const role = formData.get('role') || 'student'

  try {
    // 1. Create user in auth
    const { data, error } = await supabaseServer.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          stream: stream,
          role: role
        }
      }
    })

    if (error) {
      console.error('SignUp error:', error.message)
      return { error: error.message }
    }

    if (!data.user) {
      return { error: 'Failed to create account' }
    }

    // 2. Insert into public.users
    const { error: insertError } = await supabaseAdmin
      .from('users')
      .upsert({
        id: data.user.id,
        full_name: fullName,
        email: email,
        stream: stream,
        role: role,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

    if (insertError) {
      console.error('Insert error:', insertError.message)
    }

    // ✅ 3. Auto-login after signup (මේක තමයි වැදගත්!)
    const { data: loginData, error: loginError } = await supabaseServer.auth.signInWithPassword({
      email,
      password,
    })

    if (loginError) {
      console.error('Auto-login error:', loginError.message)
      // If auto-login fails, redirect to login page
      redirect('/login')
    }

    console.log('✅ Signup and auto-login successful!')

    revalidatePath('/')
    redirect(role === 'admin' ? '/admin' : '/student')
  } catch (error) {
    if (error?.digest?.includes('NEXT_REDIRECT')) {
      throw error
    }
    console.error('SignUp error:', error)
    return { error: error.message }
  }
}

export async function signIn(formData) {
  const email = formData.get('email')
  const password = formData.get('password')
  const role = formData.get('role')

  console.log('🔑 Login attempt:', { email, role })

  try {
    const { data, error } = await supabaseServer.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error('❌ Auth error:', error.message)
      return { error: error.message }
    }

    if (!data.user) {
      return { error: 'User not found' }
    }

    console.log('✅ User authenticated:', data.user.email)

    // Get or create user in public.users
    let userRole = 'student'
    
    const { data: userData } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', data.user.id)
      .maybeSingle()

    if (userData) {
      userRole = userData.role || 'student'
    } else {
      // Create user if missing
      const fullName = data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'User'
      const stream = data.user.user_metadata?.stream || 'Not Set'
      
      await supabaseAdmin
        .from('users')
        .upsert({
          id: data.user.id,
          full_name: fullName,
          email: data.user.email,
          stream: stream,
          role: 'student',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      userRole = 'student'
    }

    // Check role
    if (role !== userRole) {
      await supabaseServer.auth.signOut()
      return { error: 'Unauthorized role access' }
    }

    // Update last login
    await supabaseAdmin
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', data.user.id)

    console.log('✅ Login successful!')
    revalidatePath('/')
    redirect(role === 'admin' ? '/admin' : '/student')
    
  } catch (error) {
    if (error?.digest?.includes('NEXT_REDIRECT')) {
      throw error
    }
    console.error('❌ Login error:', error)
    return { error: 'Login failed. Please try again.' }
  }
}

export async function signOut() {
  await supabaseServer.auth.signOut()
  revalidatePath('/')
  redirect('/login')
}

export async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabaseServer.auth.getUser()
    if (error) {
      return { user: null, error: error.message }
    }
    return { user: user, error: null }
  } catch (error) {
    return { user: null, error: error.message }
  }
}