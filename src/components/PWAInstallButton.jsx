'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Download, Smartphone, X } from 'lucide-react'

export default function PWAInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [showInstall, setShowInstall] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isAndroid, setIsAndroid] = useState(false)
  const [showIOSGuide, setShowIOSGuide] = useState(false)

  useEffect(() => {
    // Check if it's iOS
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream
    setIsIOS(ios)

    // Check if it's Android
    const android = /android/i.test(navigator.userAgent)
    setIsAndroid(android)

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
      setShowInstall(false)
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowInstall(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setShowInstall(false)
      setDeferredPrompt(null)
    }

    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt')
        setShowInstall(false)
      }
      setDeferredPrompt(null)
    }
  }

  const handleIOSInstall = () => {
    setShowIOSGuide(true)
  }

  if (isInstalled) {
    return null
  }

  // iOS Guide Modal
  if (showIOSGuide) {
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-sm w-full"
        >
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">
              📱 Install on iPhone
            </h3>
            <button
              onClick={() => setShowIOSGuide(false)}
              className="text-slate-500 hover:text-red-500"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">1️⃣</span>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Tap the <strong>Share</strong> button
                <br />
                <span className="text-xs text-slate-400">(square with arrow up)</span>
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">2️⃣</span>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Scroll down and tap <strong>"Add to Home Screen"</strong>
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">3️⃣</span>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Tap <strong>"Add"</strong> in the top right corner
              </p>
            </div>
            <button
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:shadow-lg transition"
            >
              Got it!
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  // Android / Desktop install button
  if (showInstall && !isIOS) {
    return (
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:bottom-6 md:max-w-sm"
      >
        <div className="glass rounded-2xl p-4 border border-white/20 dark:border-white/5 shadow-2xl flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl shadow-lg shadow-indigo-500/25 flex-shrink-0">
            <Smartphone className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-bold text-slate-800 dark:text-white">
              Install Akura App
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Get the best experience on your phone
            </p>
          </div>
          <button
            onClick={handleInstall}
            className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm font-medium rounded-xl hover:shadow-lg transition flex items-center gap-2 flex-shrink-0"
          >
            <Download className="w-4 h-4" />
            Install
          </button>
        </div>
      </motion.div>
    )
  }

  // iOS button
  if (isIOS && !isInstalled) {
    return (
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:bottom-6 md:max-w-sm"
      >
        <div className="glass rounded-2xl p-4 border border-white/20 dark:border-white/5 shadow-2xl flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl shadow-lg shadow-emerald-500/25 flex-shrink-0">
            <Smartphone className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-bold text-slate-800 dark:text-white">
              📱 Add to Home Screen
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Get the best experience on your iPhone
            </p>
          </div>
          <button
            onClick={handleIOSInstall}
            className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-medium rounded-xl hover:shadow-lg transition flex-shrink-0"
          >
            Learn How
          </button>
        </div>
      </motion.div>
    )
  }

  return null
}