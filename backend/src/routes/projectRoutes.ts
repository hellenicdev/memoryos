import { Router } from 'express'
import { getProjects, getProjectById, createProject, updateProject, deleteProject, getProjectTasks, createTask, updateTask, deleteTask } from '../controllers/projectController'
import authMiddleware from '../middleware/authMiddleware'

const router = Router()

router.get('/', authMiddleware, getProjects)
router.get('/:id', authMiddleware, getProjectById)
router.post('/', authMiddleware, createProject)
router.put('/:id', authMiddleware, updateProject)
router.delete('/:id', authMiddleware, deleteProject)

router.get('/:id/tasks', authMiddleware, getProjectTasks)
router.post('/:id/tasks', authMiddleware, createTask)
router.put('/:id/tasks/:taskId', authMiddleware, updateTask)
router.delete('/:id/tasks/:taskId', authMiddleware, deleteTask)

export default router
