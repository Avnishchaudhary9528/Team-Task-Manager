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
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary-600 flex-col justify-center items-center p-12 text-white">
        <div className="max-w-md text-center">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-8">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-9 h-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold font-heading mb-4">Team Task Manager</h1>
          <p className="text-primary-100 text-lg leading-relaxed">
            Collaborate smarter. Manage projects, assign tasks, and track progress — all in one place.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-6">
            {[['Projects', 'Organize work into structured projects'], ['Tasks', 'Assign & track tasks with deadlines'], ['Teams', 'Manage members & roles']].map(([t, d]) => (
              <div key={t} className="bg-white/10 rounded-xl p-4">
                <div className="text-lg font-bold mb-1">{t}</div>
                <div className="text-xs text-primary-100">{d}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white font-heading">Welcome back</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Sign in to your account to continue</p>
          </div>

          {/* Demo credentials */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
            <p className="text-xs text-blue-700 dark:text-blue-300 font-semibold mb-2">Demo Credentials</p>
            <div className="flex gap-2">
              <button onClick={() => fillDemo('admin')} className="text-xs bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-200 px-2 py-1 rounded hover:bg-blue-200 transition-colors">Admin Login</button>
              <button onClick={() => fillDemo('member')} className="text-xs bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-200 px-2 py-1 rounded hover:bg-blue-200 transition-colors">Member Login</button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email Address</label>
              <input
                type="email"
                className="input"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="label">Password</label>
              <input
                type="password"
                className="input"
                placeholder="Your password"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                required
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full btn-lg mt-2">
              {loading ? <LoadingSpinner size="sm" /> : null}
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-600 hover:underline font-medium">Create account</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
