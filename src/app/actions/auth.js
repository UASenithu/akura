'use server'

import { supabaseServer } from '@/lib/supabaseServer'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

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

    // Insert user into public.users
    if (data.user) {
      const { error: insertError } = await supabaseServer
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
  const role = formData.get('role') // 'student' or 'admin'

  try {
    // 1. Authenticate user
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

    // 2. Check if user exists in public.users
    let userRole = 'student'
    let userExists = false

    try {
      const { data: userData, error: userError } = await supabaseServer
        .from('users')
        .select('role, id')
        .eq('id', data.user.id)
        .maybeSingle() // ✅ Use maybeSingle instead of single

      if (userError) {
        console.error('Error checking user:', userError)
      }

      if (userData) {
        userExists = true
        userRole = userData.role || 'student'
      }
    } catch (err) {
      console.error('User check error:', err)
    }

    // 3. If user doesn't exist in public.users, create them
    if (!userExists) {
      console.log('Creating user in public.users...')
      
      try {
        const fullName = data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'User'
        const stream = data.user.user_metadata?.stream || 'Not Set'
        
        const { error: insertError } = await supabaseServer
          .from('users')
          .insert({
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

    // 4. Check if role matches
    if (role !== userRole) {
      await supabaseServer.auth.signOut()
      return { error: 'Unauthorized role access' }
    }

    // 5. Update last login
    try {
      await supabaseServer
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', data.user.id)
    } catch (updateErr) {
      console.error('Update last_login error:', updateErr)
    }

    revalidatePath('/')
    redirect(role === 'admin' ? '/admin' : '/student')
    
  } catch (error) {
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