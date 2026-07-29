import { useNavigate } from 'react-router-dom'
import { Brain, Upload, Search, Share2, ArrowRight } from 'lucide-react'

const Landing = () => {
  const navigate = useNavigate()

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <nav style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '16px 24px', maxWidth: 1200, margin: '0 auto',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Brain size={28} color="var(--accent)" />
          <h1 style={{ fontSize: '1.2rem', fontWeight: 700, background: 'linear-gradient(135deg, var(--text), var(--accent))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            MemoryOS
          </h1>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="button button-ghost" onClick={() => navigate('/login')}>Log in</button>
          <button className="button button-primary" onClick={() => navigate('/register')}>Get started</button>
        </div>
      </nav>

      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 700, lineHeight: 1.15, marginBottom: 16 }}>
          Your personal AI<br />
          <span style={{ background: 'linear-gradient(135deg, var(--secondary), var(--accent))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            memory system
          </span>
        </h1>
        <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', maxWidth: 600, margin: '0 auto 32px' }}>
          Store, organize, and search your knowledge with AI. Upload documents, ask questions, and discover connections.
        </p>
        <button className="button button-primary" style={{ padding: '14px 32px', fontSize: '1rem' }} onClick={() => navigate('/register')}>
          Start building your memory <ArrowRight size={18} />
        </button>
      </section>

      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '60px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 24 }}>
          {[
            { icon: Upload, title: 'Store anything', desc: 'Upload PDFs, images, and notes. MemoryOS extracts and organizes everything.' },
            { icon: Search, title: 'AI search', desc: 'Ask questions about your data. Find any memory instantly.' },
            { icon: Brain, title: 'Smart insights', desc: 'AI finds connections between your memories automatically.' },
            { icon: Share2, title: 'Organize projects', desc: 'Group memories into projects. Track budgets, tasks, and timelines.' },
          ].map((feat, i) => {
            const Icon = feat.icon
            return (
              <div key={i} className="card" style={{ padding: 32, textAlign: 'center' }}>
                <div style={{ marginBottom: 16 }}>
                  <Icon size={32} color="var(--accent)" />
                </div>
                <h3 style={{ marginBottom: 8, fontSize: '1.05rem' }}>{feat.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.6 }}>{feat.desc}</p>
              </div>
            )
          })}
        </div>
      </section>

      <footer style={{ textAlign: 'center', padding: '40px 24px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
        MemoryOS — Your AI-powered personal knowledge system
      </footer>
    </div>
  )
}

export default Landing
