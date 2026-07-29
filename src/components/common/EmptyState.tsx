import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
}

const EmptyState = ({ icon, title, description, action }: EmptyStateProps) => {
  return (
    <div style={{
      textAlign: 'center',
      padding: '48px 24px',
      color: 'var(--text-secondary)',
    }}>
      {icon && <div style={{ marginBottom: 16, opacity: 0.5 }}>{icon}</div>}
      <h3 style={{ fontSize: '1.1rem', marginBottom: 8, color: 'var(--text)' }}>{title}</h3>
      {description && <p style={{ fontSize: '0.9rem', marginBottom: 16 }}>{description}</p>}
      {action && <div>{action}</div>}
    </div>
  )
}

export default EmptyState
