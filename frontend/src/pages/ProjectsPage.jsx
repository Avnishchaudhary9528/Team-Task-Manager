import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from '../components/common/LoadingSpinner'
import Modal from '../components/common/Modal'
import { StatusBadge, PriorityBadge, Avatar, EmptyState, ConfirmDialog } from '../components/common/index'
import { format } from 'date-fns'

function ProjectForm({ initial, onSubmit, loading }) {
  const [form, setForm] = useState({
    title: initial?.title || '',
    description: initial?.description || '',
    status: initial?.status || 'planning',
    priority: initial?.priority || 'medium',
    startDate: initial?.startDate ? initial.startDate.slice(0, 10) : '',
    endDate: initial?.endDate ? initial.endDate.slice(0, 10) : '',
    color: initial?.color || '#3B82F6',
  })
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit(form) }} className="space-y-4">
      <div>
        <label className="label">Title *</label>
        <input className="input" value={form.title} onChange={set('title')} required placeholder="Project title" />
      </div>
      <div>
        <label className="label">Description</label>
        <textarea className="input resize-none" rows={3} value={form.description} onChange={set('description')} placeholder="What's this project about?" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Status</label>
          <select className="input" value={form.status} onChange={set('status')}>
            {['planning', 'active', 'on-hold', 'completed'].map(s => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Priority</label>
          <select className="input" value={form.priority} onChange={set('priority')}>
            {['low', 'medium', 'high'].map(s => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Start Date</label>
          <input className="input" type="date" value={form.startDate} onChange={set('startDate')} />
        </div>
        <div>
          <label className="label">End Date</label>
          <input className="input" type="date" value={form.endDate} onChange={set('endDate')} />
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <label className="label mb-0">Color</label>
        <input type="color" value={form.color} onChange={set('color')} className="w-10 h-9 rounded border border-gray-300 cursor-pointer" />
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? <LoadingSpinner size="sm" /> : null}
          {loading ? 'Saving...' : initial ? 'Update Project' : 'Create Project'}
        </button>
      </div>
    </form>
  )
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [modal, setModal] = useState(null) // 'create' | {project}
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({})
  const { user } = useAuth()

  const fetchProjects = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page, limit: 9 })
      if (search) params.set('search', search)
      if (statusFilter) params.set('status', statusFilter)
      const res = await api.get(`/projects?${params}`)
      setProjects(res.data.projects)
      setPagination(res.data.pagination)
    } catch {
      toast.error('Failed to load projects')
    } finally {
      setLoading(false)
    }
  }, [page, search, statusFilter])

  useEffect(() => { fetchProjects() }, [fetchProjects])

  const handleCreate = async (form) => {
    setSaving(true)
    try {
      await api.post('/projects', form)
      toast.success('Project created!')
      setModal(null)
      fetchProjects()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create project')
    } finally {
      setSaving(false)
    }
  }

  const handleUpdate = async (form) => {
    setSaving(true)
    try {
      await api.put(`/projects/${modal._id}`, form)
      toast.success('Project updated!')
      setModal(null)
      fetchProjects()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update project')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setSaving(true)
    try {
      await api.delete(`/projects/${deleteTarget._id}`)
      toast.success('Project deleted')
      setDeleteTarget(null)
      fetchProjects()
    } catch {
      toast.error('Failed to delete')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Projects</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{pagination.total || 0} projects total</p>
        </div>
        <button onClick={() => setModal('create')} className="btn-primary">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Project
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input className="input pl-9" placeholder="Search projects..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
        </div>
        <select className="input w-auto" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }}>
          <option value="">All Status</option>
          {['planning', 'active', 'on-hold', 'completed'].map(s => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
      ) : projects.length === 0 ? (
        <EmptyState
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" /></svg>}
          title="No projects found"
          description="Create your first project to get started organizing your team's work."
          action={<button onClick={() => setModal('create')} className="btn-primary">Create Project</button>}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {projects.map(project => (
            <div key={project._id} className="card hover:shadow-md transition-shadow">
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: project.color || '#3b82f6' }} />
                    <Link to={`/projects/${project._id}`} className="font-semibold text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors truncate">
                      {project.title}
                    </Link>
                  </div>
                  <div className="flex gap-1 ml-2 flex-shrink-0">
                    {(user?.role === 'admin' || project.owner?._id === user?._id) && (
                      <>
                        <button onClick={() => setModal(project)} className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </button>
                        <button onClick={() => setDeleteTarget(project)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {project.description && <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">{project.description}</p>}

                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <StatusBadge status={project.status} />
                  <PriorityBadge priority={project.priority} />
                </div>

                {/* Progress */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Progress</span>
                    <span>{project.progress || 0}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                    <div
                      className="bg-primary-600 h-1.5 rounded-full transition-all"
                      style={{ width: `${project.progress || 0}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{project.completedTasks}/{project.totalTasks} tasks</p>
                </div>

                {/* Members & date */}
                <div className="flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {project.members?.slice(0, 4).map(m => (
                      <Avatar key={m.user?._id} name={m.user?.name} size="sm" className="ring-2 ring-white dark:ring-gray-800" />
                    ))}
                    {project.members?.length > 4 && (
                      <div className="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-600 ring-2 ring-white dark:ring-gray-800 flex items-center justify-center text-xs text-gray-600 dark:text-gray-300">
                        +{project.members.length - 4}
                      </div>
                    )}
                  </div>
                  {project.endDate && (
                    <span className="text-xs text-gray-400">
                      Due {format(new Date(project.endDate), 'MMM d, yyyy')}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 rounded text-sm ${p === page ? 'bg-primary-600 text-white' : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:bg-gray-50'}`}>
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal isOpen={modal === 'create'} onClose={() => setModal(null)} title="Create New Project">
        <ProjectForm onSubmit={handleCreate} loading={saving} />
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={modal && modal !== 'create'} onClose={() => setModal(null)} title="Edit Project">
        {modal && modal !== 'create' && <ProjectForm initial={modal} onSubmit={handleUpdate} loading={saving} />}
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={saving}
        title="Delete Project"
        message={`Delete "${deleteTarget?.title}" and all its tasks? This cannot be undone.`}
      />
    </div>
  )
}
