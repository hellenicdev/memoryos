import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'
import { User, Shield, Download, Trash2, ExternalLink } from 'lucide-react'
import api from '../services/api'

const Settings = () => {
  const { user, updateUser, logout } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState(user?.name || '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [usage, setUsage] = useState<any>(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/user/usage').then((res) => setUsage(res.data.usage)).catch(() => {})
  }, [])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await api.put('/user/profile', { name })
      updateUser(res.data.user)
      setMessage('Profile updated')
    } catch {
      setError('Failed to update profile')
    }
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.put('/auth/password', { currentPassword, newPassword })
      setMessage('Password updated')
      setCurrentPassword('')
      setNewPassword('')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update password')
    }
  }

  const handleExport = async () => {
    try {
      const res = await api.get('/user/export')
      const blob = new Blob([JSON.stringify(res.data.data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `memoryos-export-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      setError('Failed to export data')
    }
  }

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) return
    const password = prompt('Enter your password to confirm:')
    if (!password) return

    try {
      await api.delete('/user/account', { data: { password } })
      logout()
      navigate('/')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete account')
    }
  }

  return (
    <div>
      <Navbar />
      <div className="dashboard" style={{ maxWidth: 600, paddingBottom: 80 }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: 32 }}>Settings</h1>

        {message && (
          <div style={{ padding: '10px 14px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', color: 'var(--success)', borderRadius: 'var(--radius)', marginBottom: 16, fontSize: '0.85rem' }}>
            {message}
          </div>
        )}

        {error && (
          <div className="auth-error" style={{ marginBottom: 16 }}>{error}</div>
        )}

        <div className="settings-section">
          <h2><User size={16} style={{ marginRight: 8 }} />Profile</h2>
          <form onSubmit={handleUpdateProfile} className="auth-form">
            <div>
              <label>Name</label>
              <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label>Email</label>
              <input className="input" value={user?.email || ''} disabled style={{ opacity: 0.6 }} />
            </div>
            <button className="button button-primary" type="submit">Save changes</button>
          </form>
        </div>

        <div className="settings-section">
          <h2><Shield size={16} style={{ marginRight: 8 }} />Password</h2>
          <form onSubmit={handleUpdatePassword} className="auth-form">
            <div>
              <label>Current password</label>
              <input className="input" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
            </div>
            <div>
              <label>New password</label>
              <input className="input" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} minLength={8} />
            </div>
            <button className="button button-primary" type="submit">Update password</button>
          </form>
        </div>

        <div className="settings-section">
          <h2>Subscription</h2>
          <div className="card">
            <div className="settings-row">
              <span className="settings-row-label">Current plan</span>
              <span className={`badge badge-${user?.plan || 'free'}`}>{user?.plan || 'free'}</span>
            </div>
            {usage && (
              <>
                <div className="settings-row">
                  <span className="settings-row-label">Storage used</span>
                  <span className="settings-row-value">
                    {formatBytes(usage.storageUsed)} / {formatBytes(usage.storageLimit)}
                  </span>
                </div>
                <div className="settings-row">
                  <span className="settings-row-label">AI queries</span>
                  <span className="settings-row-value">
                    {usage.aiQueriesUsed} / {usage.aiQueryLimit}
                  </span>
                </div>
              </>
            )}
            <button className="button button-secondary" onClick={() => navigate('/billing')} style={{ marginTop: 12, width: '100%', justifyContent: 'center' }}>
              <ExternalLink size={14} /> Manage subscription
            </button>
          </div>
        </div>

        <div className="settings-section">
          <h2><Download size={16} style={{ marginRight: 8 }} />Data</h2>
          <button className="button button-secondary" onClick={handleExport} style={{ width: '100%', justifyContent: 'center' }}>
            <Download size={14} /> Export all data
          </button>
        </div>

        <div className="settings-section">
          <h2 style={{ color: 'var(--danger)' }}>Danger zone</h2>
          <button className="button button-danger" onClick={handleDeleteAccount} style={{ width: '100%', justifyContent: 'center' }}>
            <Trash2 size={14} /> Delete account
          </button>
        </div>
      </div>
    </div>
  )
}

const formatBytes = (bytes: number) => {
  if (!bytes) return '0 MB'
  const mb = bytes / (1024 * 1024)
  return mb >= 1024 ? `${(mb / 1024).toFixed(1)} GB` : `${Math.round(mb)} MB`
}

export default Settings
