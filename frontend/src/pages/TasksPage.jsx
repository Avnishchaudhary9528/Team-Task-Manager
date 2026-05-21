import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { StatusBadge, PriorityBadge, Avatar, EmptyState } from '../components/common/index'
import { format } from 'date-fns'

export default function TasksPage() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ status: '', priority: '', search: '', overdue: '' })
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({})
  const { user } = useAuth()

  const fetchTasks = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page, limit: 15 })
      if (filters.status) params.set('status', filters.status)
      if (filters.priority) params.set('priority', filters.priority)
      if (filters.search) params.set('search', filters.search)
      if (filters.overdue) params.set('overdue', 'true')
      const res = await api.get(`/tasks?${params}`)
      setTasks(res.data.tasks)
      setPagination(res.data.pagination)
    } catch {
      toast.error('Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }, [page, filters])

  useEffect(() => { fetchTasks() }, [fetchTasks])

  const updateStatus = async (taskId, status) => {
    try {
      await api.put(`/tasks/${taskId}`, { status })
      toast.success('Status updated')
      fetchTasks()
    } catch { toast.error('Failed') }
  }

  const setFilter = k => v => { setFilters(f => ({ ...f, [k]: v })); setPage(1) }

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Tasks</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{pagination.total || 0} tasks total</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-40">
          <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input className="input pl-9" placeholder="Search tasks..." value={filters.search} onChange={e => setFilter('search')(e.target.value)} />
        </div>
        <select className="input w-auto" value={filters.status} onChange={e => setFilter('status')(e.target.value)}>
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
        <select className="input w-auto" value={filters.priority} onChange={e => setFilter('priority')(e.target.value)}>
          <option value="">All Priority</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" className="rounded" checked={filters.overdue === 'true'} onChange={e => setFilter('overdue')(e.target.checked ? 'true' : '')} />
          <span className="text-sm text-gray-600 dark:text-gray-300">Overdue only</span>
        </label>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
      ) : tasks.length === 0 ? (
        <EmptyState
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2" /></svg>}
          title="No tasks found"
          description="Tasks assigned to you will appear here."
        />
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
              <tr>
                {['Task', 'Project', 'Assignee', 'Priority', 'Status', 'Due Date', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {tasks.map(task => (
                <tr key={task._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link to={`/tasks/${task._id}`} className="font-medium text-gray-900 dark:text-white hover:text-primary-600 transition-colors text-sm">
                        {task.title}
                      </Link>
                      {task.isOverdue && <span className="badge-red text-xs">Overdue</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {task.project && (
                      <Link to={`/projects/${task.project._id}`} className="text-sm text-gray-500 hover:text-primary-600 dark:text-gray-400 flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: task.project.color }} />
                        {task.project.title}
                      </Link>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {task.assignedTo ? (
                      <div className="flex items-center gap-2">
                        <Avatar name={task.assignedTo.name} size="sm" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">{task.assignedTo.name}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">Unassigned</span>
                    )}
                  </td>
                  <td className="px-4 py-3"><PriorityBadge priority={task.priority} /></td>
                  <td className="px-4 py-3">
                    <select
                      className="text-xs border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200"
                      value={task.status}
                      onChange={e => updateStatus(task._id, e.target.value)}
                    >
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                    {task.dueDate ? format(new Date(task.dueDate), 'MMM d, yyyy') : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <Link to={`/tasks/${task._id}`} className="text-xs text-primary-600 hover:underline">View</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pagination.pages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 rounded text-sm ${p === page ? 'bg-primary-600 text-white' : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:bg-gray-50'}`}>
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
