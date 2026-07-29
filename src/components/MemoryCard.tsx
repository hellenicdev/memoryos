import { useNavigate } from 'react-router-dom'
import { Heart, FileText, Image, File, Receipt } from 'lucide-react'

interface MemoryCardProps {
  memory: {
    _id: string
    title: string
    type: string
    aiSummary?: string
    tags?: string[]
    isFavorite?: boolean
    createdAt: string
    importanceScore?: number
  }
}

const typeConfig: Record<string, { icon: any; label: string }> = {
  document: { icon: FileText, label: 'DOC' },
  image: { icon: Image, label: 'IMG' },
  note: { icon: File, label: 'NOTE' },
  receipt: { icon: Receipt, label: 'REC' },
  invoice: { icon: Receipt, label: 'INV' },
}

const MemoryCard = ({ memory }: MemoryCardProps) => {
  const navigate = useNavigate()
  const config = typeConfig[memory.type] || { icon: FileText, label: memory.type.toUpperCase().slice(0, 4) }
  const Icon = config.icon

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  return (
    <div className="memory-card" onClick={() => navigate(`/memories/${memory._id}`)}>
      <div className="memory-card-header">
        <div className={`memory-card-icon ${memory.type}`}>
          <Icon size={16} />
        </div>
        {memory.isFavorite && <Heart size={14} fill="var(--danger)" color="var(--danger)" />}
      </div>

      <div className="memory-card-title">{memory.title}</div>
      <div className="memory-card-meta">{formatDate(memory.createdAt)}</div>

      {memory.aiSummary && (
        <div className="memory-card-summary">{memory.aiSummary}</div>
      )}

      {memory.tags && memory.tags.length > 0 && (
        <div className="memory-card-tags">
          {memory.tags.slice(0, 4).map((tag) => (
            <span key={tag} className="tag">#{tag}</span>
          ))}
        </div>
      )}
    </div>
  )
}

export default MemoryCard
