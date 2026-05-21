import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import LoadingSpinner from '../components/common/LoadingSpinner'

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(form.email, form.password)
      toast.success('Welcome back!')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const fillDemo = (role) => {
    if (role === 'admin') setForm({ email: 'admin@demo.com', password: 'demo1234' })
    else setForm({ email: 'member@demo.com', password: 'demo1234' })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-4xl flex rounded-3xl overflow-hidden shadow-2xl bg-white/70 dark:bg-gray-800/80 backdrop-blur-xl border border-white/60 dark:border-gray-700">

        {/* Left Panel */}
        <div className="hidden lg:flex lg:w-5/12 bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 flex-col justify-between p-10 text-white relative overflow-hidden">
          {/* Background circles */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

          <div className="relative z-10">
            {/* Logo */}
            <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center mb-8">
              <span className="text-white font-bold text-xl">E</span>
            </div>
            <p className="text-white/60 text-xs tracking-widest font-medium mb-4">COLLABORATE · TRACK · DELIVER</p>
            <h1 className="text-3xl font-bold leading-tight mb-4">Team Task Manager<br /><span className="text-white/70 text-lg font-normal">by Ethara.AI</span></h1>
            <p className="text-blue-100 text-sm leading-relaxed mb-8">
              Role-based projects, task boards, and delivery analytics in one calm workspace.
            </p>
            <ul className="space-y-3">
              {['Admin & member workflows', 'Live task board & filters', 'JWT-secured API'].map(item => (
                <li key={item} className="flex items-center gap-2 text-sm text-blue-100">
                  <span className="w-1.5 h-1.5 bg-blue-300 rounded-full flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative z-10 text-xs text-white/40">© 2025 Ethara.AI</div>
        </div>

        {/* Right Panel */}
        <div className="flex-1 flex flex-col justify-center p-8 md:p-12">
          {/* Toggle */}
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-2xl p-1 mb-10 w-full">
            <div className="flex-1 py-2.5 text-center text-sm font-semibold text-white bg-indigo-600 rounded-xl shadow">
              Log in
            </div>
            <Link to="/register" className="flex-1 py-2.5 text-center text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
              Sign up
            </Link>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Welcome back</h2>
          <p className="text-gray-400 text-sm mb-8">Sign in to continue to your workspace</p>

          {/* Demo buttons */}
          <div className="flex gap-2 mb-6">
            <button onClick={() => fillDemo('admin')}
              className="flex-1 py-2 text-xs font-semibold rounded-xl border-2 border-indigo-200 dark:border-indigo-700 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors">
              Admin 
            </button>
            <button onClick={() => fillDemo('member')}
              className="flex-1 py-2 text-xs font-semibold rounded-xl border-2 border-violet-200 dark:border-violet-700 text-violet-600 dark:text-violet-300 hover:bg-violet-50 dark:hover:bg-violet-900/30 transition-colors">
              Member 
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                required
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Password</label>
              <input
                type="password"
                placeholder="Your password"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                required
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-2xl transition-all shadow-lg shadow-indigo-200 dark:shadow-indigo-900/40 flex items-center justify-center gap-2 mt-2"
            >
              {loading && <LoadingSpinner size="sm" />}
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-8">
            Don't have an account?{' '}
            <Link to="/register" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">Create account</Link>
          </p>
        </div>
      </div>
    </div>
  )
}