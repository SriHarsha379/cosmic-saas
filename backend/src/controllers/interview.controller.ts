import { Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';

const createInterviewSchema = z.object({
  type: z.string().default('MOCK'),
  duration: z.number().optional(),
});

export const listInterviews = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const where = req.user!.role === 'ADMIN' ? {} : { userId: req.user!.id };
    const interviews = await prisma.interview.findMany({
      where,
      include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: interviews });
  } catch (err) { next(err); }
};

export const getInterview = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const interview = await prisma.interview.findUnique({
      where: { id: req.params.id },
      include: { user: { select: { id: true, firstName: true, lastName: true } } },
    });
    if (!interview) return res.status(404).json({ success: false, error: 'Interview not found' });
    if (interview.userId !== req.user!.id && req.user!.role !== 'ADMIN') {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }
    res.json({ success: true, data: interview });
  } catch (err) { next(err); }
};

export const createInterview = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = createInterviewSchema.parse(req.body);
    const interview = await prisma.interview.create({
      data: { userId: req.user!.id, type: data.type, duration: data.duration },
    });
    await prisma.activity.create({
      data: { userId: req.user!.id, type: 'JOINED_INTERVIEW', description: 'Started an interview session' },
    });
    res.status(201).json({ success: true, data: interview });
  } catch (err: any) {
    if (err.name === 'ZodError') return res.status(400).json({ success: false, error: err.errors });
    next(err);
  }
};

export const updateInterview = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const schema = z.object({
      status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']).optional(),
      feedback: z.string().optional(),
      score: z.number().optional(),
      duration: z.number().optional(),
    });
    const data = schema.parse(req.body);
    const interview = await prisma.interview.findUnique({ where: { id: req.params.id } });
    if (!interview) return res.status(404).json({ success: false, error: 'Interview not found' });
    if (interview.userId !== req.user!.id && req.user!.role !== 'ADMIN') {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }
    const updated = await prisma.interview.update({ where: { id: req.params.id }, data });
    res.json({ success: true, data: updated });
  } catch (err: any) {
    if (err.name === 'ZodError') return res.status(400).json({ success: false, error: err.errors });
    next(err);
  }
};
