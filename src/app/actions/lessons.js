'use server'

import { supabaseServer } from '@/lib/supabaseServer'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// Create a new lesson
export async function createLesson(formData) {
  const title = formData.get('title')
  const content = formData.get('content')
  const subjectId = formData.get('subjectId')
  const moduleId = formData.get('moduleId')
  const mindmapUrl = formData.get('mindmapUrl') || ''
  const orderNum = parseInt(formData.get('orderNum')) || 0

  const { data, error } = await supabaseServer
    .from('lessons')
    .insert([
      {
        title,
        story_content: content,
        subject_id: subjectId,
        module_id: moduleId || null,
        mindmap_url: mindmapUrl,
        order_num: orderNum
      }
    ])
    .select()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin')
  redirect('/admin')
}

// Get all lessons
export async function getLessons() {
  const { data, error } = await supabaseServer
    .from('lessons')
    .select(`
      *,
      subjects (name),
      modules (title)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    return { error: error.message, lessons: [] }
  }

  return { lessons: data }
}

// Get single lesson
export async function getLesson(id) {
  try {
    const { data, error } = await supabaseServer
      .from('lessons')
      .select(`
        *,
        subjects (id, name),
        modules (id, title)
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching lesson:', error)
      return { error: error.message, lesson: null }
    }

    return { lesson: data }
  } catch (error) {
    console.error('Error in getLesson:', error)
    return { error: error.message, lesson: null }
  }
}

// Update lesson
export async function updateLesson(formData) {
  const id = formData.get('id')
  const title = formData.get('title')
  const content = formData.get('content')
  const subjectId = formData.get('subjectId')
  const moduleId = formData.get('moduleId')
  const mindmapUrl = formData.get('mindmapUrl') || ''
  const orderNum = parseInt(formData.get('orderNum')) || 0

  const { error } = await supabaseServer
    .from('lessons')
    .update({
      title,
      story_content: content,
      subject_id: subjectId,
      module_id: moduleId || null,
      mindmap_url: mindmapUrl,
      order_num: orderNum,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin')
  redirect('/admin')
}

// Delete lesson
export async function deleteLesson(formData) {
  const id = formData.get('id')

  const { error } = await supabaseServer
    .from('lessons')
    .delete()
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin')
  redirect('/admin')
}

// Get subjects for dropdown
export async function getSubjects() {
  const { data, error } = await supabaseServer
    .from('subjects')
    .select(`
      *,
      streams (name)
    `)

  if (error) {
    return { error: error.message, subjects: [] }
  }

  return { subjects: data }
}

// Get modules for dropdown
export async function getModules() {
  const { data, error } = await supabaseServer
    .from('modules')
    .select(`
      *,
      subjects (name)
    `)

  if (error) {
    return { error: error.message, modules: [] }
  }

  return { modules: data }
}