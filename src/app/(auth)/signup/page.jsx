'use client'

import { useState } from 'react'
import { signUp } from '@/app/actions/auth'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, BookOpen, ArrowRight, CheckCircle } from 'lucide-react'

export default function SignUpPage() {
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [streams] = useState(['Physical Science', 'Biological Science', 'Commerce', 'Technology'])

  async function handleSubmit(event) {
    event.preventDefault()
    const formData = new FormData(event.target)
    const result = await signUp(formData)
    if (result?.error) {
      setError(result.error)
      setSuccess(false)
    } else {
      setSuccess(true)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4 relative overflow-hidden">
      
      {/* Animated Background */}
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
        <div className="glass rounded-3xl shadow-2xl p-8 border border-white/20 dark:border-white/5">
          
          {/* Logo */}
          <div className="text-center mb-8">
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

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Choose Your Stream
              </label>
              <select
                name="stream"
                required
                className="w-full px-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition appearance-none cursor-pointer"
              >
                <option value="">Select your stream</option>
                {streams.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

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
              className="w-full py-3.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white font-medium rounded-xl transition shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 flex items-center justify-center gap-2"
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

          {/* Feature List */}
          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700 grid grid-cols-2 gap-3">
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