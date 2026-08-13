'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import { getQuizzes } from '@/app/actions/quiz'
import { motion } from 'framer-motion'
import { Plus, Edit, Trash2, BookOpen, Clock, Target, Users, ArrowLeft } from 'lucide-react'

export default function AdminQuizzesPage() {
  const router = useRouter()
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const { quizzes: quizzesData } = await getQuizzes()
        setQuizzes(quizzesData || [])
      } catch (error) {
        console.error('Error fetching quizzes:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleDelete = async (quizId) => {
    if (!confirm('Are you sure you want to delete this quiz?')) return

    try {
      const { error } = await supabase
        .from('quizzes')
        .delete()
        .eq('id', quizId)

      if (error) throw error
      setQuizzes(quizzes.filter(q => q.id !== quizId))
    } catch (error) {
      console.error('Error deleting quiz:', error)
      alert('Failed to delete quiz')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-slate-600 dark:text-slate-400">Loading quizzes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      
      <nav className="glass sticky top-0 z-50 border-b border-white/20 dark:border-white/5 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/admin')} className="p-2 hover:bg-white/20 rounded-xl transition">
              <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-500" />
                Quiz Manager
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">Create and manage quizzes</p>
            </div>
          </div>
          <Link
            href="/admin/quizzes/new"
            className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:shadow-lg transition flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" />
            New Quiz
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="glass rounded-2xl p-4 border border-white/20 dark:border-white/5">
            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{quizzes.length}</div>
            <div className="text-sm text-slate-500 dark:text-slate-400">Total Quizzes</div>
          </div>
          <div className="glass rounded-2xl p-4 border border-white/20 dark:border-white/5">
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {quizzes.filter(q => q.is_published).length}
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400">Published</div>
          </div>
          <div className="glass rounded-2xl p-4 border border-white/20 dark:border-white/5">
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {quizzes.filter(q => !q.is_published).length}
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400">Drafts</div>
          </div>
        </div>

        {/* Quiz List */}
        {quizzes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {quizzes.map((quiz, index) => (
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
                  <div className={`px-3 py-1 rounded-xl text-xs font-medium ${
                    quiz.is_published 
                      ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' 
                      : 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                  }`}>
                    {quiz.is_published ? 'Published' : 'Draft'}
                  </div>
                </div>

                <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                  {quiz.description || 'No description'}
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
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {quiz.attempts_count || 0} attempts
                  </span>
                </div>

                <div className="flex gap-2">
                  <Link
                    href={`/admin/quizzes/edit/${quiz.id}`}
                    className="flex-1 text-center px-4 py-2 glass rounded-xl text-sm text-slate-700 dark:text-white hover:bg-white/30 transition"
                  >
                    <Edit className="w-4 h-4 inline mr-1" />
                    Edit
                  </Link>
                  <Link
                    href={`/admin/quizzes/${quiz.id}/questions`}
                    className="flex-1 text-center px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl text-sm hover:shadow-lg transition"
                  >
                    <BookOpen className="w-4 h-4 inline mr-1" />
                    Questions
                  </Link>
                  <button
                    onClick={() => handleDelete(quiz.id)}
                    className="px-4 py-2 glass rounded-xl text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 glass rounded-3xl border border-white/20 dark:border-white/5">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-slate-700 dark:text-white">No Quizzes Yet</h3>
            <p className="text-slate-500 dark:text-slate-400 mt-2">Create your first quiz!</p>
            <Link
              href="/admin/quizzes/new"
              className="mt-4 inline-block px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:shadow-lg transition"
            >
              + Create Quiz
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}