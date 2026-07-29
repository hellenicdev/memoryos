import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search as SearchIcon, ArrowRight, Brain } from 'lucide-react'
import api from '../services/api'

interface SearchResult {
  id: string
  title: string
  summary: string
  type: string
  relevance: number
}

const SearchBar = () => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [showResults, setShowResults] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setShowResults(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleSearch = async (value: string) => {
    setQuery(value)
    if (value.length < 2) {
      setResults([])
      setShowResults(false)
      return
    }

    setLoading(true)
    try {
      const res = await api.post('/ai/search', { query: value })
      setResults(res.data.results)
      setShowResults(true)
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div ref={ref} className="search-bar" style={{ marginBottom: 24 }}>
      <SearchIcon size={18} />
      <input
        type="text"
        placeholder="Search memories... or ask AI a question"
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        onFocus={() => results.length > 0 && setShowResults(true)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && results.length > 0) {
            navigate(`/memories/${results[0].id}`)
            setShowResults(false)
          }
        }}
      />

      {showResults && (
        <div
          className="card"
          style={{
            position: 'absolute', top: '100%', left: 0, right: 0,
            marginTop: 8, zIndex: 50, maxHeight: 360, overflow: 'auto', padding: 8,
          }}
        >
          {loading && (
            <div style={{ padding: 12, textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Searching...
            </div>
          )}

          {!loading && results.length === 0 && (
            <div style={{ padding: 12, textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              No results found
            </div>
          )}

          {results.map((r) => (
            <div
              key={r.id}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 12px', borderRadius: 8, cursor: 'pointer',
                transition: 'background 0.15s',
              }}
              onClick={() => { navigate(`/memories/${r.id}`); setShowResults(false) }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-card)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <Brain size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>{r.title}</div>
                {r.summary && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {r.summary}
                  </div>
                )}
              </div>
              <ArrowRight size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default SearchBar
