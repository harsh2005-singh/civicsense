import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import { useBills } from '../api/hooks'

export default function Dashboard() {
  const { user } = useAuth()
  const { data: billsData, isLoading } = useBills()
  const bills = billsData?.bills || []

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
          <p className="text-slate-500 mt-1">
            Welcome back, {user?.name} ·{' '}
            <span className="capitalize font-medium text-blue-600">{user?.role}</span>
          </p>
        </div>

        {/* stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total Bills', value: bills.length, bg: 'bg-blue-600' },
            { label: 'Open Bills', value: bills.filter(b => b.status === 'open').length, bg: 'bg-green-500' },
            { label: 'Total Comments', value: bills.reduce((a, b) => a + (b.totalComments || 0), 0), bg: 'bg-purple-600' },
          ].map(stat => (
            <div key={stat.label} className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
              <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center`}>
                <span className="text-white font-bold text-lg">{stat.value}</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-800">{stat.value}</div>
                <div className="text-sm text-slate-500">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* quick actions */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Create Bill', desc: 'Add a new piece of legislation', to: '/bills', color: 'blue' },
            { label: 'Submit Comments', desc: 'Upload stakeholder feedback', to: '/submit', color: 'purple' },
            { label: 'View Analysis', desc: 'See AI insights and charts', to: '/analysis', color: 'green' },
          ].map(action => (
            <Link
              key={action.label}
              to={action.to}
              className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition hover:border-blue-200 group"
            >
              <div className={`text-${action.color}-600 font-semibold mb-1 group-hover:text-${action.color}-700`}>
                {action.label} →
              </div>
              <div className="text-sm text-slate-500">{action.desc}</div>
            </Link>
          ))}
        </div>

        {/* bills table */}
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="font-semibold text-slate-800">All Bills</h2>
            <Link to="/bills" className="text-sm bg-blue-600 text-white px-4 py-1.5 rounded-lg hover:bg-blue-700 transition">
              + New Bill
            </Link>
          </div>

          {isLoading ? (
            <div className="p-8 text-center text-slate-400 animate-pulse">Loading...</div>
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
                      bill.status === 'open'   ? 'bg-green-100 text-green-700' :
                      bill.status === 'draft'  ? 'bg-yellow-100 text-yellow-700' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {bill.status}
                    </span>
                    <Link
                      to={`/analysis?billId=${bill._id}`}
                      className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-lg hover:bg-blue-100 transition"
                    >
                      View Analysis
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