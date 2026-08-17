'use server'

import { supabaseServer } from '@/lib/supabaseServer'
import { revalidatePath } from 'next/cache'

// ✅ Update Daily Streak
export async function updateDailyStreak(userId) {
  try {
    const { data: user, error: fetchError } = await supabaseServer
      .from('users')
      .select('study_streak, last_study_date')
      .eq('id', userId)
      .single()

    if (fetchError) {
      console.error('❌ Error fetching user:', fetchError)
      return { error: fetchError.message }
    }

    const today = new Date().toISOString().split('T')[0]
    const lastStudy = user?.last_study_date
    let newStreak = user?.study_streak || 0

    if (!lastStudy) {
      newStreak = 1
    } else {
      const lastDate = new Date(lastStudy).toISOString().split('T')[0]
      const diffDays = Math.floor((new Date(today) - new Date(lastDate)) / (1000 * 60 * 60 * 24))
      
      if (diffDays === 0) {
        newStreak = user?.study_streak || 0
      } else if (diffDays === 1) {
        newStreak = (user?.study_streak || 0) + 1
      } else if (diffDays > 1) {
        newStreak = 0
      }
    }

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

    revalidatePath('/student')
    return { streak: newStreak }
  } catch (error) {
    console.error('❌ Error in updateDailyStreak:', error)
    return { error: error.message }
  }
}

// ✅ Get User Stats
export async function getUserStats(userId) {
  try {
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

    return {
      points: user?.total_points || 0,
      streak: user?.study_streak || 0,
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

// ✅ Award Points
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

// ✅ Check Badges
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