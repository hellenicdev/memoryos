interface TimelineEvent {
  _id: string
  title: string
  description?: string
  date: string
  memoryId?: { _id: string; title: string; type: string }
  projectId?: { _id: string; name: string }
}

interface TimelineProps {
  events: TimelineEvent[]
}

const Timeline = ({ events }: TimelineProps) => {
  if (events.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
        <p>No timeline events yet</p>
      </div>
    )
  }

  return (
    <div className="timeline">
      {events.map((event) => (
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
  )
}

export default Timeline
