import React, { useState, useEffect, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import api from '../services/api'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from '../components/common/LoadingSpinner'
import Modal from '../components/common/Modal'
import { StatusBadge, PriorityBadge, Avatar, EmptyState, ConfirmDialog } from '../components/common/index'
import { format } from 'date-fns'

function TaskForm({ projectId, members, initial, onSubmit, loading }) {
  const [form, setForm] = useState({
    title: initial?.title || '',
    description: initial?.description || '',
    assignedTo: initial?.assignedTo?._id || '',
    priority: initial?.priority || 'medium',
    status: initial?.status || 'pending',
    dueDate: initial?.dueDate ? initial.dueDate.slice(0, 10) : '',
  })
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit({ ...form, project: projectId }) }} className="space-y-4">
      <div>
        <label className="label">Title *</label>
        <input className="input" value={form.title} onChange={set('title')} required placeholder="Task title" />
      </div>
      <div>
        <label className="label">Description</label>
        <textarea className="input resize-none" rows={3} value={form.description} onChange={set('description')} placeholder="Details..." />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Assign To</label>
          <select className="input" value={form.assignedTo} onChange={set('assignedTo')}>
            <option value="">Unassigned</option>
            {members?.map(m => (
              <option key={m.user?._id} value={m.user?._id}>{m.user?.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Priority</label>
          <select className="input" value={form.priority} onChange={set('priority')}>
            {['low', 'medium', 'high'].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Status</label>
          <select className="input" value={form.status} onChange={set('status')}>
            {['pending', 'in-progress', 'completed'].map(s => <option key={s} value={s}>{s === 'in-progress' ? 'In Progress' : s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Due Date</label>
          <input className="input" type="date" value={form.dueDate} onChange={set('dueDate')} />
        </div>
      </div>
      <div className="flex justify-end pt-2">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? <LoadingSpinner size="sm" /> : null}
          {loading ? 'Saving...' : initial ? 'Update Task' : 'Create Task'}
        </button>
      </div>
    </form>
  )
}

function AddMemberModal({ projectId, onAdded, onClose }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.get('/users').then(r => setUsers(r.data.users)).catch(console.error).finally(() => setLoading(false))
  }, [])

  const handleAdd = async (userId) => {
    setSaving(true)
    try {
      await api.post(`/projects/${projectId}/members`, { userId })
      toast.success('Member added')
      onAdded()
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add member')
    } finally {
      setSaving(false)
    }
  }

  return loading ? <div className="flex justify-center py-8"><LoadingSpinner /></div> : (
    <div className="space-y-2 max-h-72 overflow-y-auto">
      {users.map(u => (
        <div key={u._id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
          <div className="flex items-center gap-3">
            <Avatar name={u.name} size="sm" />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{u.name}</p>
              <p className="text-xs text-gray-500">{u.email}</p>
            </div>
          </div>
          <button onClick={() => handleAdd(u._id)} disabled={saving} className="btn-primary btn-sm">Add</button>
        </div>
      ))}
    </div>
  )
}

export default function ProjectDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [project, setProject] = useState(null)
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [modal, setModal] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [filters, setFilters] = useState({ status: '', priority: '', search: '' })

  const canManage = user?.role === 'admin' || project?.owner?._id === user?._id

  const fetchProject = useCallback(async () => {
    try {
      const [pRes, tRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/tasks/project/${id}`),
      ])
      setProject(pRes.data.project)
      setTasks(tRes.data.tasks)
    } catch {
      toast.error('Failed to load project')
      navigate('/projects')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { fetchProject() }, [fetchProject])

  const createTask = async (form) => {
    setSaving(true)
    try {
      await api.post('/tasks', form)
      toast.success('Task created!')
      setModal(null)
      fetchProject()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed')
    } finally { setSaving(false) }
  }

  const updateTask = async (form) => {
    setSaving(true)
    try {
      await api.put(`/tasks/${modal._id}`, form)
      toast.success('Task updated!')
      setModal(null)
      fetchProject()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed')
    } finally { setSaving(false) }
  }

  const deleteTask = async () => {
    setSaving(true)
    try {
      await api.delete(`/tasks/${deleteTarget._id}`)
      toast.success('Task deleted')
      setDeleteTarget(null)
      fetchProject()
    } catch { toast.error('Failed') } finally { setSaving(false) }
  }

  const removeMember = async (userId) => {
    try {
      await api.delete(`/projects/${id}/members/${userId}`)
      toast.success('Member removed')
      fetchProject()
    } catch { toast.error('Failed') }
  }

  const filteredTasks = tasks.filter(t => {
    if (filters.status && t.status !== filters.status) return false
    if (filters.priority && t.priority !== filters.priority) return false
    if (filters.search && !t.title.toLowerCase().includes(filters.search.toLowerCase())) return false
    return true
  })

  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
  if (!project) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <Link to="/projects" className="hover:text-primary-600">Projects</Link>
          <span>/</span>
          <span className="text-gray-700 dark:text-gray-200">{project.title}</span>
        </div>
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: project.color }} />
            <h1 className="page-title">{project.title}</h1>
            <StatusBadge status={project.status} />
            <PriorityBadge priority={project.priority} />
          </div>
          {canManage && (
            <button onClick={() => setModal('task')} className="btn-primary">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Add Task
            </button>
          )}
        </div>
        {project.description && <p className="text-gray-500 dark:text-gray-400 text-sm mt-2 max-w-2xl">{project.description}</p>}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Tasks', value: project.totalTasks },
          { label: 'Completed', value: project.completedTasks },
          { label: 'In Progress', value: project.inProgressTasks },
          { label: 'Pending', value: project.pendingTasks },
        ].map(({ label, value }) => (
          <div key={label} className="card p-4 text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white font-heading">{value}</div>
            <div className="text-xs text-gray-500 mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="card p-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600 dark:text-gray-300 font-medium">Overall Progress</span>
          <span className="font-bold text-gray-900 dark:text-white">{project.progress}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <div className="bg-primary-600 h-3 rounded-full transition-all duration-500" style={{ width: `${project.progress}%` }} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Tasks */}
        <div className="lg:col-span-2 space-y-4">
          {/* Task filters */}
          <div className="flex flex-wrap gap-2">
            <input className="input flex-1 min-w-32" placeholder="Search tasks..." value={filters.search} onChange={e => setFilters(f => ({ ...f, search: e.target.value }))} />
            <select className="input w-auto" value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
            <select className="input w-auto" value={filters.priority} onChange={e => setFilters(f => ({ ...f, priority: e.target.value }))}>
              <option value="">All Priority</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          {filteredTasks.length === 0 ? (
            <EmptyState
              icon={<svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2" /></svg>}
              title="No tasks yet"
              description="Add tasks to this project to track progress."
              action={canManage && <button onClick={() => setModal('task')} className="btn-primary">Add First Task</button>}
            />
          ) : (
            <div className="space-y-2">
              {filteredTasks.map(task => (
                <div key={task._id} className="card p-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link to={`/tasks/${task._id}`} className="font-medium text-gray-900 dark:text-white hover:text-primary-600 transition-colors">
                          {task.title}
                        </Link>
                        {task.isOverdue && <span className="badge-red text-xs">Overdue</span>}
                      </div>
                      {task.description && <p className="text-xs text-gray-500 mt-1 truncate">{task.description}</p>}
                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                        <StatusBadge status={task.status} />
                        <PriorityBadge priority={task.priority} />
                        {task.dueDate && <span className="text-xs text-gray-400">{format(new Date(task.dueDate), 'MMM d, yyyy')}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {task.assignedTo && <Avatar name={task.assignedTo.name} size="sm" />}
                      {canManage && (
                        <>
                          <button onClick={() => setModal(task)} className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                          </button>
                          <button onClick={() => setDeleteTarget(task)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Team members panel */}
        <div className="space-y-4">
          <div className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Team Members</h3>
              {canManage && (
                <button onClick={() => setModal('members')} className="text-xs text-primary-600 hover:underline">+ Add</button>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-3 p-2 rounded-lg bg-primary-50 dark:bg-primary-900/20">
                <Avatar name={project.owner?.name} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{project.owner?.name}</p>
                  <p className="text-xs text-primary-600">Owner</p>
                </div>
              </div>
              {project.members?.map(m => (
                <div key={m.user?._id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                  <Avatar name={m.user?.name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{m.user?.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{m.role}</p>
                  </div>
                  {canManage && (
                    <button onClick={() => removeMember(m.user?._id)} className="text-gray-300 hover:text-red-500 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="card p-4 text-sm space-y-2">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Project Info</h3>
            {project.startDate && <div className="flex justify-between text-gray-600 dark:text-gray-300"><span>Started</span><span>{format(new Date(project.startDate), 'MMM d, yyyy')}</span></div>}
            {project.endDate && <div className="flex justify-between text-gray-600 dark:text-gray-300"><span>Due</span><span>{format(new Date(project.endDate), 'MMM d, yyyy')}</span></div>}
            <div className="flex justify-between text-gray-600 dark:text-gray-300"><span>Created</span><span>{format(new Date(project.createdAt), 'MMM d, yyyy')}</span></div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <Modal isOpen={modal === 'task'} onClose={() => setModal(null)} title="Add Task">
        <TaskForm projectId={id} members={project.members} onSubmit={createTask} loading={saving} />
      </Modal>

      <Modal isOpen={modal && modal !== 'task' && modal !== 'members'} onClose={() => setModal(null)} title="Edit Task">
        {modal && modal !== 'task' && modal !== 'members' && (
          <TaskForm projectId={id} members={project.members} initial={modal} onSubmit={updateTask} loading={saving} />
        )}
      </Modal>

      <Modal isOpen={modal === 'members'} onClose={() => setModal(null)} title="Add Team Member">
        <AddMemberModal projectId={id} onAdded={fetchProject} onClose={() => setModal(null)} />
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={deleteTask}
        loading={saving}
        title="Delete Task"
        message={`Delete "${deleteTarget?.title}"? This cannot be undone.`}
      />
    </div>
  )
}
