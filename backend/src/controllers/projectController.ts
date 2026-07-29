import { Response } from 'express'
import Project from '../models/Project'
import Task from '../models/Task'
import Memory from '../models/Memory'
import TimelineEvent from '../models/TimelineEvent'
import { AuthRequest } from '../middleware/authMiddleware'
import { getPlanLimits } from '../services/planService'
import User from '../models/User'

export const getProjects = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status } = req.query
    const filter: any = { userId: req.user!.id }
    if (status) filter.status = status

    const projects = await Project.find(filter).sort({ updatedAt: -1 }).lean()

    const projectsWithCounts = await Promise.all(
      projects.map(async (project: any) => {
        const memoryCount = await Memory.countDocuments({ userId: req.user!.id, projectId: project._id })
        const taskCount = await Task.countDocuments({ projectId: project._id })
        const completedTasks = await Task.countDocuments({ projectId: project._id, completed: true })
        return {
          ...project,
          memoryCount,
          taskCount,
          completedTasks,
          progress: taskCount > 0 ? Math.round((completedTasks / taskCount) * 100) : 0,
        }
      })
    )

    res.json({ success: true, projects: projectsWithCounts })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch projects' })
  }
}

export const getProjectById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const project = await Project.findOne({ _id: req.params.id, userId: req.user!.id }).lean()
    if (!project) {
      res.status(404).json({ success: false, message: 'Project not found' })
      return
    }

    const [memories, tasks, timelineEvents] = await Promise.all([
      Memory.find({ userId: req.user!.id, projectId: project._id }).sort({ createdAt: -1 }).lean(),
      Task.find({ projectId: project._id }).sort({ createdAt: -1 }).lean(),
      TimelineEvent.find({ userId: req.user!.id, projectId: project._id }).sort({ date: -1 }).lean(),
    ])

    res.json({ success: true, project, memories, tasks, timelineEvents })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch project' })
  }
}

export const createProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, description, budget, currency } = req.body

    if (!name) {
      res.status(400).json({ success: false, message: 'Project name is required' })
      return
    }

    const user = await User.findById(req.user!.id)
    const limits = getPlanLimits(user!.plan)
    const projectCount = await Project.countDocuments({ userId: req.user!.id, status: 'active' })

    if (projectCount >= limits.projectLimit) {
      res.status(403).json({ success: false, message: 'Project limit reached. Please upgrade your plan.' })
      return
    }

    const project = await Project.create({
      userId: req.user!.id,
      name,
      description,
      budget,
      currency: currency || 'GBP',
    })

    res.status(201).json({ success: true, project })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create project' })
  }
}

export const updateProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, description, budget, currency, status } = req.body
    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, userId: req.user!.id },
      { name, description, budget, currency, status },
      { new: true, runValidators: true }
    )

    if (!project) {
      res.status(404).json({ success: false, message: 'Project not found' })
      return
    }

    res.json({ success: true, project })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update project' })
  }
}

export const deleteProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const project = await Project.findOne({ _id: req.params.id, userId: req.user!.id })
    if (!project) {
      res.status(404).json({ success: false, message: 'Project not found' })
      return
    }

    await Memory.updateMany({ projectId: project._id }, { $unset: { projectId: '' } })
    await Task.deleteMany({ projectId: project._id })
    await TimelineEvent.deleteMany({ projectId: project._id })
    await Project.findByIdAndDelete(project._id)

    res.json({ success: true, message: 'Project deleted' })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete project' })
  }
}

export const getProjectTasks = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const tasks = await Task.find({ projectId: req.params.id, userId: req.user!.id }).sort({ createdAt: -1 })
    res.json({ success: true, tasks })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch tasks' })
  }
}

export const createTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, priority, deadline } = req.body
    const project = await Project.findOne({ _id: req.params.id, userId: req.user!.id })
    if (!project) {
      res.status(404).json({ success: false, message: 'Project not found' })
      return
    }

    const task = await Task.create({
      userId: req.user!.id,
      projectId: req.params.id as string,
      title,
      description,
      priority,
      deadline,
    })

    res.status(201).json({ success: true, task })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create task' })
  }
}

export const updateTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, completed, priority, deadline } = req.body
    const task = await Task.findOneAndUpdate(
      { _id: req.params.taskId, userId: req.user!.id },
      { title, description, completed, priority, deadline },
      { new: true }
    )

    if (!task) {
      res.status(404).json({ success: false, message: 'Task not found' })
      return
    }

    res.json({ success: true, task })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update task' })
  }
}

export const deleteTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.taskId, userId: req.user!.id })
    if (!task) {
      res.status(404).json({ success: false, message: 'Task not found' })
      return
    }

    res.json({ success: true, message: 'Task deleted' })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete task' })
  }
}
