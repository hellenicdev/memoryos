import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Trash2, Heart, Calendar, Tag, Brain, FileText, Download, ImageIcon } from 'lucide-react'
import Navbar from '../components/Navbar'
import Loading from '../components/Loading'
import Timeline from '../components/Timeline'
import api from '../services/api'

const filenameFromDisposition = (header?: string): string | undefined => {
  if (!header) return undefined
  const star = /filename\*=UTF-8''([^;]+)/i.exec(header)
  if (star) {
    try {
      return decodeURIComponent(star[1].trim())
    } catch {
      return undefined
    }
  }
  const plain = /filename="([^"]+)"/.exec(header)
  return plain?.[1]
}

const MemoryDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [memory, setMemory] = useState<any>(null)
  const [relatedMemories, setRelatedMemories] = useState<any[]>([])
  const [timelineEvents, setTimelineEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [imgError, setImgError] = useState(false)
  const [fileUrl, setFileUrl] = useState<string | null>(null)
  const [fileLoading, setFileLoading] = useState(false)
  const [downloadName, setDownloadName] = useState('download')

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

  const fileId = memory?.file?._id as string | undefined
  const fileMime = memory?.file?.mimeType as string | undefined
  const fileOriginalName = memory?.file?.originalName as string | undefined

  useEffect(() => {
    if (!fileId) {
      setFileUrl(null)
      setFileLoading(false)
      return
    }

    let objectUrl: string | null = null
    let cancelled = false
    setFileLoading(true)
    setImgError(false)

    const loadFile = async () => {
      try {
        const res = await api.get(`/files/${fileId}`, { responseType: 'blob' })
        const typeHeader = String(res.headers['content-type'] || fileMime || 'application/octet-stream')
        const blob = new Blob([res.data], { type: typeHeader.split(';')[0] })
        objectUrl = URL.createObjectURL(blob)
        if (cancelled) {
          URL.revokeObjectURL(objectUrl)
          return
        }
        setFileUrl(objectUrl)
        setDownloadName(filenameFromDisposition(res.headers['content-disposition']) || fileOriginalName || 'download')
      } catch {
        if (!cancelled) setImgError(true)
      } finally {
        if (!cancelled) setFileLoading(false)
      }
    }

    loadFile()
    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
      setFileUrl(null)
    }
  }, [fileId, fileMime, fileOriginalName])

  const handleDownload = () => {
    if (!fileUrl) return
    const link = document.createElement('a')
    link.href = fileUrl
    link.download = downloadName
    document.body.appendChild(link)
    link.click()
    link.remove()
  }

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
            {memory.file ? (
              <div className="card" style={{ padding: 0, overflow: 'hidden', minHeight: 300 }}>
                {fileLoading ? (
                  <Loading />
                ) : memory.file.mimeType?.startsWith('image/') && fileUrl && !imgError ? (
                  <div style={{ position: 'relative', minHeight: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#000' }}>
                    <img
                      src={fileUrl}
                      alt={memory.title}
                      style={{ width: '100%', height: 'auto', display: 'block', maxHeight: 400, objectFit: 'contain' }}
                      onError={() => setImgError(true)}
                    />
                    <div style={{ padding: 16 }}>
                      <button type="button" className="button button-secondary" onClick={handleDownload}>
                        <Download size={14} /> Download file
                      </button>
                    </div>
                  </div>
                ) : memory.file.mimeType === 'application/pdf' && fileUrl ? (
                  <div>
                    <embed
                      src={fileUrl}
                      type="application/pdf"
                      style={{ width: '100%', minHeight: 500, display: 'block' }}
                    />
                    <div style={{ padding: 16 }}>
                      <button type="button" className="button button-secondary" onClick={handleDownload}>
                        <Download size={14} /> Download file
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 200, padding: 40 }}>
                    {memory.file.mimeType?.startsWith('image/') ? <ImageIcon size={48} style={{ color: 'var(--text-muted)', marginBottom: 12 }} /> : <FileText size={48} style={{ color: 'var(--text-muted)', marginBottom: 12 }} />}
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 4 }}>{memory.file.originalName}</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: 16 }}>{(memory.file.size / 1024).toFixed(1)} KB</p>
                    {fileUrl ? (
                      <button type="button" className="button button-secondary" onClick={handleDownload}>
                        <Download size={14} /> Download file
                      </button>
                    ) : (
                      <p style={{ color: 'var(--danger)', fontSize: '0.85rem' }}>File preview unavailable</p>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="card" style={{ minHeight: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
                <div style={{ textAlign: 'center' }}>
                  <Brain size={48} style={{ color: 'var(--text-muted)', marginBottom: 12 }} />
                  <p style={{ color: 'var(--text-muted)' }}>No file attached</p>
                </div>
              </div>
            )}
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
