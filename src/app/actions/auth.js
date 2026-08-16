'use server'

import { supabaseServer } from '@/lib/supabaseServer'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

// Create admin client with service role (bypasses all RLS)
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
    // Check if user already exists in auth
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('email')
      .eq('email', email)
      .maybeSingle()

    if (existingUser) {
      return { error: 'Email already registered. Please login instead.' }
    }

    // Create user in auth
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
      if (error.message.includes('already registered')) {
        return { error: 'Email already registered. Please login instead.' }
      }
      return { error: error.message }
    }

    if (!data.user) {
      return { error: 'Failed to create account. Please try again.' }
    }

    // Insert into public.users
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
      console.error('Insert error:', insertError)
    }

    // ✅ Auto login after signup
    const { data: loginData, error: loginError } = await supabaseServer.auth.signInWithPassword({
      email,
      password,
    })

    if (loginError) {
      // If auto-login fails, redirect to login page
      redirect('/login')
    }

    revalidatePath('/')
    redirect(role === 'admin' ? '/admin' : '/student')
  } catch (error) {
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
    // ✅ Try to sign in
    const { data, error } = await supabaseServer.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error('❌ Login error:', error.message)
      return { error: error.message }
    }

    if (!data.user) {
      return { error: 'User not found' }
    }

    console.log('✅ User authenticated:', data.user.email)

    // ✅ Check if user exists in public.users
    let userRole = 'student'
    let userExists = false

    try {
      const { data: userData } = await supabaseAdmin
        .from('users')
        .select('role')
        .eq('id', data.user.id)
        .maybeSingle()

      if (userData) {
        userExists = true
        userRole = userData.role || 'student'
        console.log('✅ User role from DB:', userRole)
      } else {
        console.log('⚠️ User not found in public.users, creating...')
      }
    } catch (err) {
      console.error('User check error:', err)
    }

    // ✅ If user doesn't exist in public.users, create them
    if (!userExists) {
      const fullName = data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'User'
      const stream = data.user.user_metadata?.stream || 'Not Set'
      
      const { error: insertError } = await supabaseAdmin
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

      if (insertError) {
        console.error('Insert error:', insertError)
      } else {
        console.log('✅ User created in public.users')
      }
      userRole = 'student'
    }

    // ✅ Check if role matches
    if (role !== userRole) {
      console.error('❌ Role mismatch:', { expected: role, actual: userRole })
      await supabaseServer.auth.signOut()
      return { error: 'Unauthorized role access' }
    }

    // ✅ Update last login
    try {
      await supabaseAdmin
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', data.user.id)
    } catch (updateErr) {
      console.error('Update last_login error:', updateErr)
    }

    console.log('✅ Login successful, redirecting...')
    revalidatePath('/')
    redirect(role === 'admin' ? '/admin' : '/student')
    
  } catch (error) {
    console.error('❌ SignIn error:', error)
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