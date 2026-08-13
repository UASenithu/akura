'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import { getQuiz, getUserQuizAttempts } from '@/app/actions/quiz'
import { motion } from 'framer-motion'
import { Trophy, CheckCircle, XCircle, Clock, ArrowLeft, BookOpen, Sparkles } from 'lucide-react'

export default function QuizResultPage({ params }) {
  const router = useRouter()
  const { quizId } = use(params)
  
  const [user, setUser] = useState(null)
  const [quiz, setQuiz] = useState(null)
  const [attempt, setAttempt] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)

        // Get quiz details
        const { quiz: quizData, error: quizError } = await getQuiz(quizId)
        if (quizError || !quizData) {
          setError('Quiz not found')
          setLoading(false)
          return
        }
        setQuiz(quizData)

        // Get user's attempt
        const { attempts } = await getUserQuizAttempts(user.id)
        const userAttempt = attempts.find(a => a.quiz_id === quizId)
        if (userAttempt) {
          setAttempt(userAttempt)
        }
      } catch (error) {
        console.error('Error fetching results:', error)
        setError('Failed to load results')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [quizId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-slate-600 dark:text-slate-400">Loading results...</p>
        </div>
      </div>
    )
  }

  if (error || !attempt) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">{error || 'No attempt found'}</h2>
          <Link href="/student/quizzes" className="mt-4 inline-block text-indigo-600 hover:underline">
            Back to Quizzes
          </Link>
        </div>
      </div>
    )
  }

  const passed = attempt.percentage >= 50
  const totalQuestions = quiz?.questions?.length || 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50/30 to-pink-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      
      <nav className="glass sticky top-0 z-50 border-b border-white/20 dark:border-white/5 px-6 py-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="p-2 hover:bg-white/20 rounded-xl transition">
              <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-800 dark:text-white">
                {quiz?.title} - Results
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-indigo-400" />
                {quiz?.subjects?.name}
              </p>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8">
        
        {/* Score Card */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`glass rounded-3xl p-8 border ${
            passed 
              ? 'border-emerald-500/30 dark:border-emerald-500/20' 
              : 'border-red-500/30 dark:border-red-500/20'
          } text-center mb-8`}
        >
          <div className="text-6xl mb-4">
            {passed ? '🎉' : '💪'}
          </div>
          
          <h2 className={`text-3xl font-bold ${
            passed ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
          }`}>
            {passed ? 'You Passed!' : 'Keep Trying!'}
          </h2>
          
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            You scored {attempt.score} out of {attempt.total_marks} marks
          </p>
          
          <div className="mt-6 inline-block">
            <div className="relative w-32 h-32 mx-auto">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-slate-200 dark:text-slate-700"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  className={`${passed ? 'text-emerald-500' : 'text-red-500'}`}
                  strokeDasharray="351.858"
                  strokeDashoffset={351.858 - (351.858 * (attempt.percentage || 0)) / 100}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-bold text-slate-800 dark:text-white">
                  {attempt.percentage}%
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-8 mt-4 text-sm text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {Math.floor(attempt.time_taken / 60)}m {(attempt.time_taken % 60)}s
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              {totalQuestions} questions
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="glass rounded-2xl p-4 text-center border border-white/20 dark:border-white/5">
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {attempt.score}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Correct</div>
          </div>
          <div className="glass rounded-2xl p-4 text-center border border-white/20 dark:border-white/5">
            <div className="text-2xl font-bold text-red-500">
              {attempt.total_marks - attempt.score}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Incorrect</div>
          </div>
          <div className="glass rounded-2xl p-4 text-center border border-white/20 dark:border-white/5">
            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              {Math.round((attempt.score / attempt.total_marks) * 100)}%
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Accuracy</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-4">
          <Link
            href="/student/quizzes"
            className="flex-1 min-w-[150px] text-center py-3 glass rounded-xl border border-white/20 dark:border-white/5 text-slate-700 dark:text-white hover:bg-white/30 transition"
          >
            📚 All Quizzes
          </Link>
          <Link
            href={`/student/quiz/${quizId}`}
            className="flex-1 min-w-[150px] text-center py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:shadow-lg hover:shadow-indigo-500/25 transition"
          >
            🔄 Retry Quiz
          </Link>
        </div>
      </div>
    </div>
  )
}