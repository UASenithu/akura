'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import { getQuizzes, getUserQuizAttempts } from '@/app/actions/quiz'
import { motion } from 'framer-motion'
import { BookOpen, Clock, Target, Trophy, ArrowLeft, Brain } from 'lucide-react'

export default function QuizzesPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [quizzes, setQuizzes] = useState([])
  const [attempts, setAttempts] = useState({})
  const [loading, setLoading] = useState(true)
  const [subjects, setSubjects] = useState([])
  const [selectedSubject, setSelectedSubject] = useState('all')

  useEffect(() => {
    async function fetchData() {
      try {
        // ✅ Get current user
        const { data: { user: currentUser } } = await supabase.auth.getUser()
        setUser(currentUser)

        // Get subjects
        const { data: subjectsData } = await supabase
          .from('subjects')
          .select('id, name')
        setSubjects(subjectsData || [])

        // Get quizzes
        const { quizzes: quizzesData } = await getQuizzes()
        setQuizzes(quizzesData || [])

        // Get user attempts
        if (currentUser) {
          const { attempts: attemptsData } = await getUserQuizAttempts(currentUser.id)
          const attemptsMap = {}
          attemptsData.forEach(a => {
            attemptsMap[a.quiz_id] = a
          })
          setAttempts(attemptsMap)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const filteredQuizzes = selectedSubject === 'all' 
    ? quizzes 
    : quizzes.filter(q => q.subject_id === selectedSubject)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-indigo-200 dark:border-indigo-800 rounded-full"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="mt-6 text-slate-500 dark:text-slate-400">Loading quizzes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50/30 to-pink-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      
      <nav className="glass sticky top-0 z-50 border-b border-white/20 dark:border-white/5 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="p-2 hover:bg-white/20 rounded-xl transition">
              <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-500" />
                Past Papers & Quizzes
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Brain className="w-3 h-3 text-indigo-400" />
                Test your knowledge
              </p>
            </div>
          </div>
          <Link href="/student" className="text-sm text-slate-500 dark:text-slate-400 hover:text-indigo-600 transition">
            Dashboard →
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="glass rounded-2xl p-4 border border-white/20 dark:border-white/5 text-center">
            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{quizzes.length}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Total Quizzes</div>
          </div>
          <div className="glass rounded-2xl p-4 border border-white/20 dark:border-white/5 text-center">
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {Object.keys(attempts).length}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Attempted</div>
          </div>
          <div className="glass rounded-2xl p-4 border border-white/20 dark:border-white/5 text-center">
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {Object.values(attempts).filter(a => (a.percentage || 0) >= 50).length}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Passed</div>
          </div>
          <div className="glass rounded-2xl p-4 border border-white/20 dark:border-white/5 text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {Object.values(attempts).length > 0 
                ? Math.round(Object.values(attempts).reduce((a, b) => a + (b.percentage || 0), 0) / Object.values(attempts).length)
                : 0}%
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Avg Score</div>
          </div>
        </div>

        {/* Subject Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setSelectedSubject('all')}
            className={`px-4 py-2 rounded-xl text-sm transition ${
              selectedSubject === 'all'
                ? 'bg-indigo-500 text-white'
                : 'glass text-slate-600 dark:text-slate-400 hover:bg-white/30'
            }`}
          >
            All Subjects
          </button>
          {subjects.map((subject) => (
            <button
              key={subject.id}
              onClick={() => setSelectedSubject(subject.id)}
              className={`px-4 py-2 rounded-xl text-sm transition ${
                selectedSubject === subject.id
                  ? 'bg-indigo-500 text-white'
                  : 'glass text-slate-600 dark:text-slate-400 hover:bg-white/30'
              }`}
            >
              {subject.name}
            </button>
          ))}
        </div>

        {/* Quiz List */}
        {filteredQuizzes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredQuizzes.map((quiz, index) => {
              const attempted = attempts[quiz.id]
              const passed = attempted && (attempted.percentage || 0) >= 50

              return (
                <motion.div
                  key={quiz.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -4 }}
                  className="glass rounded-2xl border border-white/20 dark:border-white/5 p-6 hover:border-indigo-300 transition"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-slate-800 dark:text-white">{quiz.title}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{quiz.subjects?.name}</p>
                    </div>
                    {attempted && (
                      <div className={`px-3 py-1 rounded-xl text-xs font-medium ${
                        passed ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                      }`}>
                        {passed ? '✅ Passed' : '❌ Failed'}
                        <span className="ml-1 font-bold">{attempted.percentage}%</span>
                      </div>
                    )}
                  </div>

                  <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                    {quiz.description || 'Test your knowledge with this quiz!'}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mb-4">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {quiz.time_limit || 60} min
                    </span>
                    <span className="flex items-center gap-1">
                      <Target className="w-3 h-3" />
                      Pass: {quiz.passing_score || 50}%
                    </span>
                  </div>

                  {/* ✅ FIXED: Pass userId in URL */}
                  <Link
                    href={attempted ? `/student/quiz/result/${quiz.id}` : `/student/quiz/${quiz.id}?userId=${user?.id || ''}`}
                    className="w-full py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm font-medium rounded-xl hover:shadow-lg hover:shadow-indigo-500/25 transition flex items-center justify-center gap-2"
                  >
                    {attempted ? (
                      <>
                        <Trophy className="w-4 h-4" />
                        View Results
                      </>
                    ) : (
                      <>
                        Start Quiz
                        <ArrowLeft className="w-4 h-4" />
                      </>
                    )}
                  </Link>
                </motion.div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-16 glass rounded-3xl border border-white/20 dark:border-white/5">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-slate-700 dark:text-white">No Quizzes Available</h3>
            <p className="text-slate-500 dark:text-slate-400 mt-2">Check back later for new quizzes!</p>
          </div>
        )}
      </div>
    </div>
  )
}