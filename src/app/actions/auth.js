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
      return { error: error.message }
    }

    if (data.user) {
      await supabaseAdmin
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

  try {
    const { data, error } = await supabaseServer.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return { error: error.message }
    }

    if (!data.user) {
      return { error: 'User not found' }
    }

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
      }
    } catch (err) {
      console.error('User check error:', err)
    }

    if (!userExists) {
      console.log('Creating user in public.users...')
      
      try {
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
          return { error: 'Failed to create user profile: ' + insertError.message }
        }
        
        userRole = 'student'
        console.log('User created successfully!')
      } catch (insertErr) {
        console.error('Insert exception:', insertErr)
        return { error: 'Failed to create user profile' }
      }
    }

    if (role !== userRole) {
      await supabaseServer.auth.signOut()
      return { error: 'Unauthorized role access' }
    }

    try {
      await supabaseAdmin
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', data.user.id)
    } catch (updateErr) {
      console.error('Update last_login error:', updateErr)
    }

    revalidatePath('/')
    
    // ✅ Use return redirect instead of throw
    const redirectPath = role === 'admin' ? '/admin' : '/student'
    redirect(redirectPath)
    
  } catch (error) {
    // ✅ If it's a redirect, let it through
    if (error?.digest?.includes('NEXT_REDIRECT')) {
      throw error // Let Next.js handle the redirect
    }
    console.error('SignIn error:', error)
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