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

  if (role === 'admin') {
    await supabaseServer
      .from('users')
      .update({ role: 'admin' })
      .eq('id', data.user.id)
  }

  revalidatePath('/')
  redirect(role === 'admin' ? '/admin' : '/student')
}

export async function signIn(formData) {
  const email = formData.get('email')
  const password = formData.get('password')
  const role = formData.get('role')

  const { data, error } = await supabaseServer.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  const { data: userData } = await supabaseServer
    .from('users')
    .select('role')
    .eq('id', data.user.id)
    .single()

  if (userData?.role !== role) {
    await supabaseServer.auth.signOut()
    return { error: 'Unauthorized role access' }
  }

  revalidatePath('/')
  redirect(role === 'admin' ? '/admin' : '/student')
}

export async function signOut() {
  await supabaseServer.auth.signOut()
  revalidatePath('/')
  redirect('/login')
}