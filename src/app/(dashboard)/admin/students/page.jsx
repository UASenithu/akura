'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, Users, Search, Filter, 
  CheckCircle, XCircle, Ban, UserCheck, 
  Shield, Mail, Calendar, Award, ChevronDown,
  Eye, Edit, MoreVertical
} from 'lucide-react'

export default function AdminStudentsPage() {
  const router = useRouter()
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingStudent, setEditingStudent] = useState(null)

  useEffect(() => {
    fetchStudents()
  }, [])

  async function fetchStudents() {
    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          user_progress (lesson_id, completed),
          quiz_attempts (percentage, quiz_id)
        `)
        .eq('role', 'student')
        .order('created_at', { ascending: false })

      if (error) throw error
      setStudents(data || [])
    } catch (error) {
      console.error('Error fetching students:', error)
      alert('Error loading students: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleUpdateStudent(formData) {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          full_name: formData.full_name,
          stream: formData.stream,
          is_active: formData.is_active,
          is_approved: formData.is_approved,
          role: formData.role
        })
        .eq('id', formData.id)

      if (error) throw error
      setShowEditModal(false)
      fetchStudents()
    } catch (error) {
      alert('Error updating student: ' + error.message)
    }
  }

  async function toggleBan(studentId, currentStatus) {
    if (!confirm(`Are you sure you want to ${currentStatus ? 'ban' : 'unban'} this student?`)) return
    
    try {
      const { error } = await supabase
        .from('users')
        .update({ is_active: !currentStatus })
        .eq('id', studentId)

      if (error) throw error
      fetchStudents()
    } catch (error) {
      alert('Error updating status: ' + error.message)
    }
  }

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          student.email?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || 
                          (filterStatus === 'active' && student.is_active !== false) ||
                          (filterStatus === 'banned' && student.is_active === false) ||
                          (filterStatus === 'approved' && student.is_approved !== false) ||
                          (filterStatus === 'pending' && student.is_approved === false)
    return matchesSearch && matchesFilter
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-slate-600 dark:text-slate-400">Loading students...</p>
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
                <Users className="w-5 h-5 text-indigo-500" />
                Student Management
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">Manage registered students</p>
            </div>
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400">
            {filteredStudents.length} students
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="glass rounded-2xl p-4 border border-white/20 dark:border-white/5 text-center">
            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{students.length}</div>
            <div className="text-sm text-slate-500 dark:text-slate-400">Total Students</div>
          </div>
          <div className="glass rounded-2xl p-4 border border-white/20 dark:border-white/5 text-center">
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {students.filter(s => s.is_active !== false).length}
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400">Active</div>
          </div>
          <div className="glass rounded-2xl p-4 border border-white/20 dark:border-white/5 text-center">
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {students.filter(s => s.is_approved === false).length}
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400">Pending Approval</div>
          </div>
          <div className="glass rounded-2xl p-4 border border-white/20 dark:border-white/5 text-center">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {students.filter(s => s.is_active === false).length}
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400">Banned</div>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 glass rounded-xl border border-white/20 dark:border-white/5 text-slate-700 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 glass rounded-xl border border-white/20 dark:border-white/5 text-slate-700 dark:text-white focus:ring-2 focus:ring-indigo-500 transition"
          >
            <option value="all">All Students</option>
            <option value="active">Active</option>
            <option value="banned">Banned</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending Approval</option>
          </select>
        </div>

        {/* Students Table */}
        <div className="glass rounded-2xl border border-white/20 dark:border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50/50 dark:bg-slate-700/30">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Student</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Stream</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Joined</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Progress</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {filteredStudents.map((student) => {
                  const completedLessons = student.user_progress?.filter(p => p.completed).length || 0
                  const totalLessons = student.user_progress?.length || 0
                  const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0
                  const avgScore = student.quiz_attempts?.length > 0 
                    ? Math.round(student.quiz_attempts.reduce((a, b) => a + b.percentage, 0) / student.quiz_attempts.length)
                    : 0

                  return (
                    <tr key={student.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-700/20 transition">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {student.full_name?.[0] || 'S'}
                          </div>
                          <div>
                            <p className="font-medium text-slate-800 dark:text-white">{student.full_name}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{student.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
                        {student.stream || 'Not set'}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">
                        {new Date(student.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{progress}%</span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          Avg Quiz: {avgScore}%
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {student.is_approved === false && (
                            <span className="px-2 py-0.5 text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-full">Pending</span>
                          )}
                          {student.is_active === false ? (
                            <span className="px-2 py-0.5 text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full">Banned</span>
                          ) : (
                            <span className="px-2 py-0.5 text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full">Active</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setEditingStudent(student)
                              setShowEditModal(true)
                            }}
                            className="p-1.5 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => toggleBan(student.id, student.is_active !== false)}
                            className={`p-1.5 rounded-lg transition ${
                              student.is_active !== false 
                                ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20' 
                                : 'text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
                            }`}
                          >
                            {student.is_active !== false ? <Ban className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => {
                              // View student details - show performance
                              setSelectedStudent(student)
                            }}
                            className="p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-lg transition"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Edit Student Modal */}
      {showEditModal && editingStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">✏️ Edit Student</h3>
            <form onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.target)
              const data = {
                id: editingStudent.id,
                full_name: formData.get('full_name'),
                stream: formData.get('stream'),
                is_active: formData.get('is_active') === 'true',
                is_approved: formData.get('is_approved') === 'true',
                role: formData.get('role')
              }
              handleUpdateStudent(data)
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</label>
                  <input
                    type="text"
                    name="full_name"
                    defaultValue={editingStudent.full_name}
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Stream</label>
                  <select
                    name="stream"
                    defaultValue={editingStudent.stream || ''}
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="">Not set</option>
                    <option value="Physical Science">Physical Science</option>
                    <option value="Biological Science">Biological Science</option>
                    <option value="Commerce">Commerce</option>
                    <option value="Technology">Technology</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Status</label>
                  <select
                    name="is_active"
                    defaultValue={editingStudent.is_active !== false ? 'true' : 'false'}
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="true">Active</option>
                    <option value="false">Banned</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Approval</label>
                  <select
                    name="is_approved"
                    defaultValue={editingStudent.is_approved !== false ? 'true' : 'false'}
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="true">Approved</option>
                    <option value="false">Pending</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Role</label>
                  <select
                    name="role"
                    defaultValue={editingStudent.role || 'student'}
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="student">Student</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:shadow-lg transition"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-6 py-2 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-300 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}