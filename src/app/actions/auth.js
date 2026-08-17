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

  console.log('📝 SignUp attempt:', { email, fullName, stream, role })

  try {
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
    redirect(role === 'admin' ? '/admin' : '/student')
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
  console.log('🔑 Password length:', password?.length || 0)

  try {
    // ✅ Step 1: Try to sign in
    console.log('🔄 Attempting signIn...')
    const { data, error } = await supabaseServer.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error('❌ AUTH ERROR:', error.message)
      console.error('❌ Error code:', error.status)
      return { error: error.message }
    }

    if (!data.user) {
      console.error('❌ No user returned')
      return { error: 'User not found' }
    }

    console.log('✅ User authenticated:', data.user.email)
    console.log('✅ User ID:', data.user.id)

    // ✅ Step 2: Check public.users
    console.log('🔄 Checking public.users...')
    let userRole = 'student'
    
    try {
      const { data: userData, error: userError } = await supabaseAdmin
        .from('users')
        .select('role, id, email')
        .eq('id', data.user.id)
        .maybeSingle()

      if (userError) {
        console.error('❌ User fetch error:', userError.message)
      }

      if (userData) {
        console.log('✅ User found in public.users:', userData)
        userRole = userData.role || 'student'
      } else {
        console.log('⚠️ User NOT in public.users, creating...')
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
          console.error('❌ Insert error:', insertError.message)
        } else {
          console.log('✅ User created in public.users')
        }
        userRole = 'student'
      }
    } catch (err) {
      console.error('❌ User check error:', err)
    }

    // ✅ Step 3: Check role
    console.log('🔄 Checking role... Expected:', role, 'Actual:', userRole)
    if (role !== userRole) {
      console.error('❌ Role mismatch!')
      await supabaseServer.auth.signOut()
      return { error: 'Unauthorized role access' }
    }

    // ✅ Step 4: Update last login
    try {
      await supabaseAdmin
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', data.user.id)
      console.log('✅ Last login updated')
    } catch (updateErr) {
      console.error('Update error:', updateErr)
    }

    console.log('✅ ✅ ✅ LOGIN SUCCESSFUL! Redirecting...')
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