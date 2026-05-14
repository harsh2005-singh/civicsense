import { useAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import api from '../api/axios'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const { data: billsData, isLoading } = useQuery({
    queryKey: ['bills'],
    queryFn: () => api.get('/bills').then(r => r.data),
  })

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const bills = billsData?.bills || []

  return (
    <div className="min-h-screen bg-slate-50">

      {/* navbar */}
      <nav className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-sm">CS</span>
          </div>
          <span className="font-bold text-slate-800 text-lg">CivicSense</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/bills" className="text-sm text-slate-600 hover:text-blue-600 font-medium">Bills</Link>
          <Link to="/submit" className="text-sm text-slate-600 hover:text-blue-600 font-medium">Submit</Link>
          <span className="text-sm text-slate-500">Hi, {user?.name}</span>
          <button
            onClick={handleLogout}
            className="text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg transition"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* welcome */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
          <p className="text-slate-500 mt-1">Welcome back, {user?.name} · Role: <span className="capitalize font-medium text-blue-600">{user?.role}</span></p>
        </div>

        {/* stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total Bills', value: bills.length, color: 'bg-blue-600' },
            { label: 'Open Bills', value: bills.filter(b => b.status === 'open').length, color: 'bg-green-500' },
            { label: 'Total Comments', value: bills.reduce((a, b) => a + (b.totalComments || 0), 0), color: 'bg-purple-600' },
          ].map(stat => (
            <div key={stat.label} className="bg-white rounded-xl border border-slate-200 p-5">
              <div className={`w-10 h-10 ${stat.color} rounded-lg mb-3`} />
              <div className="text-2xl font-bold text-slate-800">{stat.value}</div>
              <div className="text-sm text-slate-500 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* bills list */}
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="font-semibold text-slate-800">Recent Bills</h2>
            <Link
              to="/bills"
              className="text-sm bg-blue-600 text-white px-4 py-1.5 rounded-lg hover:bg-blue-700 transition"
            >
              + New Bill
            </Link>
          </div>

          {isLoading ? (
            <div className="p-6 text-center text-slate-400">Loading...</div>
          ) : bills.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <p className="text-lg font-medium">No bills yet</p>
              <p className="text-sm mt-1">Create your first bill to get started</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {bills.map(bill => (
                <div key={bill._id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50">
                  <div>
                    <p className="font-medium text-slate-800">{bill.title}</p>
                    <p className="text-sm text-slate-500 mt-0.5">{bill.billNumber} · {bill.category}</p>
                  </div>
                  <div className="flex items-center gap-3">
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
                      className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-lg hover:bg-blue-100 transition"
                    >
                      Submit Comments
                    </Link>
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