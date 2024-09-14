import ServerError from '@/lib/error.js';
import type { NextFunction, Request, Response } from 'express';

export function errorMiddleware(err: Error, req: Request, res: Response, next: NextFunction) {
  console.log(`[error ${req.method} ${req.url}]`, err);
  if (err instanceof ServerError) {
    res.status(err.code).json({ message: err.message });
    return;
  }
  res.status(500).json({message: err?.message})
}
