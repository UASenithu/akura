'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  BookOpen, Sparkles, Brain, Zap, 
  Award, ChevronRight, GraduationCap,
  Users, Clock, Shield, Star, 
  ArrowRight, Menu, X, Heart,
  CheckCircle, Rocket, Target, MessageCircle
} from 'lucide-react'

export default function HomePage() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const features = [
    {
      icon: <Brain className="w-8 h-8 text-indigo-500" />,
      title: 'AI Powered Learning',
      description: 'Get instant help with our AI assistant, available 24/7 to answer your questions.'
    },
    {
      icon: <BookOpen className="w-8 h-8 text-emerald-500" />,
      title: 'Smart Lessons',
      description: 'Learn with interactive lessons, mindmaps, and engaging content designed for A/L students.'
    },
    {
      icon: <Award className="w-8 h-8 text-amber-500" />,
      title: 'Gamification',
      description: 'Earn points, unlock badges, and maintain study streaks to stay motivated.'
    },
    {
      icon: <Clock className="w-8 h-8 text-purple-500" />,
      title: 'Past Papers',
      description: 'Practice with real past papers and get instant feedback on your performance.'
    },
    {
      icon: <Users className="w-8 h-8 text-pink-500" />,
      title: 'Community Support',
      description: 'Connect with fellow students and share your learning journey together.'
    },
    {
      icon: <Shield className="w-8 h-8 text-blue-500" />,
      title: 'Stress-Free Learning',
      description: 'Learn at your own pace with our calm, supportive learning environment.'
    }
  ]

  const stats = [
    { number: '50+', label: 'Lessons' },
    { number: '4', label: 'Streams' },
    { number: '24/7', label: 'AI Support' },
    { number: '100%', label: 'Free' }
  ]

  const testimonials = [
    {
      name: 'Kamal Perera',
      role: 'Physical Science Student',
      comment: 'Akura helped me understand physics concepts easily. The mindmaps are amazing!',
      rating: 5
    },
    {
      name: 'Nimali Fernando',
      role: 'Commerce Student',
      comment: 'The past papers and quizzes helped me prepare for my exams with confidence.',
      rating: 5
    },
    {
      name: 'Sahan Wijesinghe',
      role: 'Technology Student',
      comment: 'AI assistant is a game-changer! I get help whenever I need it, day or night.',
      rating: 5
    }
  ]

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      
      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'glass shadow-lg border-b border-white/20 dark:border-white/5' 
          : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/25">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Akura
              </span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
              <Link href="#features" className="text-sm text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                Features
              </Link>
              <Link href="#testimonials" className="text-sm text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                Testimonials
              </Link>
              <Link href="#stats" className="text-sm text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                Stats
              </Link>
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="px-5 py-2 text-sm font-medium text-slate-700 dark:text-white hover:bg-white/20 rounded-xl transition"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="px-5 py-2 text-sm font-medium bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg hover:shadow-indigo-500/25 transition flex items-center gap-2"
                >
                  Sign Up Free
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-white/10 rounded-xl transition"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden glass border-t border-white/20 dark:border-white/5 p-4"
          >
            <div className="flex flex-col gap-4">
              <Link href="#features" className="text-sm text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition px-4 py-2 rounded-xl hover:bg-white/10">
                Features
              </Link>
              <Link href="#testimonials" className="text-sm text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition px-4 py-2 rounded-xl hover:bg-white/10">
                Testimonials
              </Link>
              <Link href="#stats" className="text-sm text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition px-4 py-2 rounded-xl hover:bg-white/10">
                Stats
              </Link>
              <div className="flex flex-col gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                <Link
                  href="/login"
                  className="px-4 py-2 text-center text-sm font-medium text-slate-700 dark:text-white hover:bg-white/20 rounded-xl transition"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 text-center text-sm font-medium bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition"
                >
                  Sign Up Free
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-purple-50/50 to-pink-50/50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
          <div className="absolute top-20 left-20 w-72 h-72 bg-indigo-300/20 dark:bg-indigo-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-300/20 dark:bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-pink-300/10 dark:bg-pink-500/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-full border border-white/20 dark:border-white/5 mb-6">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                🌿 Stress-Free Learning Platform
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-slate-900 dark:text-white mb-6">
              Learn Smarter,
              <br />
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Not Harder
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-8">
              Your AI-powered study companion for A/L students. Learn without stress, 
              master with calm, and achieve your dreams.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/signup"
                className="px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-2xl hover:shadow-lg hover:shadow-indigo-500/25 transition flex items-center gap-2 text-lg"
              >
                Get Started Free
                <Rocket className="w-5 h-5" />
              </Link>
              <Link
                href="/login"
                className="px-8 py-3.5 glass text-slate-700 dark:text-white font-medium rounded-2xl hover:bg-white/20 transition text-lg border border-white/20 dark:border-white/5"
              >
                Sign In →
              </Link>
            </div>

            <div className="mt-12 flex flex-wrap justify-center gap-6">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="text-center"
                >
                  <div className="text-3xl font-bold text-slate-800 dark:text-white">{stat.number}</div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronRight className="w-6 h-6 text-slate-400 rotate-90" />
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white/50 dark:bg-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Akura combines AI, interactive learning, and community support to help you excel in your A/L exams.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -4 }}
                className="glass rounded-2xl p-6 border border-white/20 dark:border-white/5 hover:border-indigo-300 dark:hover:border-indigo-700 transition"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              What Students Say
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Join thousands of students who are already learning smarter with Akura.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass rounded-2xl p-6 border border-white/20 dark:border-white/5"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-slate-600 dark:text-slate-300 mb-4">
                  "{testimonial.comment}"
                </p>
                <div>
                  <p className="font-bold text-slate-800 dark:text-white">{testimonial.name}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{testimonial.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Start Learning?
          </h2>
          <p className="text-lg text-indigo-100 mb-8 max-w-2xl mx-auto">
            Join Akura today and experience stress-free learning with AI-powered assistance.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/signup"
              className="px-8 py-3.5 bg-white text-indigo-600 font-medium rounded-2xl hover:shadow-xl transition text-lg"
            >
              Get Started Free
            </Link>
            <Link
              href="/login"
              className="px-8 py-3.5 bg-white/20 backdrop-blur-sm text-white font-medium rounded-2xl hover:bg-white/30 transition text-lg"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <BookOpen className="w-6 h-6 text-indigo-400" />
              <span className="text-xl font-bold">Akura</span>
              <span className="text-xs text-slate-400">Learn Without Stress</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-slate-400">
              <Link href="#" className="hover:text-white transition">About</Link>
              <Link href="#" className="hover:text-white transition">Privacy</Link>
              <Link href="#" className="hover:text-white transition">Terms</Link>
              <Link href="#" className="hover:text-white transition">Contact</Link>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-500 mt-4 md:mt-0">
              <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />
              <span>Made with love for Sri Lankan students</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}