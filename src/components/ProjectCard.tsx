import { useNavigate } from 'react-router-dom'

interface ProjectCardProps {
  project: {
    _id: string
    name: string
    description?: string
    budget?: number
    currency?: string
    status: string
    memoryCount?: number
    taskCount?: number
    completedTasks?: number
    progress?: number
  }
}

const ProjectCard = ({ project }: ProjectCardProps) => {
  const navigate = useNavigate()

  return (
    <div className="project-card" onClick={() => navigate(`/projects/${project._id}`)}>
      <div className="project-card-header">
        <div className="project-card-name">{project.name}</div>
        <span className={`project-card-status ${project.status}`}>{project.status}</span>
      </div>

      {project.description && (
        <div className="project-card-description">{project.description}</div>
      )}

      <div className="project-card-stats">
        {project.memoryCount !== undefined && (
          <div className="project-card-stat">
            <strong>{project.memoryCount}</strong> memories
          </div>
        )}
        {project.taskCount !== undefined && (
          <div className="project-card-stat">
            <strong>{project.completedTasks}/{project.taskCount}</strong> tasks
          </div>
        )}
        {project.budget && (
          <div className="project-card-stat">
            <strong>{project.currency} {project.budget.toLocaleString()}</strong> budget
          </div>
        )}
      </div>

      {project.progress !== undefined && project.progress > 0 && (
        <div className="progress-bar">
          <div className="progress-bar-fill" style={{ width: `${project.progress}%` }} />
        </div>
      )}
    </div>
  )
}

export default ProjectCard
