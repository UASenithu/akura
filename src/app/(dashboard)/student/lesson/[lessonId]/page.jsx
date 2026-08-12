'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import { motion } from 'framer-motion'
import { ArrowLeft, CheckCircle, Circle, Sparkles, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react'
import { awardPoints } from '@/app/actions/gamification'
import toast, { Toaster } from 'react-hot-toast'

export default function LessonViewPage({ params }) {
  const unwrappedParams = use(params)
  const lessonId = unwrappedParams.lessonId
  
  // Rest of your code...
}

export default function LessonViewPage() {
  const params = useParams()
  const router = useRouter()
  const lessonId = params.lessonId
  
  const [lesson, setLesson] = useState(null)
  const [subject, setSubject] = useState(null)
  const [allLessons, setAllLessons] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)

  useEffect(() => {
    async function fetchData() {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      // Get lesson
      const { data: lessonData } = await supabase
        .from('lessons')
        .select('*, subjects(*)')
        .eq('id', lessonId)
        .single()
      setLesson(lessonData)
      setSubject(lessonData?.subjects)

      // Get all lessons for this subject (for navigation)
      if (lessonData) {
        const { data: lessonsData } = await supabase
          .from('lessons')
          .select('id, title')
          .eq('subject_id', lessonData.subject_id)
          .order('order_num', { ascending: true })
        
        setAllLessons(lessonsData || [])
        const index = lessonsData?.findIndex(l => l.id === lessonId) || 0
        setCurrentIndex(index >= 0 ? index : 0)
      }

      // Check if completed
      if (user) {
        const { data: progressData } = await supabase
          .from('user_progress')
          .select('completed')
          .eq('user_id', user.id)
          .eq('lesson_id', lessonId)
          .single()
        
        setIsCompleted(progressData?.completed || false)
      }
      
      setLoading(false)
    }
    fetchData()
  }, [lessonId])

  async function toggleComplete() {
    if (!user) return

    if (isCompleted) {
      await supabase
        .from('user_progress')
        .delete()
        .eq('user_id', user.id)
        .eq('lesson_id', lessonId)
      setIsCompleted(false)
    } else {
      await supabase
        .from('user_progress')
        .insert({
          user_id: user.id,
          lesson_id: lessonId,
          completed: true,
          completed_at: new Date().toISOString()
        })
      setIsCompleted(true)
    }
  }

  function goToPrevLesson() {
    if (currentIndex > 0) {
      const prevLesson = allLessons[currentIndex - 1]
      router.push(`/student/lesson/${prevLesson.id}`)
    }
  }

  function goToNextLesson() {
    if (currentIndex < allLessons.length - 1) {
      const nextLesson = allLessons[currentIndex + 1]
      router.push(`/student/lesson/${nextLesson.id}`)
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
          <p className="mt-6 text-slate-500 dark:text-slate-400">Loading lesson...</p>
        </div>
      </div>
    )
  }

  if (!lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Lesson Not Found</h2>
          <Link href="/student" className="mt-4 inline-block text-indigo-600 dark:text-indigo-400 hover:underline">
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50/30 to-pink-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      
      {/* Navbar */}
      <nav className="glass sticky top-0 z-50 border-b border-white/20 dark:border-white/5 px-6 py-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Link href={`/student/lessons/${subject?.id}`} className="p-2 hover:bg-white/20 rounded-xl transition">
              <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </Link>
            <div>
              <h1 className="text-lg font-bold text-slate-800 dark:text-white truncate max-w-[200px]">
                {lesson.title}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-indigo-400" />
                {subject?.name}
              </p>
            </div>
          </div>

          
          
          <button
            onClick={toggleComplete}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition ${
              isCompleted 
                ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' 
                : 'bg-white/50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20'
            }`}
          >
            {isCompleted ? (
              <><CheckCircle className="w-4 h-4" /> Completed</>
            ) : (
              <><Circle className="w-4 h-4" /> Mark Complete</>
            )}
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8">
        
        {/* Lesson Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="glass rounded-3xl p-8 border border-white/20 dark:border-white/5"
        >
          {/* Mindmap Image */}
          {lesson.mindmap_url && (
            <div className="mb-6 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
              <img 
                src={lesson.mindmap_url} 
                alt={`Mindmap for ${lesson.title}`}
                className="w-full h-auto"
                onError={(e) => e.target.style.display = 'none'}
              />
            </div>
          )}

          {/* Rich Content */}
          <div 
            className="prose prose-indigo dark:prose-invert max-w-none prose-headings:text-slate-800 dark:prose-headings:text-white prose-p:text-slate-600 dark:prose-p:text-slate-300 prose-a:text-indigo-600 dark:prose-a:text-indigo-400 prose-strong:text-slate-800 dark:prose-strong:text-white prose-li:text-slate-600 dark:prose-li:text-slate-300 prose-img:rounded-xl prose-img:shadow-lg"
            dangerouslySetInnerHTML={{ __html: lesson.story_content || '<p class="text-slate-500 dark:text-slate-400">No content available yet.</p>' }}
          />
        </motion.div>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-8 gap-4">
          <button
            onClick={goToPrevLesson}
            disabled={currentIndex === 0}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl transition ${
              currentIndex === 0
                ? 'opacity-50 cursor-not-allowed bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600'
                : 'glass hover:bg-white/30 dark:hover:bg-slate-700/50 text-slate-700 dark:text-white'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          <span className="text-sm text-slate-500 dark:text-slate-400">
            {currentIndex + 1} / {allLessons.length}
          </span>

          <button
            onClick={goToNextLesson}
            disabled={currentIndex === allLessons.length - 1}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl transition ${
              currentIndex === allLessons.length - 1
                ? 'opacity-50 cursor-not-allowed bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600'
                : 'glass hover:bg-white/30 dark:hover:bg-slate-700/50 text-slate-700 dark:text-white'
            }`}
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Completion Status */}
        <div className="mt-6 glass rounded-2xl p-4 border border-white/20 dark:border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isCompleted ? (
              <CheckCircle className="w-6 h-6 text-emerald-500" />
            ) : (
              <Circle className="w-6 h-6 text-slate-300 dark:text-slate-600" />
            )}
            <span className="text-sm text-slate-600 dark:text-slate-400">
              {isCompleted ? '✅ You completed this lesson!' : '📖 Mark as complete when you finish'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}