import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import AppLayout from './components/layout/AppLayout'
import CookieConsent from './components/CookieConsent'
import Login from './pages/Login'
import './styles/dashboard.css'
import './styles/components.css'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Memories from './pages/Memories'
import MemoryDetails from './pages/MemoryDetails'
import Projects from './pages/Projects'
import ProjectDetails from './pages/ProjectDetails'
import TimelinePage from './pages/TimelinePage'
import AIChatPage from './pages/AIChatPage'
import Settings from './pages/Settings'
import Billing from './pages/Billing'
import Landing from './pages/Landing'

function App() {
  const { user } = useAuth()

  return (
    <>
    <CookieConsent />
    <Routes>
      <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Landing />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/memories" element={<Memories />} />
          <Route path="/memories/:id" element={<MemoryDetails />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:id" element={<ProjectDetails />} />
          <Route path="/timeline" element={<TimelinePage />} />
          <Route path="/ai" element={<AIChatPage />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/billing" element={<Billing />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
    </>
  )
}

export default App
