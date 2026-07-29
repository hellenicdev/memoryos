import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import SearchBar from '../components/SearchBar'
import UploadBox from '../components/UploadBox'
import MemoryCard from '../components/MemoryCard'
import Loading from '../components/Loading'
import Modal from '../components/common/Modal'
import EmptyState from '../components/common/EmptyState'
import { Upload } from 'lucide-react'
import api from '../services/api'

const Memories = () => {
  const [memories, setMemories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showUpload, setShowUpload] = useState(false)
  const [activeFilter, setActiveFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'document', label: 'Documents' },
    { key: 'image', label: 'Images' },
    { key: 'note', label: 'Notes' },
    { key: 'receipt', label: 'Receipts' },
    { key: 'favorites', label: 'Favorites' },
  ]

  const fetchMemories = async () => {
    setLoading(true)
    try {
      const params: any = { page, limit: 24 }
      if (activeFilter !== 'all') {
        if (activeFilter === 'favorites') params.favorites = true
        else params.type = activeFilter
      }
      const res = await api.get('/memories', { params })
      setMemories(res.data.memories || [])
      setTotalPages(res.data.totalPages || 1)
    } catch {}
    setLoading(false)
  }

  useEffect(() => {
    fetchMemories()
  }, [page, activeFilter])

  return (
    <div>
      <Navbar />
      <div className="dashboard" style={{ paddingBottom: 80 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Memories</h1>
          <button className="button button-primary" onClick={() => setShowUpload(true)}>
            <Upload size={16} /> Upload
          </button>
        </div>

        <SearchBar />

        <div className="filters" style={{ marginBottom: 20 }}>
          {filters.map((f) => (
            <button
              key={f.key}
              className={`filter-button ${activeFilter === f.key ? 'active' : ''}`}
              onClick={() => { setActiveFilter(f.key); setPage(1) }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <Loading count={6} />
        ) : memories.length === 0 ? (
          <EmptyState
            icon={<Upload size={40} />}
            title="No memories yet"
            description="Upload a document, image, or note to start building your memory system"
            action={
              <button className="button button-primary" onClick={() => setShowUpload(true)}>
                <Upload size={16} /> Upload your first memory
              </button>
            }
          />
        ) : (
          <>
            <div className="memory-grid">
              {memories.map((m: any) => (
                <MemoryCard key={m._id} memory={m} />
              ))}
            </div>

            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 24 }}>
                <button
                  className="button button-secondary"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </button>
                <span style={{ display: 'flex', alignItems: 'center', padding: '0 12px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Page {page} of {totalPages}
                </span>
                <button
                  className="button button-secondary"
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}

        <Modal isOpen={showUpload} onClose={() => setShowUpload(false)} title="Upload memory">
          <UploadBox onUploadComplete={() => { setShowUpload(false); fetchMemories() }} />
          <div style={{ marginTop: 16, textAlign: 'center' }}>
            <button className="button button-secondary" onClick={() => setShowUpload(false)}>
              Cancel
            </button>
          </div>
        </Modal>
      </div>
    </div>
  )
}

export default Memories
