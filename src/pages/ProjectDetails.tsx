import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2, CheckCircle2, Circle } from 'lucide-react'
import Navbar from '../components/Navbar'
import MemoryCard from '../components/MemoryCard'
import Timeline from '../components/Timeline'
import Loading from '../components/Loading'
import api from '../services/api'

const ProjectDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [project, setProject] = useState<any>(null)
  const [memories, setMemories] = useState<any[]>([])
  const [tasks, setTasks] = useState<any[]>([])
  const [timelineEvents, setTimelineEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [newTask, setNewTask] = useState('')

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await api.get(`/projects/${id}`)
        setProject(res.data.project)
        setMemories(res.data.memories || [])
        setTasks(res.data.tasks || [])
        setTimelineEvents(res.data.timelineEvents || [])
      } catch {
        navigate('/projects')
      }
      setLoading(false)
    }
    fetchProject()
  }, [id])

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTask.trim()) return
    try {
      const res = await api.post(`/projects/${id}/tasks`, { title: newTask })
      setTasks((prev) => [...prev, res.data.task])
      setNewTask('')
    } catch {}
  }

  const handleToggleTask = async (taskId: string, completed: boolean) => {
    try {
      await api.put(`/projects/${id}/tasks/${taskId}`, { completed: !completed })
      setTasks((prev) => prev.map((t) => t._id === taskId ? { ...t, completed: !completed } : t))
    } catch {}
  }

  const handleDeleteTask = async (taskId: string) => {
    try {
      await api.delete(`/projects/${id}/tasks/${taskId}`)
      setTasks((prev) => prev.filter((t) => t._id !== taskId))
    } catch {}
  }

  if (loading) return <Loading fullScreen />
  if (!project) return null

  return (
    <div>
      <Navbar />
      <div className="dashboard" style={{ paddingBottom: 80 }}>
        <button className="button button-ghost" onClick={() => navigate('/projects')} style={{ marginBottom: 16 }}>
          <ArrowLeft size={16} /> Back to projects
        </button>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>{project.name}</h1>
            {project.description && (
              <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>{project.description}</p>
            )}
            <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
              {project.budget && (
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Budget: {project.currency} {project.budget.toLocaleString()}
                </span>
              )}
              <span className={`project-card-status ${project.status}`}>{project.status}</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>
          <div className="card">
            <h3 style={{ marginBottom: 16 }}>Tasks ({tasks.length})</h3>
            <form onSubmit={handleAddTask} style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <input
                className="input"
                placeholder="Add a task..."
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
              />
              <button className="button button-primary" type="submit"><Plus size={16} /></button>
            </form>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {tasks.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No tasks yet</p>
              ) : (
                tasks.map((task) => (
                  <div key={task._id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 8, background: 'var(--bg)' }}>
                    <button
                      className="button-ghost"
                      onClick={() => handleToggleTask(task._id, task.completed)}
                      style={{ padding: 0 }}
                    >
                      {task.completed ? <CheckCircle2 size={16} color="var(--success)" /> : <Circle size={16} />}
                    </button>
                    <span style={{ flex: 1, fontSize: '0.9rem', textDecoration: task.completed ? 'line-through' : 'none', color: task.completed ? 'var(--text-muted)' : 'var(--text)' }}>
                      {task.title}
                    </span>
                    <button className="button-ghost" onClick={() => handleDeleteTask(task._id)} style={{ padding: 2, color: 'var(--danger)' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="card">
            <h3 style={{ marginBottom: 16 }}>Timeline</h3>
            <Timeline events={timelineEvents} />
          </div>
        </div>

        {memories.length > 0 && (
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 16 }}>Connected Memories ({memories.length})</h2>
            <div className="memory-grid">
              {memories.map((m: any) => (
                <MemoryCard key={m._id} memory={m} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProjectDetails
