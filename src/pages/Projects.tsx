import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import ProjectCard from '../components/ProjectCard'
import Modal from '../components/common/Modal'
import EmptyState from '../components/common/EmptyState'
import Loading from '../components/Loading'
import { Plus, FolderOpen } from 'lucide-react'
import api from '../services/api'

const Projects = () => {
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [budget, setBudget] = useState('')

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects')
      setProjects(res.data.projects || [])
    } catch {}
    setLoading(false)
  }

  useEffect(() => { fetchProjects() }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.post('/projects', { name, description, budget: budget ? parseFloat(budget) : undefined })
      setShowCreate(false)
      setName('')
      setDescription('')
      setBudget('')
      fetchProjects()
    } catch {}
  }

  return (
    <div>
      <Navbar />
      <div className="dashboard" style={{ paddingBottom: 80 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Projects</h1>
          <button className="button button-primary" onClick={() => setShowCreate(true)}>
            <Plus size={16} /> New Project
          </button>
        </div>

        {loading ? (
          <Loading count={3} />
        ) : projects.length === 0 ? (
          <EmptyState
            icon={<FolderOpen size={40} />}
            title="No projects yet"
            description="Create a project to organize your memories around a goal"
            action={
              <button className="button button-primary" onClick={() => setShowCreate(true)}>
                <Plus size={16} /> Create your first project
              </button>
            }
          />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
            {projects.map((p: any) => (
              <ProjectCard key={p._id} project={p} />
            ))}
          </div>
        )}

        <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create project">
          <form onSubmit={handleCreate} className="auth-form">
            <div>
              <label>Project name</label>
              <input
                className="input"
                placeholder="e.g. House Renovation"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <label>Description (optional)</label>
              <textarea
                className="input"
                placeholder="What is this project about?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                style={{ resize: 'vertical' }}
              />
            </div>
            <div>
              <label>Budget (optional)</label>
              <input
                className="input"
                type="number"
                placeholder="e.g. 50000"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
              />
            </div>
            <button className="button button-primary" type="submit" style={{ width: '100%', justifyContent: 'center' }}>
              Create project
            </button>
          </form>
        </Modal>
      </div>
    </div>
  )
}

export default Projects
