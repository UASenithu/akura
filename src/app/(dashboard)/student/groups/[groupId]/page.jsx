'use client'

import { useEffect, useState, useRef, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import { getGroup, sendMessage, leaveGroup } from '@/app/actions/groups'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, Send, Users, UserPlus, 
  MessageCircle, Calendar, LogOut, 
  Copy, Check, Lock, Unlock,
  Link as LinkIcon, File, Video, BookOpen,
  X, Image as ImageIcon, Paperclip
} from 'lucide-react'

export default function GroupChatPage({ params }) {
  const router = useRouter()
  const { groupId } = use(params)
  
  const [user, setUser] = useState(null)
  const [group, setGroup] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [copied, setCopied] = useState(false)
  const [members, setMembers] = useState([])
  const [isMember, setIsMember] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    fetchData()
    setupSubscription()
  }, [groupId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  async function fetchData() {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      setUser(currentUser)

      const { group: groupData, error } = await getGroup(groupId)
      if (error || !groupData) {
        router.push('/student/groups')
        return
      }

      setGroup(groupData)
      setMessages(groupData.messages || [])
      
      // Check if user is a member
      const isMemberCheck = groupData.members?.some(m => m.user_id === currentUser?.id)
      setIsMember(isMemberCheck)
      setMembers(groupData.members || [])
    } catch (error) {
      console.error('Error fetching group:', error)
    } finally {
      setLoading(false)
    }
  }

  function setupSubscription() {
    const subscription = supabase
      .channel(`group_messages_${groupId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'group_messages',
        filter: `group_id=eq.${groupId}`
      }, (payload) => {
        setMessages(prev => [...prev, payload.new])
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  async function handleSendMessage(e) {
    e.preventDefault()
    if (!newMessage.trim() || sending || !isMember) return

    setSending(true)
    try {
      const formData = new FormData()
      formData.append('groupId', groupId)
      formData.append('userId', user.id)
      formData.append('message', newMessage.trim())

      const result = await sendMessage(formData)
      if (result.error) {
        alert('Error sending message: ' + result.error)
      }
      setNewMessage('')
      inputRef.current?.focus()
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setSending(false)
    }
  }

  async function handleLeaveGroup() {
    if (!confirm('Are you sure you want to leave this group?')) return

    try {
      const formData = new FormData()
      formData.append('groupId', groupId)
      formData.append('userId', user.id)

      const result = await leaveGroup(formData)
      if (result.error) {
        alert('Error leaving group: ' + result.error)
      } else {
        router.push('/student/groups')
      }
    } catch (error) {
      console.error('Error leaving group:', error)
    }
  }

  const copyJoinCode = () => {
    navigator.clipboard.writeText(group?.join_code || '')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
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

  if (!group) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Group not found</h2>
          <Link href="/student/groups" className="mt-4 inline-block text-indigo-600 hover:underline">
            Back to Groups
          </Link>
        </div>
      </div>
    )
  }

  if (!isMember) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">You're not a member</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Join this group to participate in discussions.</p>
          <Link href="/student/groups" className="mt-4 inline-block text-indigo-600 hover:underline">
            Back to Groups
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
            <button onClick={() => router.back()} className="p-2 hover:bg-white/20 rounded-xl transition">
              <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-800 dark:text-white">{group.name}</h1>
                {group.is_private ? (
                  <Lock className="w-4 h-4 text-amber-500" />
                ) : (
                  <Unlock className="w-4 h-4 text-emerald-500" />
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <span>{members.length} members</span>
                <span>•</span>
                <span>{group.subjects?.name || 'General'}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={copyJoinCode}
              className="p-2 glass rounded-xl hover:bg-white/30 transition relative"
              title="Copy join code"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              onClick={handleLeaveGroup}
              className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8">
        
        {/* Chat Messages */}
        <div className="glass rounded-2xl p-4 border border-white/20 dark:border-white/5 min-h-[500px] max-h-[600px] overflow-y-auto mb-4">
          {messages.length > 0 ? (
            <div className="space-y-3">
              {messages.map((msg, index) => {
                const isOwn = msg.user_id === user?.id
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[75%] ${isOwn ? 'order-2' : 'order-1'}`}>
                      <div className={`flex items-center gap-2 mb-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                          {isOwn ? 'You' : msg.users?.full_name || 'User'}
                        </span>
                        <span className="text-xs text-slate-400">
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className={`p-3 rounded-2xl ${
                        isOwn 
                          ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-tr-sm' 
                          : 'glass text-slate-700 dark:text-white rounded-tl-sm'
                      }`}>
                        <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500 dark:text-slate-400">
              <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No messages yet. Start the conversation!</p>
            </div>
          )}
        </div>

        {/* Message Input */}
        <form onSubmit={handleSendMessage} className="flex gap-3">
          <input
            ref={inputRef}
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-3 glass rounded-xl border border-white/20 dark:border-white/5 text-slate-700 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 transition"
            disabled={sending || !isMember}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending || !isMember}
            className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:shadow-lg transition disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>

        {/* Members List */}
        <div className="mt-6 glass rounded-2xl p-4 border border-white/20 dark:border-white/5">
          <h4 className="text-sm font-semibold text-slate-700 dark:text-white mb-3 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Members ({members.length})
          </h4>
          <div className="flex flex-wrap gap-2">
            {members.map((member) => (
              <div key={member.id} className="flex items-center gap-2 px-3 py-1.5 glass rounded-xl border border-white/20 dark:border-white/5 text-sm">
                <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                  {member.users?.full_name?.[0] || 'U'}
                </div>
                <span className="text-slate-700 dark:text-white">
                  {member.users?.full_name || 'User'}
                  {member.role === 'admin' && (
                    <span className="ml-1 text-xs text-amber-500">⭐</span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}