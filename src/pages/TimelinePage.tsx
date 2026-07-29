import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import Loading from '../components/Loading'
import EmptyState from '../components/common/EmptyState'
import { Clock } from 'lucide-react'
import api from '../services/api'

const TimelinePage = () => {
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [year, setYear] = useState(new Date().getFullYear().toString())

  useEffect(() => {
    const fetchTimeline = async () => {
      try {
        const res = await api.get('/timeline', { params: { year } })
        setEvents(res.data.events || [])
      } catch {}
      setLoading(false)
    }
    fetchTimeline()
  }, [year])

  const groupedByMonth = events.reduce((acc: any, event: any) => {
    const month = new Date(event.date).getMonth()
    if (!acc[month]) acc[month] = []
    acc[month].push(event)
    return acc
  }, {} as Record<number, any[]>)

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

  return (
    <div>
      <Navbar />
      <div className="dashboard" style={{ paddingBottom: 80 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Timeline</h1>
          <select
            className="input"
            style={{ width: 'auto', padding: '8px 12px' }}
            value={year}
            onChange={(e) => setYear(e.target.value)}
          >
            {[2026, 2025, 2024].map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <Loading count={5} />
        ) : events.length === 0 ? (
          <EmptyState
            icon={<Clock size={40} />}
            title="No timeline events"
            description="Events will appear here when you upload memories with important dates"
          />
        ) : (
          <div>
            {Object.entries(groupedByMonth).sort(([a], [b]) => Number(b) - Number(a)).map(([monthStr, monthEvents]: [string, any]) => {
              const monthNum = parseInt(monthStr)
              return (
                <div key={monthStr} style={{ marginBottom: 32 }}>
                  <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 16, color: 'var(--accent)' }}>
                    {months[monthNum]} {year}
                  </h2>
                  <div className="timeline">
                    {monthEvents.map((event: any) => (
                      <div key={event._id} className="timeline-item">
                        <div className="timeline-item-date">
                          {new Date(event.date).toLocaleDateString('en-GB', {
                            day: 'numeric', month: 'long', year: 'numeric',
                          })}
                        </div>
                        <div className="timeline-item-title">{event.title}</div>
                        {event.description && (
                          <div className="timeline-item-description">{event.description}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default TimelinePage
