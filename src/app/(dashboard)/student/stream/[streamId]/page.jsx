'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import { motion } from 'framer-motion'
import { ArrowLeft, BookOpen, Sparkles, ChevronRight } from 'lucide-react'

export default function StreamSubjectsPage({ params }) {
  const router = useRouter()
  const { streamId } = use(params)
  
  const [stream, setStream] = useState(null)
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)

  // ✅ A/L Stream Subjects Mapping
  const streamSubjects = {
    'Biological Science': {
      icon: '🧬',
      subjects: ['Biology', 'Chemistry', 'Physics', 'Agricultural Science'],
      description: 'Medical, Health & Agricultural fields'
    },
    'Physical Science': {
      icon: '⚛️',
      subjects: ['Combined Mathematics', 'Physics', 'Chemistry', 'ICT'],
      description: 'Engineering, Computing & Technology fields'
    },
    'Technology': {
      icon: '💻',
      subjects: ['Science for Technology', 'Engineering Technology', 'Bio-Systems Technology', 'ICT', 'Agricultural Science', 'Geography', 'Economics', 'Business Studies', 'Media Studies', 'Art'],
      description: 'Technical & Vocational fields'
    },
    'Commerce': {
      icon: '📊',
      subjects: ['Accounting', 'Business Studies', 'Economics', 'ICT', 'Business Statistics'],
      description: 'Business, Accounting & Management fields'
    },
    'Arts': {
      icon: '🎨',
      subjects: ['Logic', 'Economics', 'Geography', 'Political Science', 'History', 'Sinhala', 'Tamil', 'English', 'French', 'Japanese', 'Chinese', 'Music', 'Dance', 'Drama', 'Art', 'ICT', 'Media Studies'],
      description: 'Law, Humanities & Social Sciences fields'
    }
  }

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: streamData, error: streamError } = await supabase
          .from('streams')
          .select('*')
          .eq('id', streamId)
          .single()

        if (streamError) {
          console.error('Error fetching stream:', streamError)
          setLoading(false)
          return
        }

        setStream(streamData)

        const streamName = streamData.name
        const streamDataObj = streamSubjects[streamName]
        
        if (streamDataObj) {
          setSubjects(streamDataObj.subjects.map(subject => ({
            id: subject.toLowerCase().replace(/\s+/g, '-'),
            name: subject,
            icon: getSubjectIcon(subject)
          })))
        }

        setLoading(false)
      } catch (error) {
        console.error('Error:', error)
        setLoading(false)
      }
    }
    fetchData()
  }, [streamId])

  const getSubjectIcon = (subject) => {
    const icons = {
      'Biology': '🧬', 'Chemistry': '🧪', 'Physics': '⚛️',
      'Combined Mathematics': '📐', 'Mathematics': '📐', 'Maths': '📐',
      'Accounting': '📊', 'Business Studies': '💼', 'Economics': '📈',
      'Science': '🔬', 'Technology': '💻', 'Engineering': '🔧',
      'ICT': '🖥️', 'Agricultural Science': '🌾',
      'Logic': '🧠', 'Geography': '🌍', 'History': '📜',
      'Political Science': '🏛️', 'Sinhala': '📖', 'Tamil': '📕',
      'English': '📝', 'French': '🇫🇷', 'Japanese': '🇯🇵',
      'Chinese': '🇨🇳', 'Music': '🎵', 'Dance': '💃',
      'Drama': '🎭', 'Art': '🎨', 'Media Studies': '📺'
    }
    return icons[subject] || '📚'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-slate-600 dark:text-slate-400">Loading subjects...</p>
        </div>
      </div>
    )
  }

  if (!stream) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Stream not found</h2>
          <Link href="/student" className="mt-4 inline-block text-indigo-600 hover:underline">
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50/30 to-pink-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      
      <nav className="glass sticky top-0 z-50 border-b border-white/20 dark:border-white/5 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/student')} className="p-2 hover:bg-white/20 rounded-xl transition">
              <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <span className="text-3xl">{stream.icon || '📚'}</span>
                {stream.name}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-indigo-400" />
                {subjects.length} subjects available
              </p>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-8 mb-8 shadow-2xl shadow-indigo-500/25">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-10"></div>
          
          <div className="relative">
            <div className="text-6xl mb-4">{stream.icon || '📚'}</div>
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              {stream.name}
            </h2>
            <p className="text-indigo-100 mt-2 text-lg">
              {streamSubjects[stream.name]?.description || 'Choose a subject to start learning'}
            </p>
          </div>
        </div>

        {subjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.map((subject, index) => (
              <motion.div
                key={subject.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-2xl transition-all duration-300"
              >
                <Link href={`/student/subject/${subject.id}`} className="block p-6 relative">
                  <div className="text-5xl mb-4 float group-hover:scale-110 transition-transform duration-300">
                    {subject.icon}
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                    {subject.name}
                  </h3>
                  
                  <div className="mt-4 flex items-center text-sm font-medium text-indigo-600 dark:text-indigo-400 group-hover:gap-2 transition-all">
                    <span>View Lessons</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>

                  <div className="absolute inset-0 border-2 border-transparent group-hover:border-indigo-500/20 rounded-2xl transition-all duration-300 pointer-events-none"></div>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 glass rounded-3xl border border-white/20 dark:border-white/5">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-semibold text-slate-700 dark:text-white">No Subjects Found</h3>
            <p className="text-slate-500 dark:text-slate-400 mt-2">Subjects will be added to this stream soon!</p>
          </div>
        )}
      </div>
    </div>
  )
}