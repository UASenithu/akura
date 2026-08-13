'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import { getQuiz, submitQuiz } from '@/app/actions/quiz'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, ChevronLeft, ChevronRight, Send, AlertCircle, CheckCircle, XCircle } from 'lucide-react'

export default function TakeQuizPage({ params }) {
  const router = useRouter()
  const { quizId } = use(params)
  
  const [user, setUser] = useState(null)
  const [quiz, setQuiz] = useState(null)
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({})
  const [currentIndex, setCurrentIndex] = useState(0)
  const [timeLeft, setTimeLeft] = useState(0)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [startTime, setStartTime] = useState(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)

        const { quiz: quizData, error } = await getQuiz(quizId)
        if (error || !quizData) {
          setError('Quiz not found')
          setLoading(false)
          return
        }

        setQuiz(quizData)
        setQuestions(quizData.questions || [])
        setTimeLeft((quizData.time_limit || 60) * 60)
        setStartTime(Date.now())

        // Initialize answers
        const initialAnswers = {}
        quizData.questions.forEach(q => {
          initialAnswers[q.id] = null
        })
        setAnswers(initialAnswers)
      } catch (error) {
        console.error('Error fetching quiz:', error)
        setError('Failed to load quiz')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [quizId])

  // Timer
  useEffect(() => {
    if (loading || submitting || timeLeft <= 0) return

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          handleSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft, loading, submitting])

  const handleAnswer = (questionId, answerIndex) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }))
  }

  const handleSubmit = async () => {
    if (submitting) return

    // Check if all questions answered
    const unanswered = Object.values(answers).filter(a => a === null).length
    if (unanswered > 0) {
      if (!confirm(`You have ${unanswered} unanswered questions. Submit anyway?`)) {
        return
      }
    }

    setSubmitting(true)
    
    try {
      const timeTaken = Math.floor((Date.now() - startTime) / 1000)
      
      const formData = new FormData()
      formData.append('quizId', quizId)
      formData.append('userId', user.id)
      formData.append('answers', JSON.stringify(answers))
      formData.append('timeTaken', timeTaken)

      const result = await submitQuiz(formData)
      
      if (result.error) {
        setError(result.error)
        setSubmitting(false)
        return
      }

      router.push(`/student/quiz/result/${quizId}`)
    } catch (error) {
      console.error('Error submitting quiz:', error)
      setError('Failed to submit quiz')
      setSubmitting(false)
    }
  }

  const goToQuestion = (index) => {
    setCurrentIndex(index)
  }

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const prevQuestion = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-slate-600 dark:text-slate-400">Loading quiz...</p>
        </div>
      </div>
    )
  }

  if (error || !quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">{error || 'Quiz not found'}</h2>
          <Link href="/student/quizzes" className="mt-4 inline-block text-indigo-600 hover:underline">
            Back to Quizzes
          </Link>
        </div>
      </div>
    )
  }

  const currentQuestion = questions[currentIndex]
  const totalQuestions = questions.length
  const answeredCount = Object.values(answers).filter(a => a !== null).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50/30 to-pink-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      
      <nav className="glass sticky top-0 z-50 border-b border-white/20 dark:border-white/5 px-6 py-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-lg font-bold text-slate-800 dark:text-white">{quiz.title}</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Question {currentIndex + 1} of {totalQuestions}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium ${
              timeLeft < 60 ? 'text-red-500 bg-red-50 dark:bg-red-900/20' : 'text-slate-600 dark:text-slate-400 glass'
            }`}>
              <Clock className="w-4 h-4" />
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              {answeredCount}/{totalQuestions} answered
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8">
        
        {/* Progress */}
        <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mb-8">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
          />
        </div>

        {/* Question */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="glass rounded-3xl p-8 border border-white/20 dark:border-white/5"
          >
            <div className="mb-6">
              <span className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">
                Question {currentIndex + 1} of {totalQuestions}
              </span>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mt-2">
                {currentQuestion?.question}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {currentQuestion?.marks || 1} mark{currentQuestion?.marks > 1 ? 's' : ''}
              </p>
            </div>

            <div className="space-y-3">
              {currentQuestion?.options?.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswer(currentQuestion.id, idx)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition ${
                    answers[currentQuestion.id] === idx
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300'
                  }`}
                >
                  <span className="text-sm">
                    {String.fromCharCode(65 + idx)}. {option}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-6">
          <button
            onClick={prevQuestion}
            disabled={currentIndex === 0}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl transition ${
              currentIndex === 0
                ? 'opacity-50 cursor-not-allowed'
                : 'glass hover:bg-white/30'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          <div className="flex gap-2">
            {questions.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goToQuestion(idx)}
                className={`w-8 h-8 rounded-full text-xs font-medium transition ${
                  idx === currentIndex
                    ? 'bg-indigo-500 text-white'
                    : answers[questions[idx].id] !== null
                    ? 'bg-emerald-500 text-white'
                    : 'glass hover:bg-white/30'
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>

          {currentIndex === totalQuestions - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:shadow-lg transition disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Quiz'}
              <Send className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={nextQuestion}
              className="flex items-center gap-2 px-6 py-3 glass hover:bg-white/30 rounded-xl transition"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Unanswered warning */}
        {Object.values(answers).filter(a => a === null).length > 0 && (
          <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800 flex items-center gap-2 text-amber-600 dark:text-amber-400 text-sm">
            <AlertCircle className="w-5 h-5" />
            You have {Object.values(answers).filter(a => a === null).length} unanswered questions
          </div>
        )}
      </div>
    </div>
  )
}