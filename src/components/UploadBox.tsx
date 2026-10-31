import { useState, useRef, useCallback } from 'react'
import { Upload } from 'lucide-react'
import api from '../services/api'

interface UploadBoxProps {
  onUploadComplete: () => void
}

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024

const UploadBox = ({ onUploadComplete }: UploadBoxProps) => {
  const [dragging, setDragging] = useState(false)
  const [status, setStatus] = useState<'idle' | 'uploading' | 'analyzing' | 'done' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('Unsupported file type or upload error')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback(async (file: File) => {
    const allowed = ['application/pdf', 'image/png', 'image/jpeg', 'text/plain']
    if (!allowed.includes(file.type)) {
      setErrorMessage('Unsupported file type or upload error')
      setStatus('error')
      return
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      setErrorMessage('File exceeds the 10 MB upload limit')
      setStatus('error')
      return
    }

    setStatus('uploading')

    const formData = new FormData()
    formData.append('file', file)

    try {
      setStatus('analyzing')
      await api.post('/memories/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setStatus('done')
      setTimeout(() => {
        setStatus('idle')
        onUploadComplete()
      }, 1500)
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } }).response?.data?.message
      setErrorMessage(message || 'Unsupported file type or upload error')
      setStatus('error')
    }
  }, [onUploadComplete])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(true)
  }

  const handleDragLeave = () => setDragging(false)

  return (
    <div>
      <div
        className={`upload-box ${dragging ? 'dragging' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => inputRef.current?.click()}
      >
        {status === 'idle' && (
          <>
            <Upload size={48} />
            <h3>Upload a memory</h3>
            <p>Drag and drop a file here, or click to browse. 10 MB maximum.</p>
            <div className="upload-formats">
              <span className="upload-format">PDF</span>
              <span className="upload-format">PNG</span>
              <span className="upload-format">JPG</span>
              <span className="upload-format">TXT</span>
            </div>
          </>
        )}
        {status === 'uploading' && (
          <>
            <Upload size={48} style={{ color: 'var(--accent)', animation: 'pulse 1s infinite' }} />
            <h3>Uploading...</h3>
          </>
        )}
        {status === 'analyzing' && (
          <>
            <BrainIcon size={48} style={{ color: 'var(--warning)' }} />
            <h3>Analyzing with AI...</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Extracting information</p>
          </>
        )}
        {status === 'done' && (
          <>
            <div style={{ fontSize: 48 }}>✓</div>
            <h3>Upload complete!</h3>
          </>
        )}
        {status === 'error' && (
          <>
            <div style={{ fontSize: 48 }}>✕</div>
            <h3>Upload failed</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--danger)' }}>{errorMessage}</p>
          </>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.png,.jpg,.jpeg,.txt"
        hidden
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />
    </div>
  )
}

const BrainIcon = ({ size, style }: { size: number; style?: React.CSSProperties }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
    <path d="M12 2a4 4 0 0 1 4 4c0 1.1-.4 2.1-1 2.8V10a3 3 0 0 1-3 3h-2a3 3 0 0 1-3-3v-1.2c-.6-.7-1-1.7-1-2.8a4 4 0 0 1 6-3.5z" />
    <path d="M12 12v10" />
    <path d="M8 16h8" />
  </svg>
)

export default UploadBox
