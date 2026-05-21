import React, { useState, useEffect, useCallback } from 'react'
import api from '../services/api'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { Avatar, EmptyState, ConfirmDialog } from '../components/common/index'
import { format } from 'date-fns'

export default function UsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [saving, setSaving] = useState(false)
  const { user: me } = useAuth()

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (roleFilter) params.set('role', roleFilter)
      const res = await api.get(`/users?${params}`)
      setUsers(res.data.users)
    } catch {
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }, [search, roleFilter])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  const toggleRole = async (u) => {
    try {
      const newRole = u.role === 'admin' ? 'member' : 'admin'
      await api.put(`/users/${u._id}/role`, { role: newRole })
      toast.success(`Role changed to ${newRole}`)
      fetchUsers()
    } catch { toast.error('Failed') }
  }

  const toggleStatus = async (u) => {
    try {
      await api.put(`/users/${u._id}/toggle-status`)
      toast.success(`User ${u.isActive ? 'deactivated' : 'activated'}`)
      fetchUsers()
    } catch { toast.error('Failed') }
  }

  const handleDelete = async () => {
    setSaving(true)
    try {
      await api.delete(`/users/${deleteTarget._id}`)
      toast.success('User deleted')
      setDeleteTarget(null)
      fetchUsers()
    } catch { toast.error('Failed') } finally { setSaving(false) }
  }

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Team Members</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{users.length} members total</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input className="input pl-9" placeholder="Search members..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input w-auto" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="member">Member</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
      ) : users.length === 0 ? (
        <EmptyState
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
          title="No users found"
        />
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
              <tr>
                {['Member', 'Role', 'Status', 'Joined', 'Last Login', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {users.map(u => (
                <tr key={u._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={u.name} />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{u.name}</p>
                        <p className="text-xs text-gray-500">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${u.role === 'admin' ? 'badge-blue' : 'badge-gray'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${u.isActive ? 'badge-green' : 'badge-red'}`}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                    {format(new Date(u.createdAt), 'MMM d, yyyy')}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                    {u.lastLogin ? format(new Date(u.lastLogin), 'MMM d, yyyy') : 'Never'}
                  </td>
                  <td className="px-4 py-3">
                    {u._id !== me?._id && (
                      <div className="flex items-center gap-2">
                        <button onClick={() => toggleRole(u)} className="text-xs text-blue-600 hover:underline" title="Toggle Role">
                          {u.role === 'admin' ? 'Make Member' : 'Make Admin'}
                        </button>
                        <span className="text-gray-300">|</span>
                        <button onClick={() => toggleStatus(u)} className={`text-xs hover:underline ${u.isActive ? 'text-orange-600' : 'text-green-600'}`}>
                          {u.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <span className="text-gray-300">|</span>
                        <button onClick={() => setDeleteTarget(u)} className="text-xs text-red-600 hover:underline">Delete</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={saving}
        title="Delete User"
        message={`Delete "${deleteTarget?.name}"? This cannot be undone.`}
      />
    </div>
  )
}
