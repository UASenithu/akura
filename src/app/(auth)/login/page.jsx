'use client'

import { useState, useEffect } from 'react'
import { signIn } from '@/app/actions/auth'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, BookOpen, Brain, Zap, ArrowRight } from 'lucide-react'

export default function LoginPage() {
  const [error, setError] = useState('')
  const [role, setRole] = useState('student')
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setIsLoading(true)
    const formData = new FormData(event.target)
    formData.append('role', role)
    
    const result = await signIn(formData)
    if (result?.error) {
      setError(result.error)
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4 relative overflow-hidden">
      
      {/* Animated Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-300 dark:bg-indigo-600 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-300 dark:bg-purple-600 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-30 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-300 dark:bg-pink-600 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-20 animate-pulse delay-2000"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="glass rounded-3xl shadow-2xl p-8 border border-white/20 dark:border-white/5">
          
          {/* Logo */}
          <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center gap-3 mb-3">
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Akura
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              Learn without stress
              <Sparkles className="w-4 h-4 text-pink-400" />
            </p>
          </motion.div>

          {/* Role Toggle - Premium */}
          <div className="relative bg-slate-100 dark:bg-slate-800 rounded-2xl p-1.5 mb-8">
            <div className="relative flex">
              <motion.div
                className="absolute inset-0.5 bg-white dark:bg-slate-700 rounded-xl shadow-lg"
                animate={{ x: role === 'student' ? '0%' : '100%' }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                style={{ width: 'calc(50% - 4px)' }}
              />
              <button
                onClick={() => setRole('student')}
                className={`flex-1 py-3 rounded-xl text-sm font-medium transition relative z-10 ${
                  role === 'student' 
                    ? 'text-indigo-600 dark:text-indigo-400' 
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                <span className="flex items-center justify-center gap-2">
                  🎓 Student
                </span>
              </button>
              <button
                onClick={() => setRole('admin')}
                className={`flex-1 py-3 rounded-xl text-sm font-medium transition relative z-10 ${
                  role === 'admin' 
                    ? 'text-indigo-600 dark:text-indigo-400' 
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                <span className="flex items-center justify-center gap-2">
                  🔐 Admin
                </span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
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
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Password
              </label>
              <input
                type="password"
                name="password"
                required
                className="w-full px-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                placeholder="••••••••"
              />
            </motion.div>

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
              disabled={isLoading}
              className="w-full py-3.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-medium rounded-xl transition shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {role === 'student' ? '🚀 Enter Akura' : '🔑 Admin Login'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </form>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center mt-6"
          >
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Don't have an account?{' '}
              <Link href="/signup" className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
                Sign up free →
              </Link>
            </p>
          </motion.div>

          {/* Feature Badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700 flex justify-center gap-6"
          >
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <Brain className="w-3.5 h-3.5 text-indigo-400" />
              <span>AI Powered</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Fast & Smooth</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <Sparkles className="w-3.5 h-3.5 text-pink-400" />
              <span>Stress-Free</span>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}