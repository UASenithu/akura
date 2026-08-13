'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import { motion } from 'framer-motion'
import { ArrowLeft, Settings as SettingsIcon, User, Bell, Shield, Palette, Globe, Save, RefreshCw } from 'lucide-react'

export default function AdminSettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [settings, setSettings] = useState({
    siteName: 'Akura',
    siteDescription: 'Learn without stress',
    maintenanceMode: false,
    allowGuestUsers: true,
    theme: 'light',
    emailNotifications: true,
    enableAI: true,
    enableQuizzes: true
  })

  async function handleSave(e) {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    try {
      // Save settings to database (you'll need to create a settings table)
      // For now, just show success message
      setMessage('✅ Settings saved successfully!')
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      setMessage('❌ Error saving settings: ' + error.message)
    } finally {
      setLoading(false)
    }
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
                <SettingsIcon className="w-5 h-5 text-indigo-500" />
                Settings
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">Platform settings & configuration</p>
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:shadow-lg transition flex items-center gap-2 text-sm disabled:opacity-70"
          >
            {loading ? (
              <><RefreshCw className="w-4 h-4 animate-spin" /> Saving...</>
            ) : (
              <><Save className="w-4 h-4" /> Save Settings</>
            )}
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8">
        
        {message && (
          <div className={`mb-6 p-4 rounded-xl ${
            message.includes('Error') 
              ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800'
              : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
          }`}>
            {message}
          </div>
        )}

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-slate-700">
          
          <div className="space-y-8">
            
            {/* General Settings */}
            <div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5 text-indigo-500" />
                General
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Site Name</label>
                  <input
                    type="text"
                    value={settings.siteName}
                    onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Site Description</label>
                  <input
                    type="text"
                    value={settings.siteDescription}
                    onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                <Palette className="w-5 h-5 text-purple-500" />
                Features
              </h3>
              <div className="space-y-3">
                <label className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/30 rounded-xl cursor-pointer">
                  <span className="text-sm text-slate-700 dark:text-white">Enable AI Assistant</span>
                  <input
                    type="checkbox"
                    checked={settings.enableAI}
                    onChange={(e) => setSettings({ ...settings, enableAI: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                  />
                </label>
                <label className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/30 rounded-xl cursor-pointer">
                  <span className="text-sm text-slate-700 dark:text-white">Enable Quizzes</span>
                  <input
                    type="checkbox"
                    checked={settings.enableQuizzes}
                    onChange={(e) => setSettings({ ...settings, enableQuizzes: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                  />
                </label>
                <label className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/30 rounded-xl cursor-pointer">
                  <span className="text-sm text-slate-700 dark:text-white">Allow Guest Users</span>
                  <input
                    type="checkbox"
                    checked={settings.allowGuestUsers}
                    onChange={(e) => setSettings({ ...settings, allowGuestUsers: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                  />
                </label>
              </div>
            </div>

            {/* Maintenance */}
            <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-red-500" />
                Maintenance
              </h3>
              <label className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/30 rounded-xl cursor-pointer">
                <div>
                  <span className="text-sm text-slate-700 dark:text-white">Maintenance Mode</span>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Students will see a maintenance page</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.maintenanceMode}
                  onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                  className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                />
              </label>
            </div>

            {/* Notifications */}
            <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-500" />
                Notifications
              </h3>
              <label className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/30 rounded-xl cursor-pointer">
                <span className="text-sm text-slate-700 dark:text-white">Email Notifications</span>
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                />
              </label>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}