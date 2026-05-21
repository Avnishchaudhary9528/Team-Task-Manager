import React from 'react'

export function StatusBadge({ status }) {
  const map = {
    pending: 'badge-yellow',
    'in-progress': 'badge-blue',
    completed: 'badge-green',
    planning: 'badge-gray',
    active: 'badge-blue',
    'on-hold': 'badge-yellow',
    overdue: 'badge-red',
  }
  const labels = {
    'in-progress': 'In Progress',
    'on-hold': 'On Hold',
  }
  return (
    <span className={map[status] || 'badge-gray'}>
      {labels[status] || status?.charAt(0).toUpperCase() + status?.slice(1)}
    </span>
  )
}

export function PriorityBadge({ priority }) {
  const map = { low: 'badge-green', medium: 'badge-yellow', high: 'badge-red' }
  return (
    <span className={map[priority] || 'badge-gray'}>
      {priority?.charAt(0).toUpperCase() + priority?.slice(1)}
    </span>
  )
}

export function Avatar({ name, size = 'md', className = '' }) {
  const sizes = { sm: 'w-7 h-7 text-xs', md: 'w-9 h-9 text-sm', lg: 'w-11 h-11 text-base' }
  const colors = [
    'bg-blue-100 text-blue-700', 'bg-green-100 text-green-700',
    'bg-purple-100 text-purple-700', 'bg-orange-100 text-orange-700',
    'bg-pink-100 text-pink-700', 'bg-teal-100 text-teal-700',
  ]
  const colorIdx = name ? name.charCodeAt(0) % colors.length : 0
  return (
    <div className={`${sizes[size]} ${colors[colorIdx]} rounded-full flex items-center justify-center font-semibold flex-shrink-0 ${className}`}>
      {name?.charAt(0).toUpperCase() || '?'}
    </div>
  )
}

export function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4 text-gray-400">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{title}</h3>
      {description && <p className="text-gray-500 dark:text-gray-400 text-sm max-w-sm mb-4">{description}</p>}
      {action}
    </div>
  )
}

export function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmLabel = 'Delete', loading }) {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 max-w-sm w-full animate-in">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-5">{message}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="btn-secondary">Cancel</button>
          <button onClick={onConfirm} disabled={loading} className="btn-danger">
            {loading ? 'Deleting...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
