'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import { joinGroup } from '@/app/actions/groups'
import { motion } from 'framer-motion'
import { ArrowLeft, Users, Lock, Unlock, CheckCircle, XCircle, Loader2 } from 'lucide-react'

export default function JoinGroupPage({ params }) {
  const router = useRouter()
  const { groupId } = use(params)
  
  const [group, setGroup] = useState(null)
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)
  const [joined, setJoined] = useState(false)
  const [error, setError] = useState('')
  const [user, setUser] = useState(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser()
        setUser(currentUser)

        // Get group details
        const { data: groupData, error: groupError } = await supabase
          .from('study_groups')
          .select('*, subjects(name), members:group_members(user_id)')
          .eq('id', groupId)
          .single()

        if (groupError || !groupData) {
          setError('Group not found')
          setLoading(false)
          return
        }

        // Check if user is already a member
        const isMember = groupData.members?.some(m => m.user_id === currentUser?.id)
        if (isMember) {
          setJoined(true)
        }

        setGroup(groupData)
      } catch (error) {
        console.error('Error fetching group:', error)
        setError('Failed to load group')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [groupId])

  async function handleJoin() {
    if (!user) {
      router.push('/login')
      return
    }

    setJoining(true)
    try {
      const formData = new FormData()
      formData.append('groupId', groupId)
      formData.append('userId', user.id)
      formData.append('joinCode', '')

      const result = await joinGroup(formData)
      if (result.error) {
        setError(result.error)
      } else {
        setJoined(true)
        setTimeout(() => router.push(`/student/groups/${groupId}`), 2000)
      }
    } catch (error) {
      setError('Failed to join group')
    } finally {
      setJoining(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-slate-600 dark:text-slate-400">Loading group...</p>
        </div>
      </div>
    )
  }

  if (error || !group) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Group Not Found</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2">The group you're looking for doesn't exist or has been removed.</p>
          <Link href="/student/groups" className="mt-4 inline-block text-indigo-600 dark:text-indigo-400 hover:underline">
            Back to Groups
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4">
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md glass rounded-3xl shadow-2xl p-8 border border-white/20 dark:border-white/5 text-center"
      >
        {joined ? (
          <>
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">You're In!</h2>
            <p className="text-slate-600 dark:text-slate-300 mt-2">
              You've successfully joined <strong>{group.name}</strong>!
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Redirecting to group chat...
            </p>
            <div className="mt-4">
              <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          </>
        ) : (
          <>
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-indigo-500/30">
              <Users className="w-10 h-10 text-white" />
            </div>

            <h1 className="text-2xl font-bold text-slate-800 dark:text-white mt-4">
              {group.name}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {group.subjects?.name || 'General'} • {group.members?.length || 0} members
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-3">
              {group.description || 'No description'}
            </p>

            <div className="flex items-center justify-center gap-2 mt-4">
              {group.is_private ? (
                <Lock className="w-4 h-4 text-amber-500" />
              ) : (
                <Unlock className="w-4 h-4 text-emerald-500" />
              )}
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {group.is_private ? 'Private Group' : 'Public Group'}
              </span>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="mt-6 space-y-3">
              <button
                onClick={handleJoin}
                disabled={joining}
                className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium rounded-xl hover:shadow-lg transition disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {joining ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Joining...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5" />
                    Join This Group
                  </>
                )}
              </button>

              <Link
                href="/student/groups"
                className="block w-full py-3 glass text-slate-700 dark:text-white font-medium rounded-xl hover:bg-white/30 transition"
              >
                <ArrowLeft className="w-4 h-4 inline mr-2" />
                Back to Groups
              </Link>
            </div>
          </>
        )}
      </motion.div>
    </div>
  )
}