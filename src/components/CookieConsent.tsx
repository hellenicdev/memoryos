import { useState, useEffect } from 'react'

const CookieConsent = () => {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const accepted = localStorage.getItem('cookieConsent')
    if (!accepted) setVisible(true)
  }, [])

  const accept = () => {
    localStorage.setItem('cookieConsent', 'true')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 9999,
      background: 'var(--card-bg)', borderTop: '1px solid var(--border)',
      padding: '12px 24px', display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', gap: 16, flexWrap: 'wrap',
      fontSize: '0.85rem', boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
    }}>
      <span style={{ color: 'var(--text-secondary)' }}>
        This site uses cookies for authentication and essential functionality.
        By continuing, you accept our use of cookies.
      </span>
      <button className="button button-primary" onClick={accept} style={{ whiteSpace: 'nowrap' }}>
        Got it
      </button>
    </div>
  )
}

export default CookieConsent
