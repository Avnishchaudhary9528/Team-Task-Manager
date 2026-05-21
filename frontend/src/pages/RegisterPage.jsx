import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import LoadingSpinner from '../components/common/LoadingSpinner'

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    setLoading(true)
    try {
      await register(form.name, form.email, form.password)
      toast.success('Account created successfully!')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }))

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900">
      <div className="hidden lg:flex lg:w-1/2 bg-primary-700 flex-col justify-center items-center p-12 text-white">
        <div className="max-w-md text-center">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-8">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-9 h-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold font-heading mb-4">Join Your Team</h1>
          <p className="text-primary-100 text-lg">Create your account and start collaborating with your team today.</p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white font-heading">Create Account</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Fill in the details to get started</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <input type="text" className="input" placeholder="John Doe" value={form.name} onChange={set('name')} required />
            </div>
            <div>
              <label className="label">Email Address</label>
              <input type="email" className="input" placeholder="you@example.com" value={form.email} onChange={set('email')} required />
            </div>
            <div>
              <label className="label">Password</label>
              <input type="password" className="input" placeholder="At least 6 characters" value={form.password} onChange={set('password')} required />
            </div>
            <div>
              <label className="label">Confirm Password</label>
              <input type="password" className="input" placeholder="Repeat your password" value={form.confirmPassword} onChange={set('confirmPassword')} required />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full btn-lg mt-2">
              {loading ? <LoadingSpinner size="sm" /> : null}
              {loading ? 'Creating...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 hover:underline font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
