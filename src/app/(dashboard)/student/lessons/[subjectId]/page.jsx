'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import { motion } from 'framer-motion'
import { ArrowLeft, BookOpen, CheckCircle, Circle, Sparkles } from 'lucide-react'

export default function LessonsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const subjectId = searchParams.get('subjectId')
  
  const [subject, setSubject] = useState(null)
  const [lessons, setLessons] = useState([])
  const [completedLessons, setCompletedLessons] = useState([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchData() {
      try {
        if (!subjectId) {
          router.push('/student')
          return
        }

        // Get current user
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)

        // Get subject info
        const { data: subjectData, error: subjectError } = await supabase
          .from('subjects')
          .select('*, streams(name, icon)')
          .eq('id', subjectId)
          .single()

        if (subjectError) {
          console.error('Error fetching subject:', subjectError)
          setError('Subject not found')
          setLoading(false)
          return
        }
        setSubject(subjectData)

        // Get lessons for this subject
        const { data: lessonsData, error: lessonsError } = await supabase
          .from('lessons')
          .select('*')
          .eq('subject_id', subjectId)
          .order('order_num', { ascending: true })

        if (lessonsError) {
          console.error('Error fetching lessons:', lessonsError)
          setError('Error loading lessons')
          setLoading(false)
          return
        }
        
        console.log('Lessons found:', lessonsData?.length || 0)
        setLessons(lessonsData || [])

        // Get completed lessons for this user
        if (user) {
          const { data: progressData, error: progressError } = await supabase
            .from('user_progress')
            .select('lesson_id')
            .eq('user_id', user.id)
            .eq('completed', true)
          
          if (!progressError) {
            const completedIds = progressData?.map(p => p.lesson_id) || []
            setCompletedLessons(completedIds)
          }
        }
      } catch (err) {
        console.error('Error:', err)
        setError('Something went wrong')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [subjectId, router])

  async function toggleLessonComplete(lessonId, isCompleted) {
    if (!user) return

    try {
      if (isCompleted) {
        await supabase
          .from('user_progress')
          .delete()
          .eq('user_id', user.id)
          .eq('lesson_id', lessonId)
        
        setCompletedLessons(prev => prev.filter(id => id !== lessonId))
      } else {
        await supabase
          .from('user_progress')
          .insert({
            user_id: user.id,
            lesson_id: lessonId,
            completed: true,
            completed_at: new Date().toISOString()
          })
        
        setCompletedLessons(prev => [...prev, lessonId])
      }
    } catch (err) {
      console.error('Error toggling lesson:', err)
    }
  }

  const progress = lessons.length > 0 
    ? Math.round((completedLessons.length / lessons.length) * 100) 
    : 0

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-indigo-200 dark:border-indigo-800 rounded-full"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="mt-6 text-slate-500 dark:text-slate-400">Loading lessons...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">{error}</h2>
          <Link href="/student" className="mt-4 inline-block text-indigo-600 dark:text-indigo-400 hover:underline">
            Back to Dashboard
          </Link>
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
              <h1 className="text-xl font-bold text-slate-800 dark:text-white">
                {subject?.name || 'Lessons'}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-indigo-400" />
                {subject?.streams?.name || 'Subject'} • {lessons.length} lessons
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-slate-600 dark:text-slate-400">
              <span className="font-bold text-indigo-600 dark:text-indigo-400">{progress}%</span> complete
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8">
        
        {/* Progress Bar */}
        <div className="mb-8 glass rounded-2xl p-6 border border-white/20 dark:border-white/5">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-medium text-slate-700 dark:text-white">
              Your Progress
            </span>
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {completedLessons.length} / {lessons.length} completed
            </span>
          </div>
          <div className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full"
            />
          </div>
        </div>

        {/* Lessons List */}
        {lessons.length > 0 ? (
          <div className="space-y-4">
            {lessons.map((lesson, index) => {
              const isCompleted = completedLessons.includes(lesson.id)
              
              return (
                <motion.div
                  key={lesson.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.01 }}
                  className="glass rounded-2xl border border-white/20 dark:border-white/5 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all duration-300"
                >
                  <div className="flex items-center gap-4 p-4">
                    <button
                      onClick={() => toggleLessonComplete(lesson.id, isCompleted)}
                      className="flex-shrink-0 transition-transform hover:scale-110"
                    >
                      {isCompleted ? (
                        <CheckCircle className="w-8 h-8 text-emerald-500" />
                      ) : (
                        <Circle className="w-8 h-8 text-slate-300 dark:text-slate-600 hover:text-indigo-400 transition" />
                      )}
                    </button>

                    <Link href={`/student/lesson/${lesson.id}`} className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-slate-400 dark:text-slate-500">
                          #{String(index + 1).padStart(2, '0')}
                        </span>
                        <h3 className={`text-lg font-semibold truncate ${
                          isCompleted 
                            ? 'text-slate-400 dark:text-slate-500 line-through' 
                            : 'text-slate-800 dark:text-white'
                        }`}>
                          {lesson.title}
                        </h3>
                      </div>
                      {lesson.mindmap_url && (
                        <div className="mt-1 flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
                          <span>📷 Has mindmap</span>
                        </div>
                      )}
                    </Link>

                    <Link
                    href={`/student/view-lesson/${lesson.id}`}
                    className="flex-shrink-0 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm font-medium rounded-xl hover:shadow-lg hover:shadow-indigo-500/25 transition"
                    >
                    View
                    </Link>
                  </div>
                </motion.div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-16 glass rounded-3xl border border-white/20 dark:border-white/5">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-slate-700 dark:text-white">No Lessons Yet</h3>
            <p className="text-slate-500 dark:text-slate-400 mt-2">Admin will add lessons to this subject soon!</p>
            <Link href="/student" className="mt-4 inline-block text-indigo-600 dark:text-indigo-400 hover:underline">
              Back to Dashboard
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}