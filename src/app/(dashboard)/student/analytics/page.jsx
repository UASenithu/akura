'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import { getUserStats } from '@/app/actions/gamification'
import { motion } from 'framer-motion'
import {
  ArrowLeft, Award, Flame, Star, BookOpen,
  TrendingUp, Clock, Calendar, Target,
  BarChart3, PieChart, LineChart,
  ChevronRight, Sparkles, Brain
} from 'lucide-react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
} from 'chart.js'
import { Bar, Pie, Line, Doughnut } from 'react-chartjs-2'

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
)

export default function StudentAnalyticsPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    completed: 0,
    streak: 0,
    points: 0,
    badges: []
  })
  const [quizData, setQuizData] = useState([])
  const [subjectProgress, setSubjectProgress] = useState([])
  const [dailyActivity, setDailyActivity] = useState([])
  const [totalQuizzes, setTotalQuizzes] = useState(0)
  const [averageScore, setAverageScore] = useState(0)

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser()
        setUser(currentUser)

        if (!currentUser) {
          router.push('/login')
          return
        }

        // Get gamification stats
        const userStats = await getUserStats(currentUser.id)
        setStats({
          completed: userStats.lessonsCompleted || 0,
          streak: userStats.streak || 0,
          points: userStats.points || 0,
          badges: userStats.badges || []
        })

        // Get quiz attempts
        const { data: attempts } = await supabase
          .from('quiz_attempts')
          .select('*, quizzes(title, subject_id, subjects(name))')
          .eq('user_id', currentUser.id)
          .order('completed_at', { ascending: true })

        setQuizData(attempts || [])
        setTotalQuizzes(attempts?.length || 0)

        // Calculate average score
        if (attempts?.length > 0) {
          const avg = attempts.reduce((a, b) => a + b.percentage, 0) / attempts.length
          setAverageScore(Math.round(avg))
        }

        // Get subject progress (lessons completed per subject)
        const { data: lessons } = await supabase
          .from('user_progress')
          .select('lesson_id, lessons(subject_id, subjects(name))')
          .eq('user_id', currentUser.id)
          .eq('completed', true)

        // Group by subject
        const subjectMap = {}
        lessons?.forEach(p => {
          const subjectName = p.lessons?.subjects?.name || 'Unknown'
          subjectMap[subjectName] = (subjectMap[subjectName] || 0) + 1
        })
        setSubjectProgress(Object.entries(subjectMap).map(([name, count]) => ({ name, count })))

        // Generate daily activity (last 7 days)
        const today = new Date()
        const daily = []
        for (let i = 6; i >= 0; i--) {
          const date = new Date(today)
          date.setDate(date.getDate() - i)
          const dateStr = date.toISOString().split('T')[0]
          
          // Count lessons completed on this day
          const { count } = await supabase
            .from('user_progress')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', currentUser.id)
            .eq('completed', true)
            .gte('completed_at', `${dateStr}T00:00:00`)
            .lt('completed_at', `${dateStr}T23:59:59`)
          
          daily.push({
            date: dateStr,
            count: count || 0,
            label: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()]
          })
        }
        setDailyActivity(daily)

      } catch (error) {
        console.error('Error fetching analytics:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [router])

  // Chart Data: Daily Activity
  const dailyChartData = {
    labels: dailyActivity.map(d => d.label),
    datasets: [
      {
        label: 'Lessons Completed',
        data: dailyActivity.map(d => d.count),
        backgroundColor: 'rgba(99, 102, 241, 0.6)',
        borderColor: 'rgba(99, 102, 241, 1)',
        borderWidth: 2,
        borderRadius: 8,
      }
    ]
  }

  // Chart Data: Quiz Scores
  const quizChartData = {
    labels: quizData.map((_, i) => `Quiz ${i + 1}`),
    datasets: [
      {
        label: 'Score %',
        data: quizData.map(q => q.percentage),
        backgroundColor: quizData.map(q => 
          q.percentage >= 70 ? 'rgba(34, 197, 94, 0.6)' :
          q.percentage >= 50 ? 'rgba(251, 191, 36, 0.6)' :
          'rgba(239, 68, 68, 0.6)'
        ),
        borderColor: quizData.map(q =>
          q.percentage >= 70 ? 'rgba(34, 197, 94, 1)' :
          q.percentage >= 50 ? 'rgba(251, 191, 36, 1)' :
          'rgba(239, 68, 68, 1)'
        ),
        borderWidth: 2,
        borderRadius: 8,
      }
    ]
  }

  // Chart Data: Subject Progress (Doughnut)
  const subjectChartData = {
    labels: subjectProgress.map(s => s.name),
    datasets: [
      {
        data: subjectProgress.map(s => s.count),
        backgroundColor: [
          'rgba(99, 102, 241, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(251, 191, 36, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(236, 72, 153, 0.8)',
        ],
        borderWidth: 2,
      }
    ]
  }

  // Chart Options
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#64748b',
          font: { size: 12 }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0,0,0,0.05)'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-indigo-200 dark:border-indigo-800 rounded-full"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="mt-6 text-slate-500 dark:text-slate-400">Loading your analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50/30 to-pink-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      
      {/* Navbar */}
      <nav className="glass sticky top-0 z-50 border-b border-white/20 dark:border-white/5 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="p-2 hover:bg-white/20 rounded-xl transition">
              <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-indigo-500" />
                My Analytics
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-indigo-400" />
                Track your progress & performance
              </p>
            </div>
          </div>
          <Link href="/student" className="text-sm text-slate-500 dark:text-slate-400 hover:text-indigo-600 transition">
            Dashboard →
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <motion.div whileHover={{ y: -4 }} className="glass rounded-2xl p-4 border border-white/20 dark:border-white/5 text-center">
            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{stats.completed}</div>
            <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1">
              <BookOpen className="w-4 h-4" /> Lessons
            </div>
          </motion.div>
          <motion.div whileHover={{ y: -4 }} className="glass rounded-2xl p-4 border border-white/20 dark:border-white/5 text-center">
            <div className="text-2xl font-bold text-orange-500">{stats.streak}</div>
            <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1">
              <Flame className="w-4 h-4" /> Day Streak
            </div>
          </motion.div>
          <motion.div whileHover={{ y: -4 }} className="glass rounded-2xl p-4 border border-white/20 dark:border-white/5 text-center">
            <div className="text-2xl font-bold text-amber-500">{stats.points}</div>
            <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1">
              <Star className="w-4 h-4" /> Points
            </div>
          </motion.div>
          <motion.div whileHover={{ y: -4 }} className="glass rounded-2xl p-4 border border-white/20 dark:border-white/5 text-center">
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.badges.length}</div>
            <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1">
              <Award className="w-4 h-4" /> Badges
            </div>
          </motion.div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          
          {/* Daily Activity Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass rounded-2xl p-6 border border-white/20 dark:border-white/5"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-500" />
                Daily Activity
              </h3>
              <span className="text-xs text-slate-500 dark:text-slate-400">Last 7 days</span>
            </div>
            <div className="h-[200px]">
              <Bar data={dailyChartData} options={{
                ...chartOptions,
                plugins: {
                  ...chartOptions.plugins,
                  legend: { display: false }
                }
              }} />
            </div>
          </motion.div>

          {/* Quiz Performance Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass rounded-2xl p-6 border border-white/20 dark:border-white/5"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-500" />
                Quiz Performance
              </h3>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {totalQuizzes} quizzes taken
              </span>
            </div>
            {quizData.length > 0 ? (
              <div className="h-[200px]">
                <Bar data={quizChartData} options={{
                  ...chartOptions,
                  plugins: {
                    ...chartOptions.plugins,
                    legend: { display: false }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      max: 100,
                      grid: { color: 'rgba(0,0,0,0.05)' }
                    },
                    x: {
                      grid: { display: false }
                    }
                  }
                }} />
              </div>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-slate-500 dark:text-slate-400">
                <p>No quiz attempts yet. Take a quiz to see your performance! 📝</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Subject Progress & Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Subject Progress */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass rounded-2xl p-6 border border-white/20 dark:border-white/5"
          >
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-emerald-500" />
              Subject Progress
            </h3>
            {subjectProgress.length > 0 ? (
              <div className="h-[200px]">
                <Doughnut data={subjectChartData} options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: {
                        color: '#64748b',
                        font: { size: 10 }
                      }
                    }
                  }
                }} />
              </div>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-slate-500 dark:text-slate-400">
                <p>No lessons completed yet. Start learning! 📚</p>
              </div>
            )}
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass rounded-2xl p-6 border border-white/20 dark:border-white/5 col-span-2"
          >
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-amber-500" />
              Performance Overview
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/30 dark:bg-slate-700/30 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{averageScore}%</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Avg Quiz Score</div>
              </div>
              <div className="bg-white/30 dark:bg-slate-700/30 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {totalQuizzes > 0 ? Math.round((quizData.filter(q => q.percentage >= 50).length / totalQuizzes) * 100) : 0}%
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Pass Rate</div>
              </div>
              <div className="bg-white/30 dark:bg-slate-700/30 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-amber-500">{stats.badges.length}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Badges Earned</div>
              </div>
              <div className="bg-white/30 dark:bg-slate-700/30 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {stats.completed > 0 ? Math.round((stats.completed / (stats.completed + 10)) * 100) : 0}%
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Overall Progress</div>
              </div>
            </div>

            {/* Badges Display */}
            {stats.badges.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                <h4 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">Your Badges</h4>
                <div className="flex flex-wrap gap-2">
                  {stats.badges.slice(0, 6).map((badge) => (
                    <div key={badge.id} className="flex items-center gap-1.5 px-3 py-1.5 glass rounded-xl border border-white/20 dark:border-white/5 text-xs">
                      <span>{badge.icon}</span>
                      <span className="text-slate-700 dark:text-white">{badge.name}</span>
                    </div>
                  ))}
                  {stats.badges.length > 6 && (
                    <div className="flex items-center px-3 py-1.5 glass rounded-xl border border-white/20 dark:border-white/5 text-xs text-slate-500">
                      +{stats.badges.length - 6} more
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Recent Quiz Results */}
        {quizData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-6 glass rounded-2xl p-6 border border-white/20 dark:border-white/5"
          >
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-500" />
              Recent Quiz Results
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                    <th className="pb-2 px-3">Quiz</th>
                    <th className="pb-2 px-3">Subject</th>
                    <th className="pb-2 px-3">Score</th>
                    <th className="pb-2 px-3">Status</th>
                    <th className="pb-2 px-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {quizData.slice(-5).reverse().map((q, i) => (
                    <tr key={i} className="border-b border-slate-100 dark:border-slate-700/50">
                      <td className="py-2 px-3 text-sm text-slate-700 dark:text-white">{q.quizzes?.title || 'Quiz'}</td>
                      <td className="py-2 px-3 text-sm text-slate-500 dark:text-slate-400">{q.quizzes?.subjects?.name || 'General'}</td>
                      <td className="py-2 px-3 text-sm font-bold">{q.percentage}%</td>
                      <td className="py-2 px-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          q.percentage >= 70 ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' :
                          q.percentage >= 50 ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' :
                          'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                        }`}>
                          {q.percentage >= 70 ? '✅ Excellent' : q.percentage >= 50 ? '⚠️ Good' : '❌ Needs Work'}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-sm text-slate-500 dark:text-slate-400">
                        {new Date(q.completed_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}