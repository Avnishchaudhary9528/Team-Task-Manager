import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { StatusBadge, PriorityBadge, Avatar } from '../components/common/index'
import { format, isValid } from 'date-fns'

function StatCard({ label, value, icon, color, sub }) {
  return (
    <div className="card p-5 flex items-start gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{label}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white font-heading">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export default function DashboardPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    api.get('/dashboard/stats').then(r => setData(r.data)).catch(console.error).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
  if (!data) return <div className="text-center py-20 text-gray-500">Failed to load dashboard.</div>

  const { stats, recentTasks, recentProjects, tasksDueSoon, charts } = data

  const monthlyChartData = charts.monthlyData.map(d => ({
    name: MONTHS[d._id.month - 1],
    Total: d.total,
    Completed: d.completed,
  }))

  const priorityChartData = charts.priorityData.map(d => ({
    name: d._id.charAt(0).toUpperCase() + d._id.slice(1),
    value: d.count,
  }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="page-title">Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          Welcome back, <span className="font-medium text-gray-700 dark:text-gray-200">{user?.name}</span>
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Projects" value={stats.totalProjects} color="bg-blue-100 dark:bg-blue-900/30" icon={<FolderSvg />} sub={`${stats.activeProjects} active`} />
        <StatCard label="Total Tasks" value={stats.totalTasks} color="bg-purple-100 dark:bg-purple-900/30" icon={<TaskSvg />} sub={`${stats.completionRate}% done`} />
        <StatCard label="Completed" value={stats.completedTasks} color="bg-green-100 dark:bg-green-900/30" icon={<CheckSvg />} sub="Tasks finished" />
        <StatCard label="Overdue" value={stats.overdueTasks} color="bg-red-100 dark:bg-red-900/30" icon={<WarnSvg />} sub="Need attention" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="card p-5 lg:col-span-2">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4 font-heading">Task Activity (Last 6 Months)</h3>
          {monthlyChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlyChartData} barSize={20} barGap={4}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="Total" fill="#bfdbfe" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Completed" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-gray-400 text-sm">No data yet</div>
          )}
        </div>

        <div className="card p-5">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4 font-heading">Priority Breakdown</h3>
          {priorityChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={priorityChartData} cx="50%" cy="45%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                  {priorityChartData.map((_, i) => (
                    <Cell key={i} fill={['#22c55e', '#f59e0b', '#ef4444'][i] || COLORS[i]} />
                  ))}
                </Pie>
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-gray-400 text-sm">No data yet</div>
          )}
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Tasks due soon */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white font-heading">Due Soon</h3>
            <Link to="/tasks" className="text-xs text-primary-600 hover:underline">View all</Link>
          </div>
          {tasksDueSoon.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">No tasks due soon</p>
          ) : (
            <div className="space-y-3">
              {tasksDueSoon.map(task => (
                <Link key={task._id} to={`/tasks/${task._id}`} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{task.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{task.project?.title}</p>
                  </div>
                  {task.dueDate && isValid(new Date(task.dueDate)) && (
                    <span className="text-xs text-orange-600 whitespace-nowrap">{format(new Date(task.dueDate), 'MMM d')}</span>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent tasks */}
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white font-heading">Recent Tasks</h3>
            <Link to="/tasks" className="text-xs text-primary-600 hover:underline">View all</Link>
          </div>
          {recentTasks.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">No tasks yet</p>
          ) : (
            <div className="space-y-2">
              {recentTasks.map(task => (
                <Link key={task._id} to={`/tasks/${task._id}`} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{task.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{task.project?.title}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <PriorityBadge priority={task.priority} />
                    <StatusBadge status={task.status} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function FolderSvg() {
  return <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" /></svg>
}
function TaskSvg() {
  return <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
}
function CheckSvg() {
  return <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
}
function WarnSvg() {
  return <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
}
