import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Bills from './pages/Bills'
import Submit from './pages/Submit'
import Analysis from './pages/Analysis'
import Demo from './pages/Demo'
import Admin from './pages/Admin'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"        element={<Landing />} />
        <Route path="/login"   element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/demo"    element={<Demo />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/bills"   element={<ProtectedRoute><Bills /></ProtectedRoute>} />
        <Route path="/submit"  element={<ProtectedRoute><Submit /></ProtectedRoute>} />
        <Route path="/analysis" element={<ProtectedRoute><Analysis /></ProtectedRoute>} />
        <Route path="/admin"   element={<ProtectedRoute><Admin /></ProtectedRoute>} />
        <Route path="*"        element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}