import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Trash2, Heart, Calendar, Tag, Brain } from 'lucide-react'
import Navbar from '../components/Navbar'
import Loading from '../components/Loading'
import Timeline from '../components/Timeline'
import api from '../services/api'

const MemoryDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [memory, setMemory] = useState<any>(null)
  const [relatedMemories, setRelatedMemories] = useState<any[]>([])
  const [timelineEvents, setTimelineEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMemory = async () => {
      try {
        const res = await api.get(`/memories/${id}`)
        setMemory(res.data.memory)
        setRelatedMemories(res.data.relatedMemories || [])
        setTimelineEvents(res.data.timelineEvents || [])
      } catch {
        navigate('/memories')
      }
      setLoading(false)
    }
    fetchMemory()
  }, [id])

  const handleDelete = async () => {
    if (!confirm('Delete this memory?')) return
    try {
      await api.delete(`/memories/${id}`)
      navigate('/memories')
    } catch {}
  }

  const handleToggleFavorite = async () => {
    try {
      const res = await api.put(`/memories/${id}/favorite`)
      setMemory((prev: any) => ({ ...prev, isFavorite: res.data.isFavorite }))
    } catch {}
  }

  if (loading) return <Loading fullScreen />
  if (!memory) return null

  return (
    <div>
      <Navbar />
      <div className="dashboard" style={{ paddingBottom: 80 }}>
        <button className="button button-ghost" onClick={() => navigate('/memories')} style={{ marginBottom: 16 }}>
          <ArrowLeft size={16} /> Back to memories
        </button>

        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 300px' }}>
            <div className="card" style={{ minHeight: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
              <div style={{ textAlign: 'center' }}>
                <Brain size={48} style={{ color: 'var(--text-muted)', marginBottom: 12 }} />
                <p style={{ color: 'var(--text-muted)' }}>File preview</p>
              </div>
            </div>
          </div>

          <div style={{ flex: '2 1 400px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <div className={`memory-card-icon ${memory.type}`} style={{ marginBottom: 8 }}>
                  {memory.type.toUpperCase().slice(0, 3)}
                </div>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>{memory.title}</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  <Calendar size={14} />
                  {new Date(memory.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                  <span className="tag" style={{ marginLeft: 8 }}>{memory.type}</span>
                  {memory.importanceScore && (
                    <span style={{ color: memory.importanceScore > 50 ? 'var(--warning)' : 'var(--text-muted)' }}>
                      Score: {memory.importanceScore}
                    </span>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button className="button-ghost" onClick={handleToggleFavorite} style={{ padding: 8 }}>
                  <Heart size={18} fill={memory.isFavorite ? 'var(--danger)' : 'none'} color={memory.isFavorite ? 'var(--danger)' : 'var(--text-muted)'} />
                </button>
                <button className="button-ghost" onClick={handleDelete} style={{ padding: 8, color: 'var(--danger)' }}>
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            {memory.aiSummary && (
              <div className="card" style={{ marginBottom: 16 }}>
                <h3 style={{ fontSize: '0.9rem', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Brain size={16} color="var(--accent)" /> AI Summary
                </h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>{memory.aiSummary}</p>
              </div>
            )}

            {memory.tags && memory.tags.length > 0 && (
              <div className="card" style={{ marginBottom: 16 }}>
                <h3 style={{ fontSize: '0.9rem', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Tag size={16} /> Tags
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {memory.tags.map((tag: string) => (
                    <span key={tag} className="tag">#{tag}</span>
                  ))}
                </div>
              </div>
            )}

            {memory.entities && Object.keys(memory.entities).length > 0 && (
              <div className="card" style={{ marginBottom: 16 }}>
                <h3 style={{ fontSize: '0.9rem', marginBottom: 8 }}>Extracted Information</h3>
                {memory.entities.people?.length > 0 && (
                  <div style={{ marginBottom: 8 }}><strong style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>People:</strong> {memory.entities.people.join(', ')}</div>
                )}
                {memory.entities.companies?.length > 0 && (
                  <div style={{ marginBottom: 8 }}><strong style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Companies:</strong> {memory.entities.companies.join(', ')}</div>
                )}
                {memory.entities.products?.length > 0 && (
                  <div style={{ marginBottom: 8 }}><strong style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Products:</strong> {memory.entities.products.join(', ')}</div>
                )}
                {memory.entities.amounts?.length > 0 && (
                  <div style={{ marginBottom: 8 }}><strong style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Amounts:</strong> {memory.entities.amounts.join(', ')}</div>
                )}
              </div>
            )}

            {relatedMemories.length > 0 && (
              <div className="card" style={{ marginBottom: 16 }}>
                <h3 style={{ fontSize: '0.9rem', marginBottom: 12 }}>Related Memories</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {relatedMemories.map((rm: any) => (
                    <div
                      key={rm._id}
                      style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 8, cursor: 'pointer' }}
                      onClick={() => navigate(`/memories/${rm._id}`)}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-card)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <Brain size={14} style={{ color: 'var(--text-muted)' }} />
                      <div>
                        <div style={{ fontSize: '0.85rem' }}>{rm.title}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{rm.type}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {timelineEvents.length > 0 && (
              <div className="card">
                <h3 style={{ fontSize: '0.9rem', marginBottom: 12 }}>Timeline</h3>
                <Timeline events={timelineEvents} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MemoryDetails
