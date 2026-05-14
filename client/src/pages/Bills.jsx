import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../api/axios'
import toast from 'react-hot-toast'

export default function Bills() {
  const qc = useQueryClient()
  const [form, setForm] = useState({ title: '', description: '', billNumber: '', category: '' })
  const [showForm, setShowForm] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['bills'],
    queryFn: () => api.get('/bills').then(r => r.data),
  })

  const createMutation = useMutation({
    mutationFn: (body) => api.post('/bills', body),
    onSuccess: () => {
      toast.success('Bill created!')
      qc.invalidateQueries(['bills'])
      setShowForm(false)
      setForm({ title: '', description: '', billNumber: '', category: '' })
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed'),
  })

  const bills = data?.bills || []

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-sm">CS</span>
          </div>
          <span className="font-bold text-slate-800 text-lg">CivicSense</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/" className="text-sm text-slate-600 hover:text-blue-600">Dashboard</Link>
          <Link to="/submit" className="text-sm text-slate-600 hover:text-blue-600">Submit</Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Bills</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium"
          >
            {showForm ? 'Cancel' : '+ New Bill'}
          </button>
        </div>

        {/* create form */}
        {showForm && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
            <h2 className="font-semibold text-slate-800 mb-4">Create New Bill</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                <input
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="Clean Energy Act 2025"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Bill Number</label>
                <input
                  value={form.billNumber}
                  onChange={e => setForm({ ...form, billNumber: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="CEA-2025-001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                <input
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="Environment"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                  placeholder="Describe the bill..."
                />
              </div>
            </div>
            <button
              onClick={() => createMutation.mutate(form)}
              disabled={createMutation.isPending}
              className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium disabled:opacity-50"
            >
              {createMutation.isPending ? 'Creating...' : 'Create Bill'}
            </button>
          </div>
        )}

        {/* bills list */}
        <div className="bg-white rounded-xl border border-slate-200">
          {isLoading ? (
            <div className="p-6 text-center text-slate-400">Loading...</div>
          ) : bills.length === 0 ? (
            <div className="p-12 text-center text-slate-400">No bills yet. Create one above!</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {bills.map(bill => (
                <div key={bill._id} className="px-6 py-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-slate-800">{bill.title}</p>
                      <p className="text-sm text-slate-500 mt-0.5">{bill.billNumber} · {bill.category}</p>
                      <p className="text-sm text-slate-600 mt-1">{bill.description}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                      <span className="text-sm text-slate-500">{bill.totalComments} comments</span>
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${
                        bill.status === 'open' ? 'bg-green-100 text-green-700' :
                        bill.status === 'draft' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {bill.status}
                      </span>
                      <Link
                        to={`/submit?billId=${bill._id}`}
                        className="text-xs bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition"
                      >
                        Add Comments
                      </Link>
                    </div>
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