import React, { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../services/api'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { StatusBadge, PriorityBadge, Avatar } from '../components/common/index'
import { format } from 'date-fns'

export default function TaskDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const [task, setTask] = useState(null)
  const [loading, setLoading] = useState(true)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fetchTask = useCallback(async () => {
    try {
      const res = await api.get(`/tasks/${id}`)
      setTask(res.data.task)
    } catch {
      toast.error('Failed to load task')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { fetchTask() }, [fetchTask])

  const updateStatus = async (status) => {
    try {
      const res = await api.put(`/tasks/${id}`, { status })
      setTask(res.data.task)
      toast.success('Status updated')
    } catch { toast.error('Failed') }
  }

  const submitComment = async () => {
    if (!comment.trim()) return
    setSubmitting(true)
    try {
      await api.post(`/tasks/${id}/comments`, { text: comment })
      setComment('')
      toast.success('Comment added')
      fetchTask()
    } catch { toast.error('Failed') } finally { setSubmitting(false) }
  }

  const deleteComment = async (commentId) => {
    try {
      await api.delete(`/tasks/${id}/comments/${commentId}`)
      toast.success('Comment deleted')
      fetchTask()
    } catch { toast.error('Failed') }
  }

  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
  if (!task) return <div className="text-center py-20 text-gray-500">Task not found.</div>

  const canEditStatus = user?.role === 'admin' || task.assignedTo?._id === user?._id || task.createdBy?._id === user?._id

  return (
    <div className="max-w-4xl space-y-5">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link to="/tasks" className="hover:text-primary-600">Tasks</Link>
        <span>/</span>
        {task.project && <Link to={`/projects/${task.project._id}`} className="hover:text-primary-600">{task.project.title}</Link>}
        <span>/</span>
        <span className="text-gray-700 dark:text-gray-200 truncate">{task.title}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-5">
          <div className="card p-6">
            <div className="flex items-start justify-between mb-3">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white font-heading flex-1 mr-4">{task.title}</h1>
              {task.isOverdue && <span className="badge-red flex-shrink-0">Overdue</span>}
            </div>
            <div className="flex gap-2 mb-4">
              <StatusBadge status={task.status} />
              <PriorityBadge priority={task.priority} />
            </div>
            {task.description ? (
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{task.description}</p>
            ) : (
              <p className="text-gray-400 text-sm italic">No description provided.</p>
            )}
          </div>

          {/* Comments */}
          <div className="card p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 font-heading">
              Comments ({task.comments?.length || 0})
            </h3>
            <div className="space-y-4 mb-4">
              {task.comments?.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">No comments yet. Be the first to comment.</p>
              )}
              {task.comments?.map(c => (
                <div key={c._id} className="flex gap-3">
                  <Avatar name={c.user?.name} size="sm" className="flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{c.user?.name}</span>
                      <span className="text-xs text-gray-400">{format(new Date(c.createdAt), 'MMM d, h:mm a')}</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">{c.text}</p>
                  </div>
                  {(user?.role === 'admin' || c.user?._id === user?._id) && (
                    <button onClick={() => deleteComment(c._id)} className="text-gray-300 hover:text-red-500 mt-1 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
            <div className="flex gap-3 pt-2 border-t border-gray-100 dark:border-gray-700">
              <Avatar name={user?.name} size="sm" className="flex-shrink-0 mt-2" />
              <div className="flex-1">
                <textarea
                  className="input resize-none"
                  rows={2}
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder="Add a comment..."
                  onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) submitComment() }}
                />
                <div className="flex justify-end mt-2">
                  <button onClick={submitComment} disabled={submitting || !comment.trim()} className="btn-primary btn-sm">
                    {submitting ? <LoadingSpinner size="sm" /> : 'Post Comment'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="card p-4 space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm font-heading">Task Details</h3>

            <div>
              <p className="text-xs text-gray-500 mb-1">Status</p>
              {canEditStatus ? (
                <select
                  className="input text-sm"
                  value={task.status}
                  onChange={e => updateStatus(e.target.value)}
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              ) : (
                <StatusBadge status={task.status} />
              )}
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-1">Assigned To</p>
              {task.assignedTo ? (
                <div className="flex items-center gap-2">
                  <Avatar name={task.assignedTo.name} size="sm" />
                  <span className="text-sm text-gray-700 dark:text-gray-200">{task.assignedTo.name}</span>
                </div>
              ) : <span className="text-sm text-gray-400">Unassigned</span>}
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-1">Created By</p>
              <div className="flex items-center gap-2">
                <Avatar name={task.createdBy?.name} size="sm" />
                <span className="text-sm text-gray-700 dark:text-gray-200">{task.createdBy?.name}</span>
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-1">Project</p>
              {task.project && (
                <Link to={`/projects/${task.project._id}`} className="text-sm text-primary-600 hover:underline flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: task.project.color }} />
                  {task.project.title}
                </Link>
              )}
            </div>

            {task.dueDate && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Due Date</p>
                <p className={`text-sm font-medium ${task.isOverdue ? 'text-red-600' : 'text-gray-700 dark:text-gray-200'}`}>
                  {format(new Date(task.dueDate), 'MMM d, yyyy')}
                  {task.isOverdue && ' (Overdue)'}
                </p>
              </div>
            )}

            {task.completedAt && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Completed</p>
                <p className="text-sm text-green-600">{format(new Date(task.completedAt), 'MMM d, yyyy h:mm a')}</p>
              </div>
            )}

            <div>
              <p className="text-xs text-gray-500 mb-1">Created</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">{format(new Date(task.createdAt), 'MMM d, yyyy')}</p>
            </div>
          </div>

          {/* Activity */}
          {task.activity?.length > 0 && (
            <div className="card p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm font-heading mb-3">Activity</h3>
              <div className="space-y-2">
                {task.activity.slice(-5).reverse().map((a, i) => (
                  <div key={i} className="flex gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <Avatar name={a.user?.name} size="sm" className="flex-shrink-0" />
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-200">{a.user?.name}</span>
                      {' '}{a.action}
                      {a.field && ` ${a.field}`}
                      {a.newValue && ` → ${a.newValue}`}
                      <div className="text-gray-400">{a.createdAt && format(new Date(a.createdAt), 'MMM d, h:mm a')}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
