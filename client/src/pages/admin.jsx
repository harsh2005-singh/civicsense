import { useState } from 'react'
import Navbar from '../components/Navbar'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../api/axios'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { Navigate } from 'react-router-dom'

export default function Admin() {
  const { user } = useAuth()
  const qc = useQueryClient()

  if (user?.role !== 'admin') return <Navigate to="/" replace />

  const { data: statsData } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => api.get('/admin/stats').then(r => r.data),
  })

  const { data: usersData, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => api.get('/admin/users').then(r => r.data),
  })

  const toggleMutation = useMutation({
    mutationFn: (id) => api.patch(`/admin/users/${id}/toggle`),
    onSuccess: () => { toast.success('User updated'); qc.invalidateQueries(['admin-users']) },
    onError: () => toast.error('Failed to update user'),
  })

  const roleMutation = useMutation({
    mutationFn: ({ id, role }) => api.patch(`/admin/users/${id}/role`, { role }),
    onSuccess: () => { toast.success('Role updated'); qc.invalidateQueries(['admin-users']) },
    onError: () => toast.error('Failed to update role'),
  })

  const users = usersData?.users || []
  const stats = statsData || {}

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Admin Panel</h1>
        <p className="text-slate-500 mb-6">Manage users and view system stats</p>

        {/* stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Users', value: stats.totalUsers, color: 'bg-blue-600' },
            { label: 'Total Bills', value: stats.totalBills, color: 'bg-purple-600' },
            { label: 'Total Comments', value: stats.totalComments, color: 'bg-green-500' },
            { label: 'Analyzed', value: stats.analyzed, color: 'bg-emerald-500' },
          ].map(stat => (
            <div key={stat.label} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
              <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center`}>
                <span className="text-white font-bold text-sm">{stat.value}</span>
              </div>
              <div>
                <div className="text-xl font-bold text-slate-800">{stat.value ?? '...'}</div>
                <div className="text-xs text-slate-500">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* users table */}
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="font-semibold text-slate-800">User Management</h2>
          </div>

          {isLoading ? (
            <div className="p-8 text-center text-slate-400 animate-pulse">Loading users...</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {users.map(u => (
                <div key={u._id} className="px-6 py-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-800">{u.name}</p>
                    <p className="text-sm text-slate-500">{u.email}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Joined {new Date(u.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {/* role selector */}
                    <select
                      value={u.role}
                      onChange={e => roleMutation.mutate({ id: u._id, role: e.target.value })}
                      disabled={u._id === user.id}
                      className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      <option value="viewer">Viewer</option>
                      <option value="analyst">Analyst</option>
                      <option value="admin">Admin</option>
                    </select>

                    {/* active toggle */}
                    <button
                      onClick={() => toggleMutation.mutate(u._id)}
                      disabled={u._id === user.id}
                      className={`text-xs font-medium px-3 py-1.5 rounded-lg transition disabled:opacity-50 ${
                        u.isActive
                          ? 'bg-green-100 text-green-700 hover:bg-red-100 hover:text-red-700'
                          : 'bg-red-100 text-red-700 hover:bg-green-100 hover:text-green-700'
                      }`}
                    >
                      {u.isActive ? 'Active' : 'Disabled'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}