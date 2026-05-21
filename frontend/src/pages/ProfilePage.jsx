import React, { useState } from 'react'
import api from '../services/api'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { Avatar } from '../components/common/index'
import { format } from 'date-fns'

export default function ProfilePage() {
  const { user, updateUser } = useAuth()
  const [profileForm, setProfileForm] = useState({ name: user?.name || '', bio: user?.bio || '' })
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [profileLoading, setProfileLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)

  const handleProfileSave = async (e) => {
    e.preventDefault()
    setProfileLoading(true)
    try {
      const res = await api.put('/auth/profile', profileForm)
      updateUser(res.data.user)
      toast.success('Profile updated!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed')
    } finally {
      setProfileLoading(false)
    }
  }

  const handlePasswordSave = async (e) => {
    e.preventDefault()
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }
    setPasswordLoading(true)
    try {
      await api.put('/auth/change-password', passwordForm)
      toast.success('Password changed!')
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed')
    } finally {
      setPasswordLoading(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="page-title">Profile Settings</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your account information</p>
      </div>

      {/* Profile Info */}
      <div className="card p-6">
        <div className="flex items-center gap-4 mb-6">
          <Avatar name={user?.name} size="lg" />
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{user?.name}</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm">{user?.email}</p>
            <span className={`badge ${user?.role === 'admin' ? 'badge-blue' : 'badge-gray'} mt-1 capitalize`}>{user?.role}</span>
          </div>
        </div>

        <form onSubmit={handleProfileSave} className="space-y-4">
          <div>
            <label className="label">Full Name</label>
            <input
              className="input"
              value={profileForm.name}
              onChange={e => setProfileForm(f => ({ ...f, name: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="label">Email Address</label>
            <input className="input bg-gray-50 dark:bg-gray-700" value={user?.email} disabled />
            <p className="text-xs text-gray-400 mt-1">Email cannot be changed.</p>
          </div>
          <div>
            <label className="label">Bio</label>
            <textarea
              className="input resize-none"
              rows={3}
              value={profileForm.bio}
              onChange={e => setProfileForm(f => ({ ...f, bio: e.target.value }))}
              placeholder="Tell your team a little about yourself..."
              maxLength={200}
            />
            <p className="text-xs text-gray-400 mt-1">{profileForm.bio.length}/200 characters</p>
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={profileLoading} className="btn-primary">
              {profileLoading ? <LoadingSpinner size="sm" /> : null}
              {profileLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Change Password */}
      <div className="card p-6">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4 font-heading">Change Password</h3>
        <form onSubmit={handlePasswordSave} className="space-y-4">
          <div>
            <label className="label">Current Password</label>
            <input
              className="input"
              type="password"
              value={passwordForm.currentPassword}
              onChange={e => setPasswordForm(f => ({ ...f, currentPassword: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="label">New Password</label>
            <input
              className="input"
              type="password"
              value={passwordForm.newPassword}
              onChange={e => setPasswordForm(f => ({ ...f, newPassword: e.target.value }))}
              required
              minLength={6}
            />
          </div>
          <div>
            <label className="label">Confirm New Password</label>
            <input
              className="input"
              type="password"
              value={passwordForm.confirmPassword}
              onChange={e => setPasswordForm(f => ({ ...f, confirmPassword: e.target.value }))}
              required
            />
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={passwordLoading} className="btn-primary">
              {passwordLoading ? <LoadingSpinner size="sm" /> : null}
              {passwordLoading ? 'Changing...' : 'Change Password'}
            </button>
          </div>
        </form>
      </div>

      {/* Account Info */}
      <div className="card p-6">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4 font-heading">Account Information</h3>
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-gray-500 dark:text-gray-400">Member since</dt>
            <dd className="text-gray-700 dark:text-gray-200 font-medium">{user?.createdAt ? format(new Date(user.createdAt), 'MMMM d, yyyy') : '—'}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500 dark:text-gray-400">Account role</dt>
            <dd className="text-gray-700 dark:text-gray-200 font-medium capitalize">{user?.role}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500 dark:text-gray-400">User ID</dt>
            <dd className="text-gray-400 font-mono text-xs">{user?._id}</dd>
          </div>
        </dl>
      </div>
    </div>
  )
}
