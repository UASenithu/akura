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

  // ✅ Insert user into public.users immediately
  if (data.user) {
    await supabaseServer
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
      .select()
  }

  revalidatePath('/')
  redirect(role === 'admin' ? '/admin' : '/student')
}

export async function signIn(formData) {
  const email = formData.get('email')
  const password = formData.get('password')
  const role = formData.get('role') // 'student' or 'admin'

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

    // ✅ FIXED: Check if user exists in public.users, if not create them
    let userRole = 'student'
    
    try {
      const { data: userData, error: userError } = await supabaseServer
        .from('users')
        .select('role')
        .eq('id', data.user.id)
        .single()

      if (userError) {
        console.log('User not found in public.users, creating...')
        // ✅ Auto-create user in public.users
        const { error: insertError } = await supabaseServer
          .from('users')
          .insert({
            id: data.user.id,
            email: data.user.email,
            full_name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'User',
            stream: data.user.user_metadata?.stream || 'Not Set',
            role: 'student',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })

        if (insertError) {
          console.error('Error inserting user:', insertError)
          return { error: 'Failed to create user profile' }
        }
        userRole = 'student'
      } else {
        userRole = userData?.role || 'student'
      }
    } catch (err) {
      console.error('Role check error:', err)
      return { error: 'Authentication error. Please try again.' }
    }

    // ✅ Check if role matches
    if (role !== userRole) {
      await supabaseServer.auth.signOut()
      return { error: 'Unauthorized role access' }
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