import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
          <span className="text-white font-bold text-sm">CS</span>
        </div>
        <span className="font-bold text-slate-800 text-lg">CivicSense</span>
      </div>
      <div className="flex items-center gap-4">
        <Link to="/" className="text-sm text-slate-600 hover:text-blue-600 font-medium">Dashboard</Link>
        <Link to="/bills" className="text-sm text-slate-600 hover:text-blue-600 font-medium">Bills</Link>
        <Link to="/submit" className="text-sm text-slate-600 hover:text-blue-600 font-medium">Submit</Link>
        <Link to="/analysis" className="text-sm text-slate-600 hover:text-blue-600 font-medium">Analysis</Link>
        <span className="text-sm text-slate-400">|</span>
        <span className="text-sm text-slate-500">{user?.name}</span>
        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full capitalize font-medium">{user?.role}</span>
        <button
          onClick={handleLogout}
          className="text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg transition"
        >
          Logout
        </button>
      </div>
    </nav>
  )
}