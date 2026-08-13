'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import { motion } from 'framer-motion'
import { ArrowLeft, Plus, Edit, Trash2, FileText, Calendar, Download, Eye, X } from 'lucide-react'

export default function AdminPastPapersPage() {
  const router = useRouter()
  const [pastPapers, setPastPapers] = useState([])
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingPaper, setEditingPaper] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    subject_id: '',
    year: new Date().getFullYear(),
    exam_type: 'A/L',
    file_url: '',
    description: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const { data: papers } = await supabase
        .from('past_papers')
        .select('*, subjects(name)')
        .order('year', { ascending: false })

      const { data: subjectsData } = await supabase
        .from('subjects')
        .select('id, name')
      
      setPastPapers(papers || [])
      setSubjects(subjectsData || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      if (editingPaper) {
        const { error } = await supabase
          .from('past_papers')
          .update(formData)
          .eq('id', editingPaper.id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('past_papers')
          .insert(formData)
        if (error) throw error
      }
      setShowAddModal(false)
      setEditingPaper(null)
      setFormData({ title: '', subject_id: '', year: new Date().getFullYear(), exam_type: 'A/L', file_url: '', description: '' })
      fetchData()
    } catch (error) {
      alert('Error: ' + error.message)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this past paper?')) return
    try {
      await supabase.from('past_papers').delete().eq('id', id)
      fetchData()
    } catch (error) {
      alert('Error: ' + error.message)
    }
  }

  function openEdit(paper) {
    setEditingPaper(paper)
    setFormData({
      title: paper.title,
      subject_id: paper.subject_id,
      year: paper.year,
      exam_type: paper.exam_type,
      file_url: paper.file_url || '',
      description: paper.description || ''
    })
    setShowAddModal(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-slate-600 dark:text-slate-400">Loading...</p>
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
                <FileText className="w-5 h-5 text-indigo-500" />
                Past Papers
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">Upload & manage past papers</p>
            </div>
          </div>
          <button
            onClick={() => { setEditingPaper(null); setFormData({ title: '', subject_id: '', year: new Date().getFullYear(), exam_type: 'A/L', file_url: '', description: '' }); setShowAddModal(true) }}
            className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:shadow-lg transition flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" />
            Upload Paper
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="glass rounded-2xl p-4 border border-white/20 dark:border-white/5 text-center">
            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{pastPapers.length}</div>
            <div className="text-sm text-slate-500 dark:text-slate-400">Total Papers</div>
          </div>
          <div className="glass rounded-2xl p-4 border border-white/20 dark:border-white/5 text-center">
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {new Set(pastPapers.map(p => p.year)).size}
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400">Years</div>
          </div>
          <div className="glass rounded-2xl p-4 border border-white/20 dark:border-white/5 text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {new Set(pastPapers.map(p => p.subject_id)).size}
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400">Subjects</div>
          </div>
        </div>

        {/* Papers Grid */}
        {pastPapers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pastPapers.map((paper, index) => (
              <motion.div
                key={paper.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -4 }}
                className="glass rounded-2xl border border-white/20 dark:border-white/5 p-6 hover:border-indigo-300 transition"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="text-3xl">📄</div>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(paper)} className="p-1.5 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(paper.id)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-slate-800 dark:text-white">{paper.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">{paper.subjects?.name}</p>
                
                <div className="flex items-center gap-3 mt-3 text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {paper.year}
                  </span>
                  <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 rounded-full text-indigo-600 dark:text-indigo-400">
                    {paper.exam_type}
                  </span>
                </div>

                {paper.description && (
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 line-clamp-2">{paper.description}</p>
                )}

                {paper.file_url && (
                  <a
                    href={paper.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    <Download className="w-4 h-4" />
                    Download PDF
                  </a>
                )}
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 glass rounded-3xl border border-white/20 dark:border-white/5">
            <div className="text-6xl mb-4">📄</div>
            <h3 className="text-xl font-semibold text-slate-700 dark:text-white">No Past Papers</h3>
            <p className="text-slate-500 dark:text-slate-400 mt-2">Upload your first past paper!</p>
          </div>
        )}

        {/* Add/Edit Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                  {editingPaper ? '✏️ Edit Past Paper' : '📤 Upload Past Paper'}
                </h3>
                <button onClick={() => setShowAddModal(false)} className="text-slate-500 hover:text-red-500">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  placeholder="Title (e.g., Physics 2023 A/L Paper)"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  required
                />
                <select
                  value={formData.subject_id}
                  onChange={(e) => setFormData({ ...formData, subject_id: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  required
                >
                  <option value="">Select Subject</option>
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
                <input
                  type="number"
                  placeholder="Year (e.g., 2023)"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) || new Date().getFullYear() })}
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  required
                />
                <select
                  value={formData.exam_type}
                  onChange={(e) => setFormData({ ...formData, exam_type: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="A/L">A/L</option>
                  <option value="O/L">O/L</option>
                  <option value="Other">Other</option>
                </select>
                <input
                  type="url"
                  placeholder="File URL (Google Drive / PDF link)"
                  value={formData.file_url}
                  onChange={(e) => setFormData({ ...formData, file_url: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
                <textarea
                  placeholder="Description (optional)"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  rows="2"
                />
                <button
                  type="submit"
                  className="w-full py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:shadow-lg transition"
                >
                  {editingPaper ? 'Update' : 'Upload'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}