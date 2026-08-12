'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { signOut } from '@/app/actions/auth'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  BookOpen, Sparkles, Brain, Zap, TrendingUp, 
  Award, Clock, ChevronRight, User, LogOut,
  Flame, Target, GraduationCap
} from 'lucide-react'

export default function StudentDashboard() {
  const [user, setUser] = useState(null)
  const [streams, setStreams] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    completed: 0,
    streak: 0,
    points: 0
  })

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      const { data: streamsData } = await supabase
        .from('streams')
        .select('*')
      setStreams(streamsData || [])
      
      // Mock stats (will be real when we add progress tracking)
      setStats({
        completed: Math.floor(Math.random() * 20) + 5,
        streak: Math.floor(Math.random() * 15) + 1,
        points: Math.floor(Math.random() * 500) + 100
      })
      
      setLoading(false)
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-indigo-200 dark:border-indigo-800 rounded-full"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="mt-6 text-slate-500 dark:text-slate-400">Loading your Akura...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50/30 to-pink-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      
      {/* Premium Navbar */}
      <nav className="glass sticky top-0 z-50 border-b border-white/20 dark:border-white/5 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Akura
              </h1>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 -mt-0.5 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-indigo-400" />
                Calm Study
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 bg-white/50 dark:bg-slate-800/50 px-4 py-2 rounded-2xl border border-white/20 dark:border-white/5">
              <div className="flex items-center gap-1.5 text-xs">
                <Flame className="w-4 h-4 text-orange-500" />
                <span className="font-bold text-slate-700 dark:text-white">{stats.streak}</span>
              </div>
              <div className="w-px h-4 bg-slate-200 dark:bg-slate-600" />
              <div className="flex items-center gap-1.5 text-xs">
                <Award className="w-4 h-4 text-amber-500" />
                <span className="font-bold text-slate-700 dark:text-white">{stats.points}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-slate-700 dark:text-white hidden sm:block">
                {user?.user_metadata?.full_name || 'Student'}
              </span>
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/25">
                {user?.user_metadata?.full_name?.[0] || 'S'}
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
        
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-8 mb-8 shadow-2xl shadow-indigo-500/25">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-10"></div>
          
          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs text-white font-medium">
                  🌿 Stress-Free Learning
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white">
                Welcome back, {user?.user_metadata?.full_name?.split(' ')[0] || 'Student'}! 👋
              </h2>
              <p className="text-indigo-100 mt-2 text-lg">
                Learn without stress. Master with calm.
              </p>
              {user?.user_metadata?.stream && (
                <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl text-white text-sm">
                  <GraduationCap className="w-4 h-4" />
                  {user.user_metadata.stream}
                </div>
              )}
            </div>
            
            <div className="flex flex-wrap gap-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-4 text-center min-w-[100px]">
                <p className="text-2xl font-bold text-white">{stats.completed}</p>
                <p className="text-xs text-indigo-100">Lessons Done</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-4 text-center min-w-[100px]">
                <p className="text-2xl font-bold text-white flex items-center justify-center gap-1">
                  🔥 {stats.streak}
                </p>
                <p className="text-xs text-indigo-100">Day Streak</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <motion.div 
            whileHover={{ y: -4 }}
            className="glass rounded-2xl p-4 border border-white/20 dark:border-white/5 flex items-center gap-4"
          >
            <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
              <Target className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Progress</p>
              <p className="text-lg font-bold text-slate-800 dark:text-white">
                {Math.round((stats.completed / 50) * 100)}%
              </p>
            </div>
          </motion.div>
          
          <motion.div 
            whileHover={{ y: -4 }}
            className="glass rounded-2xl p-4 border border-white/20 dark:border-white/5 flex items-center gap-4"
          >
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
              <Brain className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Focus Time</p>
              <p className="text-lg font-bold text-slate-800 dark:text-white">2.5 hrs</p>
            </div>
          </motion.div>
          
          <motion.div 
            whileHover={{ y: -4 }}
            className="glass rounded-2xl p-4 border border-white/20 dark:border-white/5 flex items-center gap-4"
          >
            <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
              <Zap className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Streak</p>
              <p className="text-lg font-bold text-slate-800 dark:text-white">{stats.streak} days</p>
            </div>
          </motion.div>
          
          <motion.div 
            whileHover={{ y: -4 }}
            className="glass rounded-2xl p-4 border border-white/20 dark:border-white/5 flex items-center gap-4"
          >
            <div className="p-3 bg-pink-100 dark:bg-pink-900/30 rounded-xl">
              <Award className="w-5 h-5 text-pink-600 dark:text-pink-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Points</p>
              <p className="text-lg font-bold text-slate-800 dark:text-white">{stats.points}</p>
            </div>
          </motion.div>
        </div>

        {/* Subject Streams - Premium Grid */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white">
              Your Streams 📚
            </h3>
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {streams.length} available
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {streams.map((stream, index) => (
              <motion.div
                key={stream.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-2xl transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <Link href={`/student/subjects/${stream.id}`} className="block p-6 relative">
                  <div className="text-5xl mb-4 float group-hover:scale-110 transition-transform duration-300">
                    {stream.icon || '📖'}
                  </div>
                  <h4 className="text-xl font-bold text-slate-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                    {stream.name}
                  </h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    {stream.description || 'Start your journey'}
                  </p>
                  
                  <div className="mt-4 flex items-center text-sm font-medium text-indigo-600 dark:text-indigo-400 group-hover:gap-2 transition-all">
                    <span>Explore</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>

                  {/* Animated border glow on hover */}
                  <div className="absolute inset-0 border-2 border-transparent group-hover:border-indigo-500/20 rounded-2xl transition-all duration-300 pointer-events-none"></div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Motivation Cards with Icons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div 
            whileHover={{ y: -4 }}
            className="glass rounded-2xl p-6 border border-white/20 dark:border-white/5 text-center"
          >
            <div className="text-4xl mb-3 float">🧘</div>
            <h4 className="font-bold text-slate-800 dark:text-white">Stress-Free Learning</h4>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Stories & mindmaps for easy memory</p>
          </motion.div>
          
          <motion.div 
            whileHover={{ y: -4 }}
            className="glass rounded-2xl p-6 border border-white/20 dark:border-white/5 text-center"
          >
            <div className="text-4xl mb-3 float">🏆</div>
            <h4 className="font-bold text-slate-800 dark:text-white">Daily Streak</h4>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Stay motivated with rewards</p>
          </motion.div>
          
          <motion.div 
            whileHover={{ y: -4 }}
            className="glass rounded-2xl p-6 border border-white/20 dark:border-white/5 text-center"
          >
            <div className="text-4xl mb-3 float">🤖</div>
            <h4 className="font-bold text-slate-800 dark:text-white">AI Assistant</h4>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">24/7 help when you're stuck</p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}