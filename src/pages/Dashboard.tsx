import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Brain, Upload, FolderOpen, MessageCircle, TrendingUp, ArrowRight } from 'lucide-react'
import Navbar from '../components/Navbar'
import MemoryCard from '../components/MemoryCard'
import Loading from '../components/Loading'
import api from '../services/api'

const Dashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState({ memories: 0, projects: 0, storage: '0 MB', aiQueries: 0 })
  const [recentMemories, setRecentMemories] = useState<any[]>([])
  const [insights, setInsights] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [memoriesRes, projectsRes, usageRes, insightsRes] = await Promise.all([
          api.get('/memories?limit=6'),
          api.get('/projects'),
          api.get('/user/usage'),
          api.get('/ai/insights'),
        ])
        setRecentMemories(memoriesRes.data.memories)
        setStats({
          memories: usageRes.data.usage.memoryCount || memoriesRes.data.totalItems,
          projects: usageRes.data.usage.projectCount || projectsRes.data.projects?.length || 0,
          storage: formatBytes(usageRes.data.usage.storageUsed),
          aiQueries: usageRes.data.usage.aiQueriesUsed,
        })
        setInsights(insightsRes.data.insights || [])
      } catch {}
      setLoading(false)
    }
    fetchData()
  }, [])

  const formatBytes = (bytes: number) => {
    if (!bytes) return '0 MB'
    const mb = bytes / (1024 * 1024)
    return mb >= 1024 ? `${(mb / 1024).toFixed(1)} GB` : `${Math.round(mb)} MB`
  }

  if (loading) return <Loading fullScreen />

  return (
    <div>
      <Navbar />
      <div className="dashboard">
        <div className="dashboard-welcome">
          <h1>{getGreeting()}, {user?.name}</h1>
          <p>Your MemoryOS contains {stats.memories} memories, {stats.projects} projects</p>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-card-header">
              <span className="stat-card-label">Total Memories</span>
              <Brain size={18} />
            </div>
            <div className="stat-card-value">{stats.memories}</div>
          </div>

          <div className="stat-card">
            <div className="stat-card-header">
              <span className="stat-card-label">Projects</span>
              <FolderOpen size={18} />
            </div>
            <div className="stat-card-value">{stats.projects}</div>
          </div>

          <div className="stat-card">
            <div className="stat-card-header">
              <span className="stat-card-label">Storage Used</span>
              <Upload size={18} />
            </div>
            <div className="stat-card-value">{stats.storage}</div>
          </div>

          <div className="stat-card">
            <div className="stat-card-header">
              <span className="stat-card-label">AI Questions</span>
              <MessageCircle size={18} />
            </div>
            <div className="stat-card-value">{stats.aiQueries}</div>
          </div>
        </div>

        {insights.length > 0 && (
          <div className="dashboard-section">
            <div className="ai-preview">
              <TrendingUp size={20} color="var(--accent)" style={{ marginBottom: 8 }} />
              <h3>AI Insights</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {insights.map((insight, i) => (
                  <p key={i} style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>• {insight}</p>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="dashboard-section">
          <div className="dashboard-section-header">
            <h2>Recent Memories</h2>
            <button className="button-ghost" onClick={() => navigate('/memories')} style={{ fontSize: '0.85rem' }}>
              View all <ArrowRight size={14} />
            </button>
          </div>

          {recentMemories.length > 0 ? (
            <div className="memory-grid">
              {recentMemories.map((m: any) => (
                <MemoryCard key={m._id} memory={m} />
              ))}
            </div>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: 40 }}>
              <Upload size={32} style={{ color: 'var(--text-muted)', marginBottom: 12 }} />
              <h3 style={{ marginBottom: 8 }}>No memories yet</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 16 }}>
                Upload your first document to get started
              </p>
              <button className="button button-primary" onClick={() => navigate('/memories')}>
                Upload a memory <ArrowRight size={14} />
              </button>
            </div>
          )}
        </div>

        <div className="dashboard-section">
          <div className="ai-preview">
            <h3>Ask your MemoryOS anything</h3>
            <p>Get answers based on your stored information</p>
            <div className="suggested-questions">
              {[
                'What did I decide about my projects?',
                'Show my recent purchases',
                'Summarize my documents',
              ].map((q) => (
                <button
                  key={q}
                  className="suggested-question"
                  onClick={() => navigate('/ai')}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
