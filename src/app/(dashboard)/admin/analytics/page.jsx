'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import { motion } from 'framer-motion'
import { ArrowLeft, Users, BookOpen, Award, TrendingUp, Calendar, Clock, Brain } from 'lucide-react'

export default function AdminAnalyticsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [analytics, setAnalytics] = useState({
    totalStudents: 0,
    totalLessons: 0,
    totalQuizzes: 0,
    totalAttempts: 0,
    averageScore: 0,
    topStudents: [],
    recentActivity: [],
    subjectPerformance: []
  })

  useEffect(() => {
    async function fetchData() {
      try {
        // Get total students
        const { count: studentsCount } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'student')

        // Get total lessons
        const { count: lessonsCount } = await supabase
          .from('lessons')
          .select('*', { count: 'exact', head: true })

        // Get total quizzes
        const { count: quizzesCount } = await supabase
          .from('quizzes')
          .select('*', { count: 'exact', head: true })

        // Get quiz attempts
        const { data: attempts } = await supabase
          .from('quiz_attempts')
          .select('*, users(full_name), quizzes(title)')
          .order('completed_at', { ascending: false })
          .limit(10)

        // Get top students by quiz score
        const { data: topStudents } = await supabase
          .from('quiz_attempts')
          .select('user_id, users(full_name), percentage')
          .order('percentage', { ascending: false })
          .limit(5)

        // Calculate average score
        const { data: allAttempts } = await supabase
          .from('quiz_attempts')
          .select('percentage')

        const avgScore = allAttempts?.length > 0 
          ? Math.round(allAttempts.reduce((a, b) => a + b.percentage, 0) / allAttempts.length)
          : 0

        setAnalytics({
          totalStudents: studentsCount || 0,
          totalLessons: lessonsCount || 0,
          totalQuizzes: quizzesCount || 0,
          totalAttempts: attempts?.length || 0,
          averageScore: avgScore,
          topStudents: topStudents || [],
          recentActivity: attempts || [],
          subjectPerformance: []
        })
      } catch (error) {
        console.error('Error fetching analytics:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-slate-600 dark:text-slate-400">Loading analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      
      <nav className="glass sticky top-0 z-50 border-b border-white/20 dark:border-white/5 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/admin')} className="p-2 hover:bg-white/20 rounded-xl transition">
              <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-500" />
                Analytics
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">Track student progress & performance</p>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="glass rounded-2xl p-4 border border-white/20 dark:border-white/5 text-center">
            <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{analytics.totalStudents}</div>
            <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1">
              <Users className="w-4 h-4" /> Students
            </div>
          </div>
          <div className="glass rounded-2xl p-4 border border-white/20 dark:border-white/5 text-center">
            <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{analytics.totalAttempts}</div>
            <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1">
              <BookOpen className="w-4 h-4" /> Attempts
            </div>
          </div>
          <div className="glass rounded-2xl p-4 border border-white/20 dark:border-white/5 text-center">
            <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">{analytics.averageScore}%</div>
            <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1">
              <Award className="w-4 h-4" /> Avg Score
            </div>
          </div>
          <div className="glass rounded-2xl p-4 border border-white/20 dark:border-white/5 text-center">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{analytics.totalQuizzes}</div>
            <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1">
              <Brain className="w-4 h-4" /> Quizzes
            </div>
          </div>
        </div>

        {/* Top Students & Recent Activity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          
          {/* Top Students */}
          <div className="glass rounded-2xl p-6 border border-white/20 dark:border-white/5">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              Top Students
            </h3>
            {analytics.topStudents.length > 0 ? (
              <div className="space-y-3">
                {analytics.topStudents.map((student, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white/30 dark:bg-slate-700/30 rounded-xl">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-amber-500">#{index + 1}</span>
                      <span className="font-medium text-slate-700 dark:text-white">
                        {student.users?.full_name || 'Student'}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                      {student.percentage}%
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 dark:text-slate-400">No quiz attempts yet</p>
            )}
          </div>

          {/* Recent Activity */}
          <div className="glass rounded-2xl p-6 border border-white/20 dark:border-white/5">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-500" />
              Recent Activity
            </h3>
            {analytics.recentActivity.length > 0 ? (
              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {analytics.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white/30 dark:bg-slate-700/30 rounded-xl text-sm">
                    <div>
                      <p className="font-medium text-slate-700 dark:text-white">
                        {activity.users?.full_name || 'Student'}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {activity.quizzes?.title || 'Quiz'}
                      </p>
                    </div>
                    <span className={`text-sm font-bold ${
                      activity.percentage >= 70 
                        ? 'text-emerald-600 dark:text-emerald-400' 
                        : activity.percentage >= 50 
                        ? 'text-amber-600 dark:text-amber-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {activity.percentage}%
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 dark:text-slate-400">No recent activity</p>
            )}
          </div>
        </div>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="glass rounded-2xl p-4 border border-white/20 dark:border-white/5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
                <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Total Lessons</p>
                <p className="text-xl font-bold text-slate-800 dark:text-white">{analytics.totalLessons}</p>
              </div>
            </div>
          </div>
          <div className="glass rounded-2xl p-4 border border-white/20 dark:border-white/5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
                <Brain className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Total Quizzes</p>
                <p className="text-xl font-bold text-slate-800 dark:text-white">{analytics.totalQuizzes}</p>
              </div>
            </div>
          </div>
          <div className="glass rounded-2xl p-4 border border-white/20 dark:border-white/5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
                <TrendingUp className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Pass Rate</p>
                <p className="text-xl font-bold text-slate-800 dark:text-white">
                  {analytics.totalAttempts > 0 
                    ? Math.round((analytics.topStudents.filter(s => s.percentage >= 50).length / analytics.totalAttempts) * 100)
                    : 0}%
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}