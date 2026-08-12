// Get user gamification stats
export async function getUserStats(userId) {
  try {
    // Get user data
    const { data: user, error: userError } = await supabaseServer
      .from('users')
      .select('total_points, study_streak, last_study_date')
      .eq('id', userId)
      .single()

    if (userError) {
      console.error('Error fetching user stats:', userError)
      return {
        points: 0,
        streak: 0,
        lastStudyDate: null,
        badges: [],
        lessonsCompleted: 0
      }
    }

    // Get badges
    const { data: badges, error: badgesError } = await supabaseServer
      .from('user_badges')
      .select('*, badges(*)')
      .eq('user_id', userId)

    if (badgesError) {
      console.error('Error fetching badges:', badgesError)
    }

    // Get lessons completed count
    const { count: lessonsCompleted, error: countError } = await supabaseServer
      .from('user_progress')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('completed', true)

    if (countError) {
      console.error('Error counting lessons:', countError)
    }

    return {
      points: user?.total_points || 0,
      streak: user?.study_streak || 0,
      lastStudyDate: user?.last_study_date,
      badges: badges?.map(b => b.badges) || [],
      lessonsCompleted: lessonsCompleted || 0
    }
  } catch (error) {
    console.error('Error in getUserStats:', error)
    return {
      points: 0,
      streak: 0,
      lastStudyDate: null,
      badges: [],
      lessonsCompleted: 0
    }
  }
}