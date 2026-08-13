'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { signOut } from '@/app/actions/auth'
import { askAI, getStudyTips } from '@/app/actions/ai'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  BookOpen, Sparkles, Brain, Send, User, 
  LogOut, MessageCircle, Lightbulb, 
  ChevronDown, ChevronUp, Loader2, 
  ArrowLeft, Zap, GraduationCap
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'

export default function AIPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [question, setQuestion] = useState('')
  const [subject, setSubject] = useState('General')
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [showTips, setShowTips] = useState(false)
  const [tips, setTips] = useState('')
  const [tipsLoading, setTipsLoading] = useState(false)
  const chatEndRef = useRef(null)
  const inputRef = useRef(null)

  const subjects = ['General', 'Physics', 'Chemistry', 'Biology', 'Mathematics', 'Accounting', 'Economics', 'Business Studies', 'IT', 'Engineering Technology']

  useEffect(() => {
    async function fetchUser() {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      
      // Welcome message
      setMessages([
        {
          role: 'assistant',
          content: `Hi ${user?.user_metadata?.full_name || 'Student'}! 👋 I'm **Akura AI**, your study assistant. \n\nAsk me anything about your A/L subjects! I'm here to help you learn without stress. 😊\n\n**Try asking:**\n• "Explain Newton's laws"\n• "What is photosynthesis?"\n• "How to balance equations?"\n• "Study tips for exams"`
        }
      ])
    }
    fetchUser()
  }, [])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!question.trim() || loading) return

    const userQuestion = question.trim()
    setQuestion('')
    setLoading(true)

    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: userQuestion }])

    try {
      const formData = new FormData()
      formData.append('question', userQuestion)
      formData.append('subject', subject)
      
      const result = await askAI(formData)
      
      // Add AI response
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: result.answer || result.error || "I'm not sure about that. Can you rephrase? 😊"
      }])
    } catch (error) {
      console.error('Error:', error)
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "Oops! Something went wrong. Please try again! 😅"
      }])
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  async function handleGetTips() {
    setShowTips(!showTips)
    if (!tips && !tipsLoading) {
      setTipsLoading(true)
      const result = await getStudyTips(subject === 'General' ? 'A/L subjects' : subject)
      setTips(result.tips || 'Study regularly and stay calm! 📚💪')
      setTipsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50/30 to-pink-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      
      {/* Navbar */}
      <nav className="glass sticky top-0 z-50 border-b border-white/20 dark:border-white/5 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/student')} className="p-2 hover:bg-white/20 rounded-xl transition">
              <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </button>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
                <Brain className="w-5 h-5 text-indigo-500" />
                Akura AI
              </h1>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 -mt-0.5 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-indigo-400" />
                Your 24/7 Study Assistant
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-slate-700 dark:text-white hidden sm:block">
                {user?.user_metadata?.full_name || 'Student'}
              </span>
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/25">
                {user?.user_metadata?.full_name?.[0] || 'S'}
              </div>
              <form action={signOut}>
                <button type="submit" className="p-2 text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20">
                  <LogOut className="w-5 h-5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8">
        
        {/* Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-8 mb-8 shadow-2xl shadow-indigo-500/25">
          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs text-white font-medium">
                  🤖 AI Powered
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white">
                Ask Me Anything! 
              </h2>
              <p className="text-indigo-100 mt-2 text-lg">
                Get instant help with your studies, 24/7
              </p>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-4 text-center">
                <p className="text-2xl font-bold text-white">💡</p>
                <p className="text-xs text-indigo-100">Smart Answers</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-4 text-center">
                <p className="text-2xl font-bold text-white">⚡</p>
                <p className="text-xs text-indigo-100">Instant Help</p>
              </div>
            </div>
          </div>
        </div>

        {/* Subject Selector & Tips */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 min-w-[200px]">
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-4 py-2 glass rounded-2xl border border-white/20 dark:border-white/5 text-slate-700 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            >
              {subjects.map(s => (
                <option key={s} value={s} className="dark:bg-slate-800">
                  📚 {s}
                </option>
              ))}
            </select>
          </div>
          
          <button
            onClick={handleGetTips}
            className="px-6 py-2 glass rounded-2xl border border-white/20 dark:border-white/5 text-slate-700 dark:text-white hover:bg-white/30 transition flex items-center gap-2"
          >
            <Lightbulb className="w-4 h-4 text-amber-500" />
            Study Tips
            {showTips ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {/* Study Tips Dropdown */}
        <AnimatePresence>
          {showTips && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 overflow-hidden"
            >
              <div className="glass rounded-2xl p-6 border border-white/20 dark:border-white/5">
                <h4 className="font-bold text-slate-700 dark:text-white flex items-center gap-2 mb-3">
                  <Lightbulb className="w-5 h-5 text-amber-500" />
                  Study Tips for {subject}
                </h4>
                {tipsLoading ? (
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Getting tips...
                  </div>
                ) : (
                  <div className="prose prose-indigo dark:prose-invert max-w-none">
                    <ReactMarkdown>{tips}</ReactMarkdown>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chat Messages */}
        <div className="glass rounded-3xl p-6 border border-white/20 dark:border-white/5 min-h-[400px] max-h-[600px] overflow-y-auto mb-6">
          {messages.map((msg, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`flex items-start gap-3 mb-4 ${
                msg.role === 'user' ? 'flex-row-reverse' : ''
              }`}
            >
              <div className={`w-8 h-8 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                msg.role === 'user' 
                  ? 'bg-gradient-to-br from-indigo-500 to-purple-500 text-white' 
                  : 'bg-gradient-to-br from-emerald-500 to-teal-500 text-white'
              }`}>
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Brain className="w-4 h-4" />}
              </div>
              
              <div className={`max-w-[80%] ${
                msg.role === 'user' ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-2xl rounded-tr-sm px-4 py-3' : 'bg-white/50 dark:bg-slate-800/50 text-slate-800 dark:text-white rounded-2xl rounded-tl-sm px-4 py-3'
              }`}>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              </div>
            </motion.div>
          ))}
          
          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-3"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center text-white flex-shrink-0">
                <Brain className="w-4 h-4" />
              </div>
              <div className="bg-white/50 dark:bg-slate-800/50 text-slate-800 dark:text-white rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="animate-pulse">●</span>
                  <span className="animate-pulse delay-100">●</span>
                  <span className="animate-pulse delay-200">●</span>
                </div>
              </div>
            </motion.div>
          )}
          
          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="flex gap-3">
          <input
            ref={inputRef}
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask me anything about your A/L subjects..."
            className="flex-1 px-4 py-3 glass rounded-2xl border border-white/20 dark:border-white/5 text-slate-700 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !question.trim()}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-2xl transition shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Send className="w-4 h-4" />
                Send
              </>
            )}
          </button>
        </form>

        {/* Quick Suggestions */}
        <div className="flex flex-wrap gap-2 mt-4">
          {[
            'Explain Newton\'s laws',
            'What is photosynthesis?',
            'How to balance equations?',
            'Study tips for exams',
            'What is accounting?',
            'Explain supply and demand'
          ].map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => {
                setQuestion(suggestion)
                inputRef.current?.focus()
              }}
              className="px-3 py-1.5 text-xs glass rounded-xl border border-white/20 dark:border-white/5 text-slate-600 dark:text-slate-400 hover:bg-white/30 transition"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}