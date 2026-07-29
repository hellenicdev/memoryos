interface LoadingProps {
  fullScreen?: boolean
  count?: number
}

const Loading = ({ fullScreen, count }: LoadingProps) => {
  if (fullScreen) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'var(--bg)',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div className="skeleton" style={{ width: 40, height: 40, borderRadius: '50%', margin: '0 auto 16px' }} />
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading MemoryOS...</p>
        </div>
      </div>
    )
  }

  if (count) {
    return (
      <div className="memory-grid">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="card">
            <div className="skeleton" style={{ height: 16, width: '60%', marginBottom: 12 }} />
            <div className="skeleton" style={{ height: 12, width: '40%', marginBottom: 8 }} />
            <div className="skeleton" style={{ height: 12, width: '80%', marginBottom: 8 }} />
            <div className="skeleton" style={{ height: 12, width: '50%' }} />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
      <div className="skeleton" style={{ width: 32, height: 32, borderRadius: '50%' }} />
    </div>
  )
}

export default Loading
