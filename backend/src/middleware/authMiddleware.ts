import { Request, Response, NextFunction } from 'express'
import jwt, { JwtPayload } from 'jsonwebtoken'

export interface AuthRequest extends Request {
  user?: { id: string; email: string }
}

const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ success: false, message: 'No token provided' })
      return
    }

    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload & { userId: string; email: string }

    req.user = { id: decoded.userId, email: decoded.email }
    next()
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid or expired token' })
  }
}

export default authMiddleware
