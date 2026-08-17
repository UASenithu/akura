'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { signOut } from '@/app/actions/auth'
import { getUserStats, updateDailyStreak } from '@/app/actions/gamification'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  BookOpen, Sparkles, Brain, Zap, 
  Award, ChevronRight, LogOut,
  Flame, Target, GraduationCap, Star,
  Users, BarChart3, School, Globe,
  Calculator, Beaker, History, Heart,
  Music, Palette, Laptop, Leaf,
  Home, Utensils, Dumbbell, Briefcase,
  Languages, Map, Book, Church
} from 'lucide-react'

export default function OLDashboard() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    completed: 0,
    streak: 0,
    points: 0,
    badges: []
  })
  const [selectedCategory, setSelectedCategory] = useState('all')

  // ✅ O/L Subjects with Categories
  const olSubjects = [
    // Core Subjects (අනිවාර්ය - 6)
    { id: 'ol-sinhala', name: 'සිංහල භාෂාව හා සාහිත්‍යය', icon: '📖', category: 'core', color: 'from-red-500 to-rose-500' },
    { id: 'ol-english', name: 'English Language', icon: '🌍', category: 'core', color: 'from-blue-500 to-cyan-500' },
    { id: 'ol-maths', name: 'Mathematics', icon: '📐', category: 'core', color: 'from-purple-500 to-indigo-500' },
    { id: 'ol-science', name: 'Science', icon: '🔬', category: 'core', color: 'from-green-500 to-emerald-500' },
    { id: 'ol-history', name: 'History', icon: '📜', category: 'core', color: 'from-amber-500 to-orange-500' },
    { id: 'ol-religion', name: 'Religion (Buddhism/Islam/Christianity/Hindu)', icon: '🕊️', category: 'core', color: 'from-yellow-500 to-amber-500' },

    // Category I - භාෂා/ව්‍යාපාර
    { id: 'ol-second-language', name: 'Second Language (Sinhala/Tamil)', icon: '🗣️', category: 'category1', color: 'from-cyan-500 to-teal-500' },
    { id: 'ol-foreign-language', name: 'Foreign Language (French/Japanese/German)', icon: '🌐', category: 'category1', color: 'from-sky-500 to-blue-500' },
    { id: 'ol-commerce', name: 'Business & Accounting Studies', icon: '📊', category: 'category1', color: 'from-emerald-500 to-teal-500' },
    { id: 'ol-geography', name: 'Geography', icon: '🌍', category: 'category1', color: 'from-lime-500 to-green-500' },
    { id: 'ol-civic', name: 'Civic Education', icon: '🏛️', category: 'category1', color: 'from-indigo-500 to-purple-500' },
    { id: 'ol-entrepreneurship', name: 'Entrepreneurship Studies', icon: '💼', category: 'category1', color: 'from-amber-500 to-orange-500' },

    // Category II - සෞන්දර්ය/සාහිත්‍ය
    { id: 'ol-eastern-music', name: 'Eastern Music', icon: '🎵', category: 'category2', color: 'from-pink-500 to-rose-500' },
    { id: 'ol-western-music', name: 'Western Music', icon: '🎶', category: 'category2', color: 'from-violet-500 to-purple-500' },
    { id: 'ol-dance', name: 'Dance (Udarata/Pahatarata/Sabaragamu)', icon: '💃', category: 'category2', color: 'from-fuchsia-500 to-pink-500' },
    { id: 'ol-art', name: 'Art', icon: '🎨', category: 'category2', color: 'from-orange-500 to-amber-500' },
    { id: 'ol-drama', name: 'Drama & Theatre (Sinhala/Tamil/English)', icon: '🎭', category: 'category2', color: 'from-red-500 to-rose-500' },
    { id: 'ol-english-literature', name: 'English Literature', icon: '📝', category: 'category2', color: 'from-blue-500 to-indigo-500' },
    { id: 'ol-sinhala-literature', name: 'Sinhala Literature', icon: '📚', category: 'category2', color: 'from-amber-500 to-yellow-500' },

    // Category III - තාක්ෂණ/වෘත්තීය
    { id: 'ol-ict', name: 'Information & Communication Technology', icon: '💻', category: 'category3', color: 'from-cyan-500 to-blue-500' },
    { id: 'ol-agriculture', name: 'Agriculture & Food Technology', icon: '🌾', category: 'category3', color: 'from-green-500 to-lime-500' },
    { id: 'ol-home-economics', name: 'Home Economics', icon: '🏠', category: 'category3', color: 'from-rose-500 to-pink-500' },
    { id: 'ol-health', name: 'Health & Physical Education', icon: '❤️', category: 'category3', color: 'from-red-500 to-rose-500' },
    { id: 'ol-design-tech', name: 'Design & Mechanical Technology', icon: '🔧', category: 'category3', color: 'from-slate-500 to-gray-500' },
    { id: 'ol-electrical-tech', name: 'Electrical & Electronic Technology', icon: '⚡', category: 'category3', color: 'from-yellow-500 to-amber-500' },
    { id: 'ol-construction-tech', name: 'Construction Technology', icon: '🏗️', category: 'category3', color: 'from-orange-500 to-red-500' },
    { id: 'ol-media', name: 'Communication & Media Studies', icon: '📺', category: 'category3', color: 'from-purple-500 to-indigo-500' }
  ]

  // ✅ Filter subjects by category
  const getFilteredSubjects = () => {
    if (selectedCategory === 'all') return olSubjects
    if (selectedCategory === 'core') return olSubjects.filter(s => s.category === 'core')
    return olSubjects.filter(s => s.category === selectedCategory)
  }

  // ✅ Category labels
  const categoryLabels = {
    'all': 'All Subjects',
    'core': 'Core Subjects (අනිවාර්ය)',
    'category1': 'Category I - Language/Business',
    'category2': 'Category II - Arts/Literature',
    'category3': 'Category III - Technology/Vocational'
  }

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)

        if (user) {
          await updateDailyStreak(user.id)
        }

        if (user) {
          const userStats = await getUserStats(user.id)
          setStats({
            completed: userStats.lessonsCompleted || 0,
            streak: userStats.streak || 0,
            points: userStats.points || 0,
            badges: userStats.badges || []
          })
        }

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-emerald-200 dark:border-emerald-800 rounded-full"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="mt-6 text-slate-500 dark:text-slate-400">Loading your O/L Dashboard...</p>
        </div>
      </div>
    )
  }

  const filteredSubjects = getFilteredSubjects()
  const coreCount = olSubjects.filter(s => s.category === 'core').length
  const category1Count = olSubjects.filter(s => s.category === 'category1').length
  const category2Count = olSubjects.filter(s => s.category === 'category2').length
  const category3Count = olSubjects.filter(s => s.category === 'category3').length

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50/30 to-cyan-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      
      {/* Navbar */}
      <nav className="glass sticky top-0 z-50 border-b border-white/20 dark:border-white/5 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/25">
              <School className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Akura O/L
              </h1>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 -mt-0.5 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-400" />
                G.C.E. Ordinary Level
              </p>
            </div>
          </div>

          <Link href="/student/ai" className="px-4 py-2 text-sm bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:shadow-lg hover:shadow-emerald-500/25 transition flex items-center gap-2">
            <Brain className="w-4 h-4" />
            AI Help
          </Link>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 bg-white/50 dark:bg-slate-800/50 px-4 py-2 rounded-2xl border border-white/20 dark:border-white/5">
              <div className="flex items-center gap-1.5 text-xs">
                <Flame className="w-4 h-4 text-orange-500" />
                <span className="font-bold text-slate-700 dark:text-white">{stats.streak}</span>
              </div>
              <div className="w-px h-4 bg-slate-200 dark:bg-slate-600" />
              <div className="flex items-center gap-1.5 text-xs">
                <Star className="w-4 h-4 text-amber-500" />
                <span className="font-bold text-slate-700 dark:text-white">{stats.points}</span>
              </div>
              <div className="w-px h-4 bg-slate-200 dark:bg-slate-600" />
              <div className="flex items-center gap-1.5 text-xs">
                <Award className="w-4 h-4 text-purple-500" />
                <span className="font-bold text-slate-700 dark:text-white">{stats.badges.length}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-slate-700 dark:text-white hidden sm:block">
                {user?.user_metadata?.full_name || 'Student'}
              </span>
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg shadow-emerald-500/25">
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
        
        {/* Hero */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 p-8 mb-8 shadow-2xl shadow-emerald-500/25">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-10"></div>
          
          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs text-white font-medium">
                  🎓 G.C.E. Ordinary Level
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white">
                Welcome back, {user?.user_metadata?.full_name?.split(' ')[0] || 'Student'}! 👋
              </h2>
              <p className="text-emerald-100 mt-2 text-lg">
                Choose 6 Core + 3 Optional subjects for your O/L exam
              </p>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-4 text-center min-w-[100px]">
                <p className="text-2xl font-bold text-white">{stats.completed}</p>
                <p className="text-xs text-emerald-100">Lessons Done</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-4 text-center min-w-[100px]">
                <p className="text-2xl font-bold text-white flex items-center justify-center gap-1">
                  🔥 {stats.streak}
                </p>
                <p className="text-xs text-emerald-100">Day Streak</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="glass rounded-2xl p-4 border border-white/20 dark:border-white/5 text-center">
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{coreCount}</div>
            <div className="text-sm text-slate-500 dark:text-slate-400">Core Subjects</div>
          </div>
          <div className="glass rounded-2xl p-4 border border-white/20 dark:border-white/5 text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{category1Count}</div>
            <div className="text-sm text-slate-500 dark:text-slate-400">Category I</div>
          </div>
          <div className="glass rounded-2xl p-4 border border-white/20 dark:border-white/5 text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{category2Count}</div>
            <div className="text-sm text-slate-500 dark:text-slate-400">Category II</div>
          </div>
          <div className="glass rounded-2xl p-4 border border-white/20 dark:border-white/5 text-center">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{category3Count}</div>
            <div className="text-sm text-slate-500 dark:text-slate-400">Category III</div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          {Object.keys(categoryLabels).map((key) => (
            <button
              key={key}
              onClick={() => setSelectedCategory(key)}
              className={`px-4 py-2 rounded-xl text-sm transition ${
                selectedCategory === key
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25'
                  : 'glass text-slate-600 dark:text-slate-400 hover:bg-white/30'
              }`}
            >
              {categoryLabels[key]}
            </button>
          ))}
        </div>

        {/* O/L Subjects Grid */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white">
              {selectedCategory === 'all' ? 'All O/L Subjects' : categoryLabels[selectedCategory]}
            </h3>
            <span className="text-sm text-slate-500 dark:text-slate-400">{filteredSubjects.length} subjects</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSubjects.map((subject, index) => (
              <motion.div
                key={subject.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-2xl transition-all duration-300"
              >
                <Link href={`/student/ol-subject/${subject.id}`} className="block p-6 relative">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className={`text-4xl mb-2 float group-hover:scale-110 transition-transform duration-300`}>
                        {subject.icon}
                      </div>
                      <h4 className="text-lg font-bold text-slate-800 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">
                        {subject.name}
                      </h4>
                      <span className={`text-xs px-2 py-0.5 rounded-full inline-block mt-1 bg-gradient-to-r ${subject.color} text-white`}>
                        {subject.category === 'core' ? 'Core' : `Category ${subject.category.replace('category', '')}`}
                      </span>
                    </div>
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${subject.color} opacity-10 group-hover:opacity-20 transition`}></div>
                  </div>
                  
                  <div className="mt-4 flex items-center text-sm font-medium text-emerald-600 dark:text-emerald-400 group-hover:gap-2 transition-all">
                    <span>Explore</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>

                  <div className="absolute inset-0 border-2 border-transparent group-hover:border-emerald-500/20 rounded-2xl transition-all duration-300 pointer-events-none"></div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Link href="/student/quizzes" className="block">
            <motion.div whileHover={{ y: -4 }} className="glass rounded-2xl p-4 border border-white/20 dark:border-white/5 flex items-center gap-4 cursor-pointer hover:border-amber-300 transition">
              <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
                <BookOpen className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-white">Past Papers</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Test your knowledge</p>
              </div>
              <div className="ml-auto">
                <span className="text-xs text-amber-600 dark:text-amber-400">→</span>
              </div>
            </motion.div>
          </Link>

          <Link href="/student/ai" className="block">
            <motion.div whileHover={{ y: -4 }} className="glass rounded-2xl p-4 border border-white/20 dark:border-white/5 flex items-center gap-4 cursor-pointer hover:border-emerald-300 transition">
              <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
                <Brain className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-white">AI Assistant</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Ask anything 24/7</p>
              </div>
              <div className="ml-auto">
                <span className="text-xs text-emerald-600 dark:text-emerald-400">→</span>
              </div>
            </motion.div>
          </Link>

          <Link href="/student/groups" className="block">
            <motion.div whileHover={{ y: -4 }} className="glass rounded-2xl p-4 border border-white/20 dark:border-white/5 flex items-center gap-4 cursor-pointer hover:border-purple-300 transition">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-white">Study Groups</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Learn together</p>
              </div>
              <div className="ml-auto">
                <span className="text-xs text-purple-600 dark:text-purple-400">→</span>
              </div>
            </motion.div>
          </Link>

          <Link href="/student/analytics" className="block">
            <motion.div whileHover={{ y: -4 }} className="glass rounded-2xl p-4 border border-white/20 dark:border-white/5 flex items-center gap-4 cursor-pointer hover:border-blue-300 transition">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-white">Analytics</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Track your progress</p>
              </div>
              <div className="ml-auto">
                <span className="text-xs text-blue-600 dark:text-blue-400">→</span>
              </div>
            </motion.div>
          </Link>
        </div>

        {/* Motivation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div whileHover={{ y: -4 }} className="glass rounded-2xl p-6 border border-white/20 dark:border-white/5 text-center">
            <div className="text-4xl mb-3 float">🧘</div>
            <h4 className="font-bold text-slate-800 dark:text-white">Stress-Free Learning</h4>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Stories & mindmaps for easy memory</p>
          </motion.div>
          
          <motion.div whileHover={{ y: -4 }} className="glass rounded-2xl p-6 border border-white/20 dark:border-white/5 text-center">
            <div className="text-4xl mb-3 float">🏆</div>
            <h4 className="font-bold text-slate-800 dark:text-white">Daily Streak</h4>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Stay motivated with rewards</p>
          </motion.div>
          
          <motion.div whileHover={{ y: -4 }} className="glass rounded-2xl p-6 border border-white/20 dark:border-white/5 text-center">
            <div className="text-4xl mb-3 float">🤖</div>
            <h4 className="font-bold text-slate-800 dark:text-white">AI Assistant</h4>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">24/7 help when you're stuck</p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}