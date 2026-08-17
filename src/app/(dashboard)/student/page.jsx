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
  Users, BarChart3
} from 'lucide-react'

export default function StudentDashboard() {
  const [user, setUser] = useState(null)
  const [streams, setStreams] = useState([])
  const [userSubjects, setUserSubjects] = useState([])
  const [userStream, setUserStream] = useState('')
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    completed: 0,
    streak: 0,
    points: 0,
    badges: []
  })

  // ✅ A/L Stream Subjects Mapping
  const streamSubjects = {
    'Biological Science': {
      icon: '🧬',
      subjects: ['Biology', 'Chemistry', 'Physics', 'Agricultural Science'],
      description: 'Medical, Health & Agricultural fields'
    },
    'Physical Science': {
      icon: '⚛️',
      subjects: ['Combined Mathematics', 'Physics', 'Chemistry', 'ICT'],
      description: 'Engineering, Computing & Technology fields'
    },
    'Technology': {
      icon: '💻',
      subjects: ['Science for Technology', 'Engineering Technology', 'Bio-Systems Technology', 'ICT', 'Agricultural Science', 'Geography', 'Economics', 'Business Studies', 'Media Studies', 'Art'],
      description: 'Technical & Vocational fields'
    },
    'Commerce': {
      icon: '📊',
      subjects: ['Accounting', 'Business Studies', 'Economics', 'ICT', 'Business Statistics'],
      description: 'Business, Accounting & Management fields'
    },
    'Arts': {
      icon: '🎨',
      subjects: ['Logic', 'Economics', 'Geography', 'Political Science', 'History', 'Sinhala', 'Tamil', 'English', 'French', 'Japanese', 'Chinese', 'Music', 'Dance', 'Drama', 'Art', 'ICT', 'Media Studies'],
      description: 'Law, Humanities & Social Sciences fields'
    }
  }

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)

        if (user) {
          await updateDailyStreak(user.id)
        }

        // ✅ Get user's stream from metadata
        let userStreamFull = user?.user_metadata?.stream || ''
        console.log('📊 Raw stream from metadata:', userStreamFull)
        
        let streamName = ''
        
        // ✅ Try multiple patterns to extract stream name
        if (userStreamFull.includes(' - ')) {
          streamName = userStreamFull.split(' - ')[1]
        } else if (userStreamFull.includes('A/L - ')) {
          streamName = userStreamFull.replace('A/L - ', '')
        } else if (userStreamFull.includes('O/L - ')) {
          streamName = userStreamFull.replace('O/L - ', '')
        } else {
          streamName = userStreamFull
        }
        
        // ✅ Trim and clean
        streamName = streamName.trim()
        console.log('📊 Cleaned stream name:', streamName)
        
        setUserStream(streamName)

        // ✅ Find matching stream in streamSubjects
        let matchedStream = null
        
        // First, try exact match
        if (streamSubjects[streamName]) {
          matchedStream = streamName
        } else {
          // Try case-insensitive match
          const matchKey = Object.keys(streamSubjects).find(
            key => key.toLowerCase() === streamName.toLowerCase()
          )
          if (matchKey) {
            matchedStream = matchKey
          } else {
            // Try partial match
            const partialMatch = Object.keys(streamSubjects).find(
              key => streamName.toLowerCase().includes(key.toLowerCase()) || 
                     key.toLowerCase().includes(streamName.toLowerCase())
            )
            if (partialMatch) {
              matchedStream = partialMatch
            }
          }
        }
        
        console.log('✅ Matched stream:', matchedStream)

        if (matchedStream && streamSubjects[matchedStream]) {
          setUserStream(matchedStream)
          setUserSubjects(streamSubjects[matchedStream].subjects)
          console.log('📚 Subjects found:', streamSubjects[matchedStream].subjects)
        } else {
          console.log('⚠️ No subjects found for stream:', streamName)
          setUserSubjects([])
        }

        const { data: streamsData } = await supabase
          .from('streams')
          .select('*')
        setStreams(streamsData || [])
        
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

  const streamIcon = userStream && streamSubjects[userStream] ? streamSubjects[userStream].icon : '📚'
  const hasSubjects = userSubjects.length > 0
  const streamInfo = userStream && streamSubjects[userStream] ? streamSubjects[userStream] : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50/30 to-pink-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      
      <nav className="glass sticky top-0 z-50 border-b border-white/20 dark:border-white/5 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Akura A/L
              </h1>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 -mt-0.5 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-indigo-400" />
                Advanced Level
              </p>
            </div>
          </div>

          <Link href="/student/ai" className="px-4 py-2 text-sm bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:shadow-lg hover:shadow-indigo-500/25 transition flex items-center gap-2">
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
        
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-8 mb-8 shadow-2xl shadow-indigo-500/25">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-10"></div>
          
          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs text-white font-medium flex items-center gap-1">
                  <span>{streamIcon}</span> {userStream || 'A/L Student'}
                </span>
                {hasSubjects && (
                  <span className="px-3 py-1 bg-emerald-500/30 backdrop-blur-sm rounded-full text-xs text-white">
                    ✅ {userSubjects.length} Subjects
                  </span>
                )}
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white">
                Welcome back, {user?.user_metadata?.full_name?.split(' ')[0] || 'Student'}! 👋
              </h2>
              <p className="text-indigo-100 mt-2 text-lg">
                {hasSubjects 
                  ? `${streamInfo?.description || 'Your Stream'} - ${userSubjects.slice(0, 3).join(', ')}${userSubjects.length > 3 ? ` and ${userSubjects.length - 3} more` : ''}`
                  : 'Select your stream to see subjects'}
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

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <motion.div whileHover={{ y: -4 }} className="glass rounded-2xl p-4 border border-white/20 dark:border-white/5 flex items-center gap-4">
            <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
              <Target className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Lessons Done</p>
              <p className="text-lg font-bold text-slate-800 dark:text-white">{stats.completed}</p>
            </div>
          </motion.div>
          
          <motion.div whileHover={{ y: -4 }} className="glass rounded-2xl p-4 border border-white/20 dark:border-white/5 flex items-center gap-4">
            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
              <Flame className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Streak</p>
              <p className="text-lg font-bold text-slate-800 dark:text-white">{stats.streak} days 🔥</p>
            </div>
          </motion.div>
          
          <motion.div whileHover={{ y: -4 }} className="glass rounded-2xl p-4 border border-white/20 dark:border-white/5 flex items-center gap-4">
            <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
              <Star className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Points</p>
              <p className="text-lg font-bold text-slate-800 dark:text-white">{stats.points} ⭐</p>
            </div>
          </motion.div>
          
          <motion.div whileHover={{ y: -4 }} className="glass rounded-2xl p-4 border border-white/20 dark:border-white/5 flex items-center gap-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
              <Award className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Badges</p>
              <p className="text-lg font-bold text-slate-800 dark:text-white">{stats.badges.length} 🏅</p>
            </div>
          </motion.div>
        </div>

        {hasSubjects && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <span>{streamIcon}</span>
                {userStream} Subjects 📚
              </h3>
              <span className="text-sm text-slate-500 dark:text-slate-400">{userSubjects.length} subjects</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userSubjects.map((subject, index) => (
                <motion.div
                  key={subject}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-2xl transition-all duration-300"
                >
                  <Link href={`/student/subject/${subject.toLowerCase().replace(/\s+/g, '-')}`} className="block p-6 relative">
                    <div className="text-4xl mb-4 float group-hover:scale-110 transition-transform duration-300">
                      {subject.includes('Biology') ? '🧬' :
                       subject.includes('Chemistry') ? '🧪' :
                       subject.includes('Physics') ? '⚛️' :
                       subject.includes('Mathematics') || subject.includes('Maths') ? '📐' :
                       subject.includes('Accounting') ? '📊' :
                       subject.includes('Business') ? '💼' :
                       subject.includes('Economics') ? '📈' :
                       subject.includes('Science') ? '🔬' :
                       subject.includes('Technology') ? '💻' :
                       subject.includes('Engineering') ? '🔧' :
                       subject.includes('ICT') ? '🖥️' :
                       subject.includes('Agriculture') ? '🌾' :
                       subject.includes('Logic') ? '🧠' :
                       subject.includes('Geography') ? '🌍' :
                       subject.includes('History') ? '📜' :
                       subject.includes('Political') ? '🏛️' :
                       subject.includes('Sinhala') ? '📖' :
                       subject.includes('Tamil') ? '📕' :
                       subject.includes('English') ? '📝' :
                       subject.includes('French') ? '🇫🇷' :
                       subject.includes('Japanese') ? '🇯🇵' :
                       subject.includes('Chinese') ? '🇨🇳' :
                       subject.includes('Dancing') ? '💃' :
                       subject.includes('Music') ? '🎵' :
                       subject.includes('Drama') ? '🎭' :
                       subject.includes('Art') ? '🎨' :
                       subject.includes('Media') ? '📺' :
                       '📚'}
                    </div>
                    <h4 className="text-lg font-bold text-slate-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                      {subject}
                    </h4>
                    
                    <div className="mt-4 flex items-center text-sm font-medium text-indigo-600 dark:text-indigo-400 group-hover:gap-2 transition-all">
                      <span>Explore</span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>

                    <div className="absolute inset-0 border-2 border-transparent group-hover:border-indigo-500/20 rounded-2xl transition-all duration-300 pointer-events-none"></div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white">All A/L Streams 📚</h3>
            <span className="text-sm text-slate-500 dark:text-slate-400">{streams.length} available</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {streams.map((stream, index) => (
              <motion.div
                key={stream.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className={`group relative overflow-hidden rounded-2xl border shadow-lg hover:shadow-2xl transition-all duration-300 ${
                  stream.name === userStream 
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' 
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                }`}
              >
                <Link href={`/student/stream/${stream.id}`} className="block p-6 relative">
                  <div className="text-5xl mb-4 float group-hover:scale-110 transition-transform duration-300">
                    {stream.icon || '📖'}
                  </div>
                  <h4 className="text-xl font-bold text-slate-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                    {stream.name}
                  </h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    {stream.description || 'Start your journey'}
                  </p>
                  {stream.name === userStream && (
                    <span className="inline-block mt-1 text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full">
                      ✅ Your Stream
                    </span>
                  )}
                  <div className="mt-4 flex items-center text-sm font-medium text-indigo-600 dark:text-indigo-400 group-hover:gap-2 transition-all">
                    <span>View Subjects</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>

                  <div className="absolute inset-0 border-2 border-transparent group-hover:border-indigo-500/20 rounded-2xl transition-all duration-300 pointer-events-none"></div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

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