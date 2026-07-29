import { Request, Response, NextFunction } from 'express'

export class AppError extends Error {
  statusCode: number
  constructor(message: string, statusCode: number = 400) {
    super(message)
    this.statusCode = statusCode
  }
}

const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ success: false, message: err.message })
    return
  }

  console.error('Unhandled error:', err)
  res.status(500).json({ success: false, message: 'Internal server error' })
}

export default errorHandler
