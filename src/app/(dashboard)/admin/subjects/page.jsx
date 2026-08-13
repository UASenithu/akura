'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import { motion } from 'framer-motion'
import { Plus, Edit, Trash2, BookOpen, Layers, ArrowLeft, X } from 'lucide-react'

export default function AdminSubjectsPage() {
  const router = useRouter()
  const [streams, setStreams] = useState([])
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddStream, setShowAddStream] = useState(false)
  const [showAddSubject, setShowAddSubject] = useState(false)
  const [newStream, setNewStream] = useState({ name: '', description: '', icon: '📚' })
  const [newSubject, setNewSubject] = useState({ name: '', stream_id: '', icon: '📖' })
  const [editingStream, setEditingStream] = useState(null)
  const [editingSubject, setEditingSubject] = useState(null)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const { data: streamsData } = await supabase
        .from('streams')
        .select('*')
        .order('name')
      setStreams(streamsData || [])

      const { data: subjectsData } = await supabase
        .from('subjects')
        .select('*, streams(name)')
        .order('name')
      setSubjects(subjectsData || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleAddStream(e) {
    e.preventDefault()
    try {
      const { data, error } = await supabase
        .from('streams')
        .insert(newStream)
        .select()
      
      if (error) throw error
      setStreams([...streams, data[0]])
      setNewStream({ name: '', description: '', icon: '📚' })
      setShowAddStream(false)
    } catch (error) {
      alert('Error adding stream: ' + error.message)
    }
  }

  async function handleAddSubject(e) {
    e.preventDefault()
    try {
      const { data, error } = await supabase
        .from('subjects')
        .insert(newSubject)
        .select()
      
      if (error) throw error
      setSubjects([...subjects, { ...data[0], streams: { name: streams.find(s => s.id === newSubject.stream_id)?.name } }])
      setNewSubject({ name: '', stream_id: '', icon: '📖' })
      setShowAddSubject(false)
    } catch (error) {
      alert('Error adding subject: ' + error.message)
    }
  }

  async function handleDeleteStream(id) {
    if (!confirm('Delete this stream and all its subjects?')) return
    try {
      await supabase.from('streams').delete().eq('id', id)
      setStreams(streams.filter(s => s.id !== id))
      setSubjects(subjects.filter(s => s.stream_id !== id))
    } catch (error) {
      alert('Error deleting stream: ' + error.message)
    }
  }

  async function handleDeleteSubject(id) {
    if (!confirm('Delete this subject?')) return
    try {
      await supabase.from('subjects').delete().eq('id', id)
      setSubjects(subjects.filter(s => s.id !== id))
    } catch (error) {
      alert('Error deleting subject: ' + error.message)
    }
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
                <Layers className="w-5 h-5 text-indigo-500" />
                Subjects & Streams
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">Manage streams and subjects</p>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="glass rounded-2xl p-4 border border-white/20 dark:border-white/5 text-center">
            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{streams.length}</div>
            <div className="text-sm text-slate-500 dark:text-slate-400">Streams</div>
          </div>
          <div className="glass rounded-2xl p-4 border border-white/20 dark:border-white/5 text-center">
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{subjects.length}</div>
            <div className="text-sm text-slate-500 dark:text-slate-400">Subjects</div>
          </div>
        </div>

        {/* Add Buttons */}
        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={() => setShowAddStream(true)}
            className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:shadow-lg transition flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" />
            Add Stream
          </button>
          <button
            onClick={() => setShowAddSubject(true)}
            className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:shadow-lg transition flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" />
            Add Subject
          </button>
        </div>

        {/* Add Stream Modal */}
        {showAddStream && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Add New Stream</h3>
                <button onClick={() => setShowAddStream(false)} className="text-slate-500 hover:text-red-500">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleAddStream}>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Stream Name (e.g., Physical Science)"
                    value={newStream.name}
                    onChange={(e) => setNewStream({ ...newStream, name: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Description"
                    value={newStream.description}
                    onChange={(e) => setNewStream({ ...newStream, description: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                  <input
                    type="text"
                    placeholder="Icon (emoji)"
                    value={newStream.icon}
                    onChange={(e) => setNewStream({ ...newStream, icon: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    maxLength={2}
                  />
                  <button
                    type="submit"
                    className="w-full py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:shadow-lg transition"
                  >
                    Add Stream
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Subject Modal */}
        {showAddSubject && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Add New Subject</h3>
                <button onClick={() => setShowAddSubject(false)} className="text-slate-500 hover:text-red-500">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleAddSubject}>
                <div className="space-y-3">
                  <select
                    value={newSubject.stream_id}
                    onChange={(e) => setNewSubject({ ...newSubject, stream_id: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    required
                  >
                    <option value="">Select Stream</option>
                    {streams.map(s => (
                      <option key={s.id} value={s.id}>{s.icon} {s.name}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Subject Name (e.g., Physics)"
                    value={newSubject.name}
                    onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Icon (emoji)"
                    value={newSubject.icon}
                    onChange={(e) => setNewSubject({ ...newSubject, icon: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    maxLength={2}
                  />
                  <button
                    type="submit"
                    className="w-full py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:shadow-lg transition"
                  >
                    Add Subject
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Streams List */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">📊 Streams</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {streams.map((stream) => (
              <div key={stream.id} className="glass rounded-2xl p-4 border border-white/20 dark:border-white/5">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-2xl">{stream.icon}</div>
                    <h4 className="font-bold text-slate-800 dark:text-white">{stream.name}</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{stream.description || 'No description'}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteStream(stream.id)}
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Subjects List */}
        <div>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">📖 Subjects</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjects.map((subject) => (
              <div key={subject.id} className="glass rounded-2xl p-4 border border-white/20 dark:border-white/5">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-2xl">{subject.icon}</div>
                    <h4 className="font-bold text-slate-800 dark:text-white">{subject.name}</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{subject.streams?.name}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteSubject(subject.id)}
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}