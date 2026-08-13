'use server'

import { supabaseServer } from '@/lib/supabaseServer'
import { revalidatePath } from 'next/cache'

// Get all study groups
export async function getGroups() {
  try {
    const { data, error } = await supabaseServer
      .from('study_groups')
      .select(`
        *,
        subjects (name),
        created_by:users (id, full_name),
        members:group_members (id, user_id, role)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching groups:', error)
      return { error: error.message, groups: [] }
    }

    return { groups: data || [] }
  } catch (error) {
    console.error('Error in getGroups:', error)
    return { error: error.message, groups: [] }
  }
}

// Get a single group with details
export async function getGroup(groupId) {
  try {
    const { data: group, error } = await supabaseServer
      .from('study_groups')
      .select(`
        *,
        subjects (id, name),
        created_by:users (id, full_name, email),
        members:group_members (
          id,
          user_id,
          role,
          users (id, full_name, email),
          joined_at
        ),
        messages:group_messages (
          id,
          message,
          created_at,
          user_id,
          users (id, full_name)
        )
      `)
      .eq('id', groupId)
      .single()

    if (error) {
      console.error('Error fetching group:', error)
      return { error: error.message, group: null }
    }

    return { group }
  } catch (error) {
    console.error('Error in getGroup:', error)
    return { error: error.message, group: null }
  }
}

// Create a new study group
export async function createGroup(formData) {
  try {
    const name = formData.get('name')
    const description = formData.get('description')
    const subjectId = formData.get('subjectId')
    const isPrivate = formData.get('isPrivate') === 'true'
    const maxMembers = parseInt(formData.get('maxMembers')) || 20
    const userId = formData.get('userId')

    const { data, error } = await supabaseServer
      .from('study_groups')
      .insert({
        name,
        description,
        subject_id: subjectId || null,
        is_private: isPrivate,
        max_members: maxMembers,
        created_by: userId
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating group:', error)
      return { error: error.message, group: null }
    }

    revalidatePath('/student/groups')
    return { group: data }
  } catch (error) {
    console.error('Error in createGroup:', error)
    return { error: error.message, group: null }
  }
}

// Join a group
export async function joinGroup(formData) {
  try {
    const groupId = formData.get('groupId')
    const userId = formData.get('userId')
    const joinCode = formData.get('joinCode')

    // Verify join code if provided
    if (joinCode) {
      const { data: group } = await supabaseServer
        .from('study_groups')
        .select('id')
        .eq('id', groupId)
        .eq('join_code', joinCode.toUpperCase())
        .single()

      if (!group) {
        return { error: 'Invalid join code' }
      }
    }

    const { data, error } = await supabaseServer
      .from('group_members')
      .insert({
        group_id: groupId,
        user_id: userId
      })
      .select()
      .single()

    if (error) {
      console.error('Error joining group:', error)
      return { error: error.message }
    }

    revalidatePath('/student/groups')
    return { success: true }
  } catch (error) {
    console.error('Error in joinGroup:', error)
    return { error: error.message }
  }
}

// Leave a group
export async function leaveGroup(formData) {
  try {
    const groupId = formData.get('groupId')
    const userId = formData.get('userId')

    const { error } = await supabaseServer
      .from('group_members')
      .delete()
      .eq('group_id', groupId)
      .eq('user_id', userId)

    if (error) {
      console.error('Error leaving group:', error)
      return { error: error.message }
    }

    revalidatePath('/student/groups')
    return { success: true }
  } catch (error) {
    console.error('Error in leaveGroup:', error)
    return { error: error.message }
  }
}

// Send a message
export async function sendMessage(formData) {
  try {
    const groupId = formData.get('groupId')
    const userId = formData.get('userId')
    const message = formData.get('message')

    const { data, error } = await supabaseServer
      .from('group_messages')
      .insert({
        group_id: groupId,
        user_id: userId,
        message
      })
      .select()
      .single()

    if (error) {
      console.error('Error sending message:', error)
      return { error: error.message }
    }

    revalidatePath(`/student/groups/${groupId}`)
    return { message: data }
  } catch (error) {
    console.error('Error in sendMessage:', error)
    return { error: error.message }
  }
}

// Get group messages
export async function getGroupMessages(groupId) {
  try {
    const { data, error } = await supabaseServer
      .from('group_messages')
      .select(`
        *,
        users (id, full_name)
      `)
      .eq('group_id', groupId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching messages:', error)
      return { error: error.message, messages: [] }
    }

    return { messages: data || [] }
  } catch (error) {
    console.error('Error in getGroupMessages:', error)
    return { error: error.message, messages: [] }
  }
}

// Add resource to group
export async function addResource(formData) {
  try {
    const groupId = formData.get('groupId')
    const userId = formData.get('userId')
    const title = formData.get('title')
    const description = formData.get('description')
    const resourceType = formData.get('resourceType')
    const fileUrl = formData.get('fileUrl')
    const fileName = formData.get('fileName')

    const { data, error } = await supabaseServer
      .from('group_resources')
      .insert({
        group_id: groupId,
        user_id: userId,
        title,
        description,
        resource_type: resourceType,
        file_url: fileUrl,
        file_name: fileName
      })
      .select()
      .single()

    if (error) {
      console.error('Error adding resource:', error)
      return { error: error.message }
    }

    revalidatePath(`/student/groups/${groupId}`)
    return { resource: data }
  } catch (error) {
    console.error('Error in addResource:', error)
    return { error: error.message }
  }
}