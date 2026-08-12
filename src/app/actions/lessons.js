'use server'

import { supabaseServer } from '@/lib/supabaseServer'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// Create a new lesson
export async function createLesson(formData) {
  try {
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
          subject_id: subjectId || null,
          module_id: moduleId || null,
          mindmap_url: mindmapUrl,
          order_num: orderNum
        }
      ])
      .select()

    if (error) {
      console.error('Error creating lesson:', error)
      return { error: error.message }
    }

    revalidatePath('/admin')
    redirect('/admin')
  } catch (error) {
    console.error('Error in createLesson:', error)
    return { error: error.message }
  }
}

// Get all lessons (for admin dashboard)
export async function getLessons() {
  try {
    const { data, error } = await supabaseServer
      .from('lessons')
      .select(`
        *,
        subjects (id, name),
        modules (id, title)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching lessons:', error)
      return { error: error.message, lessons: [] }
    }

    return { lessons: data || [] }
  } catch (error) {
    console.error('Error in getLessons:', error)
    return { error: error.message, lessons: [] }
  }
}

// Get single lesson
export async function getLesson(id) {
  try {
    console.log('Fetching lesson with ID:', id)
    
    const { data, error } = await supabaseServer
      .from('lessons')
      .select(`
        id,
        title,
        story_content,
        subject_id,
        module_id,
        mindmap_url,
        order_num,
        created_at,
        subjects (id, name),
        modules (id, title)
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching lesson:', error)
      return { error: error.message, lesson: null }
    }

    if (!data) {
      console.error('No lesson found with ID:', id)
      return { error: 'Lesson not found', lesson: null }
    }

    console.log('Lesson found:', data)
    return { lesson: data }
  } catch (error) {
    console.error('Error in getLesson:', error)
    return { error: error.message, lesson: null }
  }
}

// Update lesson
export async function updateLesson(formData) {
  try {
    const id = formData.get('id')
    const title = formData.get('title')
    const content = formData.get('content')
    const subjectId = formData.get('subjectId')
    const moduleId = formData.get('moduleId')
    const mindmapUrl = formData.get('mindmapUrl') || ''
    const orderNum = parseInt(formData.get('orderNum')) || 0

    console.log('Updating lesson:', { id, title, subjectId })

    const { data, error } = await supabaseServer
      .from('lessons')
      .update({
        title,
        story_content: content,
        subject_id: subjectId || null,
        module_id: moduleId || null,
        mindmap_url: mindmapUrl,
        order_num: orderNum,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()

    if (error) {
      console.error('Error updating lesson:', error)
      return { error: error.message }
    }

    console.log('Lesson updated:', data)
    revalidatePath('/admin')
    redirect('/admin')
  } catch (error) {
    console.error('Error in updateLesson:', error)
    return { error: error.message }
  }
}

// Delete lesson
export async function deleteLesson(formData) {
  try {
    const id = formData.get('id')

    const { error } = await supabaseServer
      .from('lessons')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting lesson:', error)
      return { error: error.message }
    }

    revalidatePath('/admin')
    redirect('/admin')
  } catch (error) {
    console.error('Error in deleteLesson:', error)
    return { error: error.message }
  }
}

// Get subjects (for dropdowns)
export async function getSubjects() {
  try {
    const { data, error } = await supabaseServer
      .from('subjects')
      .select(`
        *,
        streams (id, name)
      `)
      .order('name')

    if (error) {
      console.error('Error fetching subjects:', error)
      return { error: error.message, subjects: [] }
    }

    return { subjects: data || [] }
  } catch (error) {
    console.error('Error in getSubjects:', error)
    return { error: error.message, subjects: [] }
  }
}

// Get modules (for dropdowns)
export async function getModules() {
  try {
    const { data, error } = await supabaseServer
      .from('modules')
      .select(`
        *,
        subjects (id, name)
      `)
      .order('title')

    if (error) {
      console.error('Error fetching modules:', error)
      return { error: error.message, modules: [] }
    }

    return { modules: data || [] }
  } catch (error) {
    console.error('Error in getModules:', error)
    return { error: error.message, modules: [] }
  }
}