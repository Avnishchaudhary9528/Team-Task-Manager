import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: HomeIcon },
  { path: '/projects', label: 'Projects', icon: FolderIcon },
  { path: '/tasks', label: 'Tasks', icon: CheckSquareIcon },
]
const adminItems = [
  { path: '/users', label: 'Team Members', icon: UsersIcon },
]

function HomeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  )
}
function FolderIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
    </svg>
  )
}
function CheckSquareIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  )
}
function UsersIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}

export default function Sidebar({ isOpen, onClose }) {
  const { user } = useAuth()

  return (
    <aside className={`
      fixed lg:static inset-y-0 left-0 z-30
      w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700
      flex flex-col transition-transform duration-300
      ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
    `}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-200 dark:border-gray-700">
        <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <div>
          <div className="font-bold text-gray-900 dark:text-white text-sm font-heading">TaskManager</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Team Workspace</div>
        </div>
        <button onClick={onClose} className="ml-auto lg:hidden text-gray-400 hover:text-gray-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-1">
        <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-3 mb-2">Main Menu</div>
        {navItems.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            onClick={onClose}
            className={({ isActive }) => isActive ? 'sidebar-link-active' : 'sidebar-link-inactive'}
          >
            <Icon />
            <span>{label}</span>
          </NavLink>
        ))}

        {user?.role === 'admin' && (
          <>
            <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-3 mt-5 mb-2">Admin</div>
            {adminItems.map(({ path, label, icon: Icon }) => (
              <NavLink
                key={path}
                to={path}
                onClick={onClose}
                className={({ isActive }) => isActive ? 'sidebar-link-active' : 'sidebar-link-inactive'}
              >
                <Icon />
                <span>{label}</span>
              </NavLink>
            ))}
          </>
        )}
      </nav>

      {/* User Info */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <NavLink to="/profile" className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
          <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center text-primary-600 dark:text-primary-400 font-semibold text-sm flex-shrink-0">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.name}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user?.role}</div>
          </div>
        </NavLink>
      </div>
    </aside>
  )
}
