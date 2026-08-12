'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { signOut } from '@/app/actions/auth'
import { getLessons, getSubjects } from '@/app/actions/lessons'
import Link from 'next/link'
import { Plus, Edit, Trash2, BookOpen, Users, Layers } from 'lucide-react'

export default function AdminDashboard() {
  const [user, setUser] = useState(null)
  const [lessons, setLessons] = useState([])
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalLessons: 0,
    totalSubjects: 0,
    totalStudents: 0
  })

  useEffect(() => {
    async function fetchData() {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      // Get lessons
      const { lessons } = await getLessons()
      setLessons(lessons || [])

      // Get subjects
      const { subjects } = await getSubjects()
      setSubjects(subjects || [])

     
      // Get student count - FIXED
      const { count, error: countError } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'student')

      if (countError) {
        console.error('Error counting students:', countError)
      }

      setStats({
        totalLessons: lessons?.length || 0,
        totalSubjects: subjects?.length || 0,
        totalStudents: count || 0
      })

      setLoading(false)
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50 dark:bg-slate-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading Admin Panel...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      {/* Navbar */}
      <nav className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-slate-700 px-6 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">🔐 Akura Admin</h1>
            <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-1 rounded-full">
              Admin Panel
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 dark:text-gray-300">
              👋 {user?.user_metadata?.full_name || 'Admin'}
            </span>
            <form action={signOut}>
              <button type="submit" className="px-4 py-2 text-sm bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition">
                Logout
              </button>
            </form>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Dashboard</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your Akura content</p>
          </div>
          <Link
            href="/admin/lessons/new"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition shadow-lg shadow-blue-600/25"
          >
            <Plus className="w-4 h-4" />
            Add New Lesson
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-md p-6 border border-blue-100 dark:border-slate-700">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Lessons</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats.totalLessons}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-md p-6 border border-green-100 dark:border-slate-700">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                <Layers className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Subjects</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats.totalSubjects}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-md p-6 border border-purple-100 dark:border-slate-700">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Students</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats.totalStudents}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Lessons Table */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-md border border-gray-200 dark:border-slate-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">📚 Recent Lessons</h3>
          </div>
          
          {lessons.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-slate-700/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Subject</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Module</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Created</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                  {lessons.slice(0, 10).map((lesson) => (
                    <tr key={lesson.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition">
                      <td className="px-6 py-4 text-sm text-gray-800 dark:text-white font-medium">{lesson.title}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{lesson.subjects?.name || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{lesson.modules?.title || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-500">
                        {new Date(lesson.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/lessons/edit/${lesson.id}`}
                            className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <form action={async () => {
                            const formData = new FormData()
                            formData.append('id', lesson.id)
                            await deleteLesson(formData)
                          }}>
                            <button
                              type="submit"
                              className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition"
                              onClick={(e) => {
                                if (!confirm('Delete this lesson?')) e.preventDefault()
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <p className="text-lg">No lessons yet</p>
              <p className="text-sm mt-1">Click "Add New Lesson" to get started</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}