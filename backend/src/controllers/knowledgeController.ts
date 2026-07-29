import { Response } from 'express'
import { AuthRequest } from '../middleware/authMiddleware'
import KnowledgeNode from '../models/KnowledgeNode'
import KnowledgeRelation from '../models/KnowledgeRelation'

export const getKnowledgeGraph = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const nodes = await KnowledgeNode.find({ userId: req.user!.id }).lean()
    const relations = await KnowledgeRelation.find({ userId: req.user!.id }).lean()

    res.json({ success: true, nodes, relations })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch knowledge graph' })
  }
}

export const getNodeConnections = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const nodeId = req.params.id
    const node = await KnowledgeNode.findOne({ _id: nodeId, userId: req.user!.id }).lean()
    if (!node) {
      res.status(404).json({ success: false, message: 'Node not found' })
      return
    }

    const relations = await KnowledgeRelation.find({
      userId: req.user!.id,
      $or: [{ sourceNode: nodeId }, { targetNode: nodeId }],
    }).populate('sourceNode targetNode').lean()

    res.json({ success: true, node, relations })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch connections' })
  }
}
