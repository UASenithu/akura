'use client'

import { useState } from 'react'
import { signUp } from '@/app/actions/auth'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, BookOpen, ArrowRight, CheckCircle, GraduationCap, School } from 'lucide-react'

export default function SignUpPage() {
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [selectedLevel, setSelectedLevel] = useState('')
  const [selectedStream, setSelectedStream] = useState('')

  // ✅ All Streams with their Core Subjects (Auto-assign)
  const streamData = {
    'Biological Science': {
      icon: '🧬',
      coreSubjects: ['Biology', 'Chemistry', 'Physics']
    },
    'Physical Science': {
      icon: '⚛️',
      coreSubjects: ['Combined Mathematics', 'Physics', 'Chemistry']
    },
    'Technology': {
      icon: '💻',
      coreSubjects: ['Science for Technology', 'Engineering Technology']
    },
    'Commerce': {
      icon: '📊',
      coreSubjects: ['Accounting', 'Business Studies', 'Economics']
    },
    'Arts': {
      icon: '🎨',
      coreSubjects: ['Logic', 'Economics', 'Geography']
    }
  }

  const handleLevelChange = (level) => {
    setSelectedLevel(level)
    setSelectedStream('')
  }

  const handleStreamSelect = (stream) => {
    setSelectedStream(stream)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const formData = new FormData(event.target)
    
    const level = formData.get('level')
    let stream = formData.get('stream')
    let subjects = formData.get('subjects') || ''
    
    if (level === 'O/L') {
      stream = 'O/L - General'
      subjects = 'O/L Subjects'
    } else if (level === 'A/L' && stream) {
      const streamDataObj = streamData[stream]
      if (streamDataObj) {
        subjects = streamDataObj.coreSubjects.join(', ')
      }
      stream = `${level} - ${stream}`
    }
    
    // Add level to form data
    formData.append('level', level)
    formData.append('stream', stream)
    formData.append('subjects', subjects)
    
    const result = await signUp(formData)
    if (result?.error) {
      setError(result.error)
      setSuccess(false)
    } else {
      setSuccess(true)
    }
  }

  const currentStream = selectedStream ? streamData[selectedStream] : null

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4 relative overflow-hidden">
      
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-300 dark:bg-indigo-600 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-300 dark:bg-purple-600 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-30 animate-pulse delay-1000"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="glass rounded-3xl shadow-2xl p-8 border border-white/20 dark:border-white/5 max-h-[90vh] overflow-y-auto">
          
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-3 mb-3">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
              Join Akura
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Start your calm learning journey 🚀
            </p>
          </div>

          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-4 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-600 dark:text-emerald-400 flex items-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                Account created! Redirecting...
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                required
                className="w-full px-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                placeholder="Kamal Perera"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                required
                className="w-full px-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                placeholder="you@akura.lk"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Password
              </label>
              <input
                type="password"
                name="password"
                required
                minLength={6}
                className="w-full px-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                placeholder="••••••••"
              />
            </div>

            {/* Exam Level */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Exam Level
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleLevelChange('A/L')}
                  className={`p-3 rounded-xl border-2 transition flex items-center justify-center gap-2 ${
                    selectedLevel === 'A/L'
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
                      : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300'
                  }`}
                >
                  <GraduationCap className="w-5 h-5" />
                  <span className="font-medium">A/L</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleLevelChange('O/L')}
                  className={`p-3 rounded-xl border-2 transition flex items-center justify-center gap-2 ${
                    selectedLevel === 'O/L'
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
                      : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300'
                  }`}
                >
                  <School className="w-5 h-5" />
                  <span className="font-medium">O/L</span>
                </button>
              </div>
              <input type="hidden" name="level" value={selectedLevel} />
            </div>

            {/* Stream Selection - A/L */}
            {selectedLevel === 'A/L' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Select Stream
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.keys(streamData).map((stream) => (
                    <button
                      key={stream}
                      type="button"
                      onClick={() => handleStreamSelect(stream)}
                      className={`p-3 rounded-xl border-2 transition text-sm flex items-center gap-2 ${
                        selectedStream === stream
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
                          : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300'
                      }`}
                    >
                      <span>{streamData[stream].icon}</span>
                      <span>{stream}</span>
                      <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded-full ml-auto">
                        Auto
                      </span>
                    </button>
                  ))}
                </div>
                <input type="hidden" name="stream" value={selectedStream} />
              </motion.div>
            )}

            {/* Core Subjects Display - A/L */}
            {selectedLevel === 'A/L' && selectedStream && currentStream && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800"
              >
                <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Core Subjects
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {currentStream.coreSubjects.map((subject) => (
                    <span key={subject} className="px-3 py-1 bg-emerald-100 dark:bg-emerald-800/50 rounded-xl text-sm text-emerald-700 dark:text-emerald-300">
                      {subject}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2">
                  ✅ These subjects will be auto-assigned
                </p>
                <input type="hidden" name="subjects" value={currentStream.coreSubjects.join(', ')} />
              </motion.div>
            )}

            {/* O/L Info */}
            {selectedLevel === 'O/L' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 text-sm flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                You're joining as an O/L student
              </motion.div>
            )}

            <input type="hidden" name="role" value="student" />

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-red-500 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-xl border border-red-200 dark:border-red-800"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={
                !selectedLevel || 
                (selectedLevel === 'A/L' && !selectedStream)
              }
              className="w-full py-3.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white font-medium rounded-xl transition shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              Create Account <ArrowRight className="w-4 h-4" />
            </motion.button>
          </form>

          <div className="text-center mt-6">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Already have an account?{' '}
              <Link href="/login" className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
                Login →
              </Link>
            </p>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700 grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
              Free forever
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
              AI powered
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
              Stress-free
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="w-1.5 h-1.5 bg-pink-400 rounded-full" />
              Offline ready
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}