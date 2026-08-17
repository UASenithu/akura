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
  const level = formData.get('level') || 'A/L'
  const subjects = formData.get('subjects') || ''

  console.log('📝 SignUp attempt:', { email, fullName, stream, level, subjects })

  try {
    const { data, error } = await supabaseServer.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          stream: stream,
          level: level,
          role: role,
          subjects: subjects
        }
      }
    })

    if (error) {
      console.error('❌ SignUp error:', error.message)
      return { error: error.message }
    }

    if (!data.user) {
      return { error: 'Failed to create account' }
    }

    console.log('✅ User created in auth:', data.user.id)

    // Insert into public.users
    const { error: insertError } = await supabaseAdmin
      .from('users')
      .upsert({
        id: data.user.id,
        full_name: fullName,
        email: email,
        stream: stream,
        level: level,
        subjects: subjects,
        role: role,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

    if (insertError) {
      console.error('❌ Insert error:', insertError.message)
    } else {
      console.log('✅ User inserted into public.users')
    }

    // Auto-login
    const { data: loginData, error: loginError } = await supabaseServer.auth.signInWithPassword({
      email,
      password,
    })

    if (loginError) {
      console.error('❌ Auto-login error:', loginError.message)
      redirect('/login')
    }

    console.log('✅ Auto-login successful!')
    revalidatePath('/')
    
    // ✅ Redirect based on level
    if (role === 'admin') {
      redirect('/admin')
    } else if (level === 'O/L') {
      redirect('/student/ol-dashboard')
    } else {
      redirect('/student')  // A/L default
    }
  } catch (error) {
    if (error?.digest?.includes('NEXT_REDIRECT')) {
      throw error
    }
    console.error('❌ SignUp error:', error)
    return { error: error.message }
  }
}

export async function signIn(formData) {
  const email = formData.get('email')
  const password = formData.get('password')
  const role = formData.get('role')

  console.log('🔑 ===== LOGIN ATTEMPT =====')
  console.log('📧 Email:', email)
  console.log('👤 Role:', role)

  try {
    const { data, error } = await supabaseServer.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error('❌ AUTH ERROR:', error.message)
      return { error: error.message }
    }

    if (!data.user) {
      return { error: 'User not found' }
    }

    console.log('✅ User authenticated:', data.user.email)

    // ✅ Get user level from metadata
    const userLevel = data.user.user_metadata?.level || 'A/L'
    console.log('📊 User Level:', userLevel)

    // ✅ Get user stream from metadata
    const userStream = data.user.user_metadata?.stream || ''
    console.log('📊 User Stream:', userStream)

    // Check public.users
    let userRole = 'student'
    
    try {
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
        const level = data.user.user_metadata?.level || 'A/L'
        const subjects = data.user.user_metadata?.subjects || ''
        
        await supabaseAdmin
          .from('users')
          .upsert({
            id: data.user.id,
            full_name: fullName,
            email: data.user.email,
            stream: stream,
            level: level,
            subjects: subjects,
            role: 'student',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
        userRole = 'student'
      }
    } catch (err) {
      console.error('User check error:', err)
    }

    if (role !== userRole) {
      await supabaseServer.auth.signOut()
      return { error: 'Unauthorized role access' }
    }

    // Update last login
    await supabaseAdmin
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', data.user.id)

    console.log('✅ Login successful! Level:', userLevel)
    revalidatePath('/')
    
    // ✅ Redirect based on level
    if (role === 'admin') {
      redirect('/admin')
    } else if (userLevel === 'O/L') {
      redirect('/student/ol-dashboard')
    } else {
      redirect('/student')  // A/L default
    }
    
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