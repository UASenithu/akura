'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import { getGroups, createGroup, joinGroup } from '@/app/actions/groups'
import { motion } from 'framer-motion'
import { 
  Users, Plus, Search, BookOpen, 
  UserPlus, Lock, Unlock, ChevronRight,
  MessageCircle, Calendar, ArrowLeft,
  X, Sparkles, Users as UsersIcon,
  Copy, Check, Link as LinkIcon, Share2
} from 'lucide-react'

export default function GroupsPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [groups, setGroups] = useState([])
  const [myGroups, setMyGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [subjects, setSubjects] = useState([])
  const [joinCode, setJoinCode] = useState('')
  const [selectedGroupId, setSelectedGroupId] = useState('')
  const [copied, setCopied] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)

  const [newGroup, setNewGroup] = useState({
    name: '',
    description: '',
    subjectId: '',
    isPrivate: false,
    maxMembers: 20
  })

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      setUser(currentUser)

      const { data: subjectsData } = await supabase
        .from('subjects')
        .select('id, name')
      setSubjects(subjectsData || [])

      const { groups: allGroups } = await getGroups()
      setGroups(allGroups || [])

      if (currentUser) {
        const { data: memberGroups } = await supabase
          .from('group_members')
          .select('group_id')
          .eq('user_id', currentUser.id)

        const groupIds = memberGroups?.map(m => m.group_id) || []
        const userGroups = allGroups?.filter(g => groupIds.includes(g.id)) || []
        setMyGroups(userGroups)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateGroup(e) {
    e.preventDefault()
    const formData = new FormData()
    formData.append('name', newGroup.name)
    formData.append('description', newGroup.description)
    formData.append('subjectId', newGroup.subjectId)
    formData.append('isPrivate', newGroup.isPrivate)
    formData.append('maxMembers', newGroup.maxMembers)
    formData.append('userId', user.id)

    const result = await createGroup(formData)
    if (result.error) {
      alert('Error creating group: ' + result.error)
    } else {
      setShowCreateModal(false)
      setNewGroup({ name: '', description: '', subjectId: '', isPrivate: false, maxMembers: 20 })
      fetchData()
    }
  }

  async function handleJoinGroup(e) {
    e.preventDefault()
    const formData = new FormData()
    formData.append('groupId', selectedGroupId)
    formData.append('userId', user.id)
    formData.append('joinCode', joinCode)

    const result = await joinGroup(formData)
    if (result.error) {
      alert('Error joining group: ' + result.error)
    } else {
      setShowJoinModal(false)
      setJoinCode('')
      fetchData()
    }
  }

  const copyJoinCode = (code) => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const copyGroupLink = (groupId) => {
    const link = `${window.location.origin}/student/groups/join/${groupId}`
    navigator.clipboard.writeText(link)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  const filteredGroups = groups.filter(group => {
    const matchesSearch = group.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          group.description?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-slate-600 dark:text-slate-400">Loading groups...</p>
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
                <Users className="w-5 h-5 text-indigo-500" />
                Study Groups
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-indigo-400" />
                Learn together, grow together
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setSelectedGroupId(''); setJoinCode(''); setShowJoinModal(true) }}
              className="px-4 py-2 glass rounded-xl text-sm text-slate-700 dark:text-white hover:bg-white/30 transition flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              Join Group
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:shadow-lg transition flex items-center gap-2 text-sm"
            >
              <Plus className="w-4 h-4" />
              Create Group
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="glass rounded-2xl p-4 border border-white/20 dark:border-white/5 text-center">
            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{groups.length}</div>
            <div className="text-sm text-slate-500 dark:text-slate-400">Total Groups</div>
          </div>
          <div className="glass rounded-2xl p-4 border border-white/20 dark:border-white/5 text-center">
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{myGroups.length}</div>
            <div className="text-sm text-slate-500 dark:text-slate-400">My Groups</div>
          </div>
          <div className="glass rounded-2xl p-4 border border-white/20 dark:border-white/5 text-center">
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {groups.reduce((acc, g) => acc + (g.members?.length || 0), 0)}
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400">Total Members</div>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search groups..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 glass rounded-xl border border-white/20 dark:border-white/5 text-slate-700 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 transition"
          />
        </div>

        {/* My Groups */}
        {myGroups.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <UsersIcon className="w-5 h-5 text-indigo-500" />
              My Groups
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myGroups.map((group) => (
                <Link key={group.id} href={`/student/groups/${group.id}`}>
                  <motion.div whileHover={{ y: -4 }} className="glass rounded-2xl p-4 border border-white/20 dark:border-white/5 hover:border-indigo-300 transition">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold">
                          {group.name?.[0]?.toUpperCase() || 'G'}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800 dark:text-white">{group.name}</h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {group.members?.length || 0} members
                          </p>
                        </div>
                      </div>
                      {group.is_private ? (
                        <Lock className="w-4 h-4 text-amber-500" />
                      ) : (
                        <Unlock className="w-4 h-4 text-emerald-500" />
                      )}
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                      {group.description || 'No description'}
                    </p>
                    <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
                      <MessageCircle className="w-3 h-3" />
                      <span>{group.messages?.length || 0} messages</span>
                    </div>
                    {/* Show Join Code for group creators */}
                    {group.created_by === user?.id && (
                      <div className="mt-3 flex items-center gap-2">
                        <button
                          onClick={(e) => { e.preventDefault(); copyJoinCode(group.join_code) }}
                          className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                        >
                          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          Code: {group.join_code}
                        </button>
                        <button
                          onClick={(e) => { e.preventDefault(); copyGroupLink(group.id) }}
                          className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                        >
                          {copiedLink ? <Check className="w-3 h-3" /> : <Share2 className="w-3 h-3" />}
                          Share Link
                        </button>
                      </div>
                    )}
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* All Groups */}
        <div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-500" />
            All Groups
          </h3>
          {filteredGroups.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredGroups.map((group) => {
                const isMember = myGroups.some(g => g.id === group.id)
                return (
                  <motion.div
                    key={group.id}
                    whileHover={{ y: -4 }}
                    className="glass rounded-2xl p-4 border border-white/20 dark:border-white/5 hover:border-indigo-300 transition"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-bold text-slate-800 dark:text-white">{group.name}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {group.subjects?.name || 'General'}
                        </p>
                      </div>
                      {group.is_private ? (
                        <Lock className="w-4 h-4 text-amber-500" />
                      ) : (
                        <Unlock className="w-4 h-4 text-emerald-500" />
                      )}
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                      {group.description || 'No description'}
                    </p>
                    <div className="flex justify-between items-center mt-3">
                      <div className="text-xs text-slate-400">
                        {group.members?.length || 0} members
                      </div>
                      {isMember ? (
                        <Link
                          href={`/student/groups/${group.id}`}
                          className="px-4 py-1.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs rounded-xl hover:shadow-lg transition"
                        >
                          View Group
                        </Link>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedGroupId(group.id)
                            setShowJoinModal(true)
                          }}
                          className="px-4 py-1.5 glass text-xs rounded-xl hover:bg-white/30 transition"
                        >
                          Join
                        </button>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12 glass rounded-3xl border border-white/20 dark:border-white/5">
              <div className="text-6xl mb-4">📭</div>
              <h3 className="text-xl font-semibold text-slate-700 dark:text-white">No Groups Found</h3>
              <p className="text-slate-500 dark:text-slate-400 mt-2">Be the first to create a study group!</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Group Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">📚 Create Study Group</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-500 hover:text-red-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Group Name *</label>
                <input
                  type="text"
                  value={newGroup.name}
                  onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  required
                  placeholder="e.g., Physics Study Group"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
                <textarea
                  value={newGroup.description}
                  onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  rows="2"
                  placeholder="What's this group about?"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Subject</label>
                <select
                  value={newGroup.subjectId}
                  onChange={(e) => setNewGroup({ ...newGroup, subjectId: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="">Select Subject</option>
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={newGroup.isPrivate}
                    onChange={(e) => setNewGroup({ ...newGroup, isPrivate: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  Private Group (requires join code)
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Max Members</label>
                <input
                  type="number"
                  value={newGroup.maxMembers}
                  onChange={(e) => setNewGroup({ ...newGroup, maxMembers: parseInt(e.target.value) || 20 })}
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  min="2"
                  max="100"
                />
              </div>
              <div className="text-sm text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-700/30 p-3 rounded-lg">
                <p>🔑 A unique join code will be generated for your group automatically.</p>
                <p className="text-xs mt-1">Share this code with others to let them join your group.</p>
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:shadow-lg transition"
              >
                Create Group
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Join Group Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">🔑 Join Study Group</h3>
              <button onClick={() => setShowJoinModal(false)} className="text-slate-500 hover:text-red-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleJoinGroup} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Enter Join Code</label>
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-center text-2xl font-bold tracking-widest uppercase"
                  placeholder="e.g., ABC12345"
                  maxLength={8}
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Enter the 8-character join code shared by the group creator.
                </p>
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:shadow-lg transition"
              >
                Join Group
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}