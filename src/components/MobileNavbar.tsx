import { useNavigate, useLocation } from 'react-router-dom'
import { LayoutDashboard, Brain, Bot, FolderOpen, Settings } from 'lucide-react'

const mobileItems = [
  { path: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { path: '/memories', label: 'Memories', icon: Brain },
  { path: '/ai', label: 'AI', icon: Bot },
  { path: '/projects', label: 'Projects', icon: FolderOpen },
  { path: '/settings', label: 'Settings', icon: Settings },
]

const MobileNavbar = () => {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <nav className="mobile-nav">
      {mobileItems.map((item) => {
        const Icon = item.icon
        const isActive = location.pathname === item.path
        return (
          <div
            key={item.path}
            className={`mobile-nav-item ${isActive ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            <Icon size={20} />
            <span>{item.label}</span>
          </div>
        )
      })}
    </nav>
  )
}

export default MobileNavbar
