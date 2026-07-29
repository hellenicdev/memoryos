import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'
import { ArrowLeft, Check, ExternalLink } from 'lucide-react'
import api from '../services/api'

const plans = [
  {
    name: 'Free',
    price: '£0',
    period: 'forever',
    badge: 'badge-free',
    features: [
      '500 MB storage',
      '50 AI queries/month',
      '5 projects',
    ],
  },
  {
    name: 'Premium',
    price: 'TBD',
    period: '/month',
    badge: 'badge-premium',
    popular: true,
    features: [
      '50 GB storage',
      '1,000 AI queries/month',
      'Unlimited projects',
      'Advanced AI insights',
      'Priority support',
    ],
  },
  {
    name: 'Team',
    price: 'TBD',
    period: '/month',
    badge: 'badge-team',
    features: [
      '100 GB storage',
      '5,000 AI queries/month',
      'Unlimited projects',
      'Team workspace',
      'Shared memories',
      'Admin controls',
    ],
  },
]

const Billing = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [usage, setUsage] = useState<any>(null)

  useEffect(() => {
    api.get('/user/usage').then((res) => setUsage(res.data.usage)).catch(() => {})
  }, [])

  return (
    <div>
      <Navbar />
      <div className="dashboard" style={{ paddingBottom: 80 }}>
        <button className="button button-ghost" onClick={() => navigate('/settings')} style={{ marginBottom: 24 }}>
          <ArrowLeft size={16} /> Back to settings
        </button>

        <h1 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: 8 }}>Subscription & billing</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 32 }}>
          You are currently on the <strong>{user?.plan}</strong> plan
        </p>

        {usage && (
          <div className="card" style={{ marginBottom: 32 }}>
            <h3 style={{ marginBottom: 16 }}>Current usage</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16 }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 4 }}>Storage</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>{formatBytes(usage.storageUsed)}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>of {formatBytes(usage.storageLimit)}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 4 }}>AI queries</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>{usage.aiQueriesUsed}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>of {usage.aiQueryLimit} this month</div>
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 4 }}>Memories</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>{usage.memoryCount}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 4 }}>Projects</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>{usage.projectCount}</div>
              </div>
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
          {plans.map((plan) => (
            <div
              key={plan.name}
              className="card"
              style={{
                padding: 32,
                position: 'relative',
                borderColor: plan.popular ? 'var(--secondary)' : 'var(--border)',
              }}
            >
              {plan.popular && (
                <div style={{
                  position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
                  background: 'var(--secondary)', color: 'white', padding: '4px 16px',
                  borderRadius: 20, fontSize: '0.75rem', fontWeight: 600,
                }}>
                  Most popular
                </div>
              )}

              <div style={{ marginBottom: 24 }}>
                <span className={`badge ${plan.badge}`} style={{ marginBottom: 8 }}>{plan.name}</span>
                <div style={{ fontSize: '2rem', fontWeight: 700, marginTop: 8 }}>
                  {plan.price}
                  <span style={{ fontSize: '0.9rem', fontWeight: 400, color: 'var(--text-muted)' }}> {plan.period}</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                {plan.features.map((feat) => (
                  <div key={feat} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.9rem' }}>
                    <Check size={14} color="var(--success)" />
                    {feat}
                  </div>
                ))}
              </div>

              {plan.name === 'Free' && user?.plan === 'free' && (
                <button className="button button-secondary" style={{ width: '100%', justifyContent: 'center' }} disabled>
                  Current plan
                </button>
              )}

              {plan.name !== 'Free' && (
                <button
                  className="button button-primary"
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={() => alert('Ko-fi subscription integration coming soon. You\'ll be redirected to Ko-fi to complete payment.')}
                >
                  <ExternalLink size={14} /> Subscribe via Ko-fi
                </button>
              )}
            </div>
          ))}
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

export default Billing
