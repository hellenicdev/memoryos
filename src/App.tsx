import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import AppLayout from './components/layout/AppLayout'
import CookieConsent from './components/CookieConsent'
import Loading from './components/Loading'
import './styles/dashboard.css'
import './styles/components.css'

const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Memories = lazy(() => import('./pages/Memories'))
const MemoryDetails = lazy(() => import('./pages/MemoryDetails'))
const Projects = lazy(() => import('./pages/Projects'))
const ProjectDetails = lazy(() => import('./pages/ProjectDetails'))
const TimelinePage = lazy(() => import('./pages/TimelinePage'))
const AIChatPage = lazy(() => import('./pages/AIChatPage'))
const Settings = lazy(() => import('./pages/Settings'))
const Billing = lazy(() => import('./pages/Billing'))
const Landing = lazy(() => import('./pages/Landing'))

function App() {
  const { user } = useAuth()

  return (
    <>
      <CookieConsent />
      <Suspense fallback={<Loading fullScreen />}>
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
      </Suspense>
    </>
  )
}

export default App
