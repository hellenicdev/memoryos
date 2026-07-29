import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Bell, Settings as SettingsIcon, LogOut } from 'lucide-react'
import api from '../services/api'

interface Notification {
  _id: string
  title: string
  message: string
  type: string
  read: boolean
  createdAt: string
}

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [showNotifications, setShowNotifications] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await api.get('/notifications')
        setNotifications(res.data.notifications)
        setUnreadCount(res.data.unreadCount)
      } catch {}
    }
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <span className="navbar-greeting">
          {getGreeting()}, {user?.name}
        </span>
      </div>

      <div className="navbar-right">
        <div ref={notifRef} style={{ position: 'relative' }}>
          <div className="notification-bell" onClick={() => setShowNotifications(!showNotifications)}>
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="notification-badge">{unreadCount}</span>
            )}
          </div>

          {showNotifications && (
            <div className="notification-dropdown">
              {notifications.length === 0 ? (
                <div style={{ padding: 16, textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  No notifications
                </div>
              ) : (
                notifications.slice(0, 10).map((n) => (
                  <div key={n._id} className={`notification-item ${!n.read ? 'unread' : ''}`}>
                    <div className="notification-item-title">{n.title}</div>
                    <div className="notification-item-message">{n.message}</div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <button className="button-ghost" onClick={() => navigate('/settings')} style={{ padding: 8 }}>
          <SettingsIcon size={18} />
        </button>

        <button className="button-ghost" onClick={logout} style={{ padding: 8 }}>
          <LogOut size={18} />
        </button>

        <div className="navbar-avatar">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
