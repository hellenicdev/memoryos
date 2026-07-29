import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard, Brain, FolderOpen, Clock, Bot, Settings, LogOut,
} from 'lucide-react'

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/memories', label: 'Memories', icon: Brain },
  { path: '/projects', label: 'Projects', icon: FolderOpen },
  { path: '/timeline', label: 'Timeline', icon: Clock },
  { path: '/ai', label: 'AI Assistant', icon: Bot },
  { path: '/settings', label: 'Settings', icon: Settings },
]

const Sidebar = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()

  return (
    <aside className="sidebar">
      <div className="sidebar-logo" onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>
        <Brain size={28} />
        <h1>MemoryOS</h1>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path ||
            (item.path === '/memories' && location.pathname.startsWith('/memories'))
          return (
            <div
              key={item.path}
              className={`sidebar-item ${isActive ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </div>
          )
        })}
      </nav>

      <div className="sidebar-footer">
        {user && (
          <div className="sidebar-item" style={{ marginBottom: 4 }}>
            <div className="navbar-avatar" style={{ width: 24, height: 24, fontSize: '0.65rem' }}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 500 }}>{user.name}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                <span className={`badge badge-${user.plan}`}>{user.plan}</span>
              </div>
            </div>
          </div>
        )}
        <div className="sidebar-item" onClick={logout}>
          <LogOut size={18} />
          <span>Logout</span>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
