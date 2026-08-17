'use server'

import { supabaseServer } from '@/lib/supabaseServer'
import { revalidatePath } from 'next/cache'

export async function updateDailyStreak(userId) {
  try {
    console.log('🔄 Updating streak for user:', userId)
    
    // Get current user data
    const { data: user, error: fetchError } = await supabaseServer
      .from('users')
      .select('study_streak, last_study_date')
      .eq('id', userId)
      .single()

    if (fetchError) {
      console.error('❌ Error fetching user:', fetchError)
      // If user doesn't exist, create default
      return { error: fetchError.message }
    }

    if (!user) {
      console.error('❌ User not found')
      return { error: 'User not found' }
    }

    const today = new Date().toISOString().split('T')[0]
    const lastStudy = user?.last_study_date
    let newStreak = user?.study_streak || 0

    console.log('📅 Today:', today)
    console.log('📅 Last study:', lastStudy)
    console.log('📊 Current streak:', newStreak)

    // ✅ AUTO STREAK CALCULATION
    if (!lastStudy) {
      // First time ever - start streak at 1
      newStreak = 1
      console.log('✅ First time! Streak set to 1')
    } else {
      const lastDate = new Date(lastStudy).toISOString().split('T')[0]
      const diffDays = Math.floor((new Date(today) - new Date(lastDate)) / (1000 * 60 * 60 * 24))
      
      console.log('📊 Days difference:', diffDays)
      
      if (diffDays === 0) {
        // Same day - no change
        newStreak = user?.study_streak || 0
        console.log('✅ Same day, streak unchanged:', newStreak)
      } else if (diffDays === 1) {
        // Next day - increase streak
        newStreak = (user?.study_streak || 0) + 1
        console.log('✅ New day! Streak increased to:', newStreak)
      } else if (diffDays > 1) {
        // Missed a day - reset streak to 0 (or 1 if you want to start fresh)
        newStreak = 0
        console.log('❌ Missed a day! Streak reset to 0')
      }
    }

    // ✅ Update database
    const { error: updateError } = await supabaseServer
      .from('users')
      .update({
        study_streak: newStreak,
        last_study_date: today
      })
      .eq('id', userId)

    if (updateError) {
      console.error('❌ Error updating streak:', updateError)
      return { error: updateError.message }
    }

    console.log('✅ Streak updated to:', newStreak)
    revalidatePath('/student')
    return { streak: newStreak }
  } catch (error) {
    console.error('❌ Error in updateDailyStreak:', error)
    return { error: error.message }
  }
}

export async function getUserStats(userId) {
  try {
    console.log('📊 Getting user stats for:', userId)
    
    const { data: user, error: userError } = await supabaseServer
      .from('users')
      .select('total_points, study_streak, last_study_date')
      .eq('id', userId)
      .single()

    if (userError) {
      console.error('❌ Error fetching user:', userError)
      return {
        points: 0,
        streak: 0,
        lastStudyDate: null,
        badges: [],
        lessonsCompleted: 0
      }
    }

    const { data: badges } = await supabaseServer
      .from('user_badges')
      .select('*, badges(*)')
      .eq('user_id', userId)

    const { count: lessonsCompleted } = await supabaseServer
      .from('user_progress')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('completed', true)

    // ✅ Calculate current streak based on last study date
    let currentStreak = user?.study_streak || 0
    const today = new Date().toISOString().split('T')[0]
    const lastStudy = user?.last_study_date

    if (lastStudy) {
      const lastDate = new Date(lastStudy).toISOString().split('T')[0]
      const diffDays = Math.floor((new Date(today) - new Date(lastDate)) / (1000 * 60 * 60 * 24))
      
      // If user hasn't studied today and missed a day, streak should be 0
      if (diffDays > 1) {
        currentStreak = 0
      }
    }

    return {
      points: user?.total_points || 0,
      streak: currentStreak,
      lastStudyDate: user?.last_study_date,
      badges: badges?.map(b => b.badges) || [],
      lessonsCompleted: lessonsCompleted || 0
    }
  } catch (error) {
    console.error('❌ Error in getUserStats:', error)
    return {
      points: 0,
      streak: 0,
      lastStudyDate: null,
      badges: [],
      lessonsCompleted: 0
    }
  }
}

// ✅ Existing awardPoints function
export async function awardPoints(userId, points = 10) {
  try {
    const { data: user } = await supabaseServer
      .from('users')
      .select('total_points, study_streak, last_study_date')
      .eq('id', userId)
      .single()

    const today = new Date().toISOString().split('T')[0]
    const lastStudy = user?.last_study_date
    let newStreak = user?.study_streak || 0

    if (lastStudy) {
      const lastDate = new Date(lastStudy).toISOString().split('T')[0]
      const diffDays = Math.floor((new Date(today) - new Date(lastDate)) / (1000 * 60 * 60 * 24))
      
      if (diffDays === 0) {
        newStreak = user?.study_streak || 0
      } else if (diffDays === 1) {
        newStreak = (user?.study_streak || 0) + 1
      } else if (diffDays > 1) {
        newStreak = 0
      }
    } else {
      newStreak = 1
    }

    const { error: updateError } = await supabaseServer
      .from('users')
      .update({
        total_points: (user?.total_points || 0) + points,
        study_streak: newStreak,
        last_study_date: today
      })
      .eq('id', userId)

    if (updateError) {
      console.error('Error updating user:', updateError)
      return { error: updateError.message }
    }

    await checkBadges(userId)
    revalidatePath('/student')
    
    return { 
      points: (user?.total_points || 0) + points,
      streak: newStreak
    }
  } catch (error) {
    console.error('Error awarding points:', error)
    return { error: error.message }
  }
}

export async function checkBadges(userId) {
  try {
    const { data: user } = await supabaseServer
      .from('users')
      .select('total_points, study_streak')
      .eq('id', userId)
      .single()

    const { count: lessonsCompleted } = await supabaseServer
      .from('user_progress')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('completed', true)

    const { data: badges } = await supabaseServer
      .from('badges')
      .select('*')

    const { data: earnedBadges } = await supabaseServer
      .from('user_badges')
      .select('badge_id')
      .eq('user_id', userId)

    const earnedIds = earnedBadges?.map(b => b.badge_id) || []
    const newBadges = []

    for (const badge of badges || []) {
      if (earnedIds.includes(badge.id)) continue

      let earned = false
      switch (badge.requirement_type) {
        case 'lessons_completed':
          earned = lessonsCompleted >= badge.requirement_value
          break
        case 'streak_days':
          earned = user?.study_streak >= badge.requirement_value
          break
        case 'points_earned':
          earned = user?.total_points >= badge.requirement_value
          break
      }

      if (earned) {
        await supabaseServer
          .from('user_badges')
          .insert({
            user_id: userId,
            badge_id: badge.id,
            earned_at: new Date().toISOString()
          })
        newBadges.push(badge)
      }
    }

    return { newBadges }
  } catch (error) {
    console.error('Error checking badges:', error)
    return { error: error.message }
  }
}