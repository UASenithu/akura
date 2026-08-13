'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { signOut } from '@/app/actions/auth'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  BookOpen, Users, Layers, Plus, 
  LogOut, FileText, Brain, Award, 
  Sparkles, ChevronRight, GraduationCap, Star
} from 'lucide-react'

export default function AdminDashboard() {
  const [user, setUser] = useState(null)
  const [stats, setStats] = useState({
    totalLessons: 0,
    totalSubjects: 0,
    totalStudents: 0,
    totalQuizzes: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)

        // Get lessons count
        const { count: lessonsCount } = await supabase
          .from('lessons')
          .select('*', { count: 'exact', head: true })

        // Get subjects count
        const { count: subjectsCount } = await supabase
          .from('subjects')
          .select('*', { count: 'exact', head: true })

        // Get students count
        const { count: studentsCount } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'student')

        // Get quizzes count
        const { count: quizzesCount } = await supabase
          .from('quizzes')
          .select('*', { count: 'exact', head: true })

        setStats({
          totalLessons: lessonsCount || 0,
          totalSubjects: subjectsCount || 0,
          totalStudents: studentsCount || 0,
          totalQuizzes: quizzesCount || 0
        })
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-indigo-200 dark:border-indigo-800 rounded-full"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="mt-6 text-slate-500 dark:text-slate-400">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      
      {/* Navbar */}
      <nav className="glass sticky top-0 z-50 border-b border-white/20 dark:border-white/5 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800 dark:text-white">🔐 Admin Panel</h1>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-indigo-400" />
                Manage Akura Content
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-slate-700 dark:text-white hidden sm:block">
                {user?.user_metadata?.full_name || 'Admin'}
              </span>
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/25">
                {user?.user_metadata?.full_name?.[0] || 'A'}
              </div>
              <form action={signOut}>
                <button type="submit" className="p-2 text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20">
                  <LogOut className="w-5 h-5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Dashboard</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your Akura content</p>
          </div>
          <Link
            href="/admin/lessons/new"
            className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:shadow-lg transition flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" />
            Add New Lesson
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="glass rounded-2xl p-4 border border-white/20 dark:border-white/5 flex items-center gap-4">
            <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
              <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Total Lessons</p>
              <p className="text-2xl font-bold text-slate-800 dark:text-white">{stats.totalLessons}</p>
            </div>
          </div>

          <div className="glass rounded-2xl p-4 border border-white/20 dark:border-white/5 flex items-center gap-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
              <Layers className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Total Subjects</p>
              <p className="text-2xl font-bold text-slate-800 dark:text-white">{stats.totalSubjects}</p>
            </div>
          </div>

          <div className="glass rounded-2xl p-4 border border-white/20 dark:border-white/5 flex items-center gap-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
              <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Total Students</p>
              <p className="text-2xl font-bold text-slate-800 dark:text-white">{stats.totalStudents}</p>
            </div>
          </div>

          <div className="glass rounded-2xl p-4 border border-white/20 dark:border-white/5 flex items-center gap-4">
            <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
              <FileText className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Total Quizzes</p>
              <p className="text-2xl font-bold text-slate-800 dark:text-white">{stats.totalQuizzes}</p>
            </div>
          </div>
        </div>

        {/* Admin Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Lessons */}
          <Link href="/admin/lessons">
            <motion.div whileHover={{ y: -4 }} className="glass rounded-2xl p-6 border border-white/20 dark:border-white/5 cursor-pointer hover:border-indigo-300 transition text-center">
              <div className="text-4xl mb-3">📚</div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Lessons</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Manage lesson content</p>
            </motion.div>
          </Link>

          {/* Quizzes */}
          <Link href="/admin/quizzes">
            <motion.div whileHover={{ y: -4 }} className="glass rounded-2xl p-6 border border-white/20 dark:border-white/5 cursor-pointer hover:border-indigo-300 transition text-center">
              <div className="text-4xl mb-3">📝</div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Quiz Manager</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Create & manage quizzes</p>
            </motion.div>
          </Link>

          {/* Subjects */}
          <Link href="/admin/subjects">
            <motion.div whileHover={{ y: -4 }} className="glass rounded-2xl p-6 border border-white/20 dark:border-white/5 cursor-pointer hover:border-indigo-300 transition text-center">
              <div className="text-4xl mb-3">📖</div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Subjects</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Manage subjects & streams</p>
            </motion.div>
          </Link>

          {/* Analytics */}
          <Link href="/admin/analytics">
            <motion.div whileHover={{ y: -4 }} className="glass rounded-2xl p-6 border border-white/20 dark:border-white/5 cursor-pointer hover:border-indigo-300 transition text-center">
              <div className="text-4xl mb-3">📊</div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Analytics</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">View student progress</p>
            </motion.div>
          </Link>

          {/* Past Papers */}
          <Link href="/admin/past-papers">
            <motion.div whileHover={{ y: -4 }} className="glass rounded-2xl p-6 border border-white/20 dark:border-white/5 cursor-pointer hover:border-indigo-300 transition text-center">
              <div className="text-4xl mb-3">📄</div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Past Papers</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Upload & manage past papers</p>
            </motion.div>
          </Link>

          
          <Link href="/admin/students">
            <motion.div whileHover={{ y: -4 }} className="glass rounded-2xl p-6 border border-white/20 dark:border-white/5 cursor-pointer hover:border-indigo-300 transition text-center">
              <div className="text-4xl mb-3">👥</div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Students</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Manage & view students</p>
            </motion.div>
          </Link>

          {/* Settings */}
          <Link href="/admin/settings">
            <motion.div whileHover={{ y: -4 }} className="glass rounded-2xl p-6 border border-white/20 dark:border-white/5 cursor-pointer hover:border-indigo-300 transition text-center">
              <div className="text-4xl mb-3">⚙️</div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Settings</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Platform settings</p>
            </motion.div>
          </Link>
        </div>
      </div>
    </div>
  )
}