import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

const createInterviewSchema = z.object({
  proctorLevel: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
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
    res.json({ success: true, data: interview });
  } catch (err) { next(err); }
};

export const createInterview = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = createInterviewSchema.parse(req.body);
    const interview = await prisma.interview.create({
      data: { userId: req.user!.id, ...data },
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
      status: z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED']).optional(),
      startTime: z.string().optional(),
      endTime: z.string().optional(),
      recordingUrl: z.string().optional(),
    });
    const data = schema.parse(req.body);
    const updateData: any = { ...data };
    if (data.startTime) updateData.startTime = new Date(data.startTime);
    if (data.endTime) updateData.endTime = new Date(data.endTime);
    const interview = await prisma.interview.update({ where: { id: req.params.id }, data: updateData });
    res.json({ success: true, data: interview });
  } catch (err: any) {
    if (err.name === 'ZodError') return res.status(400).json({ success: false, error: err.errors });
    next(err);
  }
};

export const getInterviewByLink = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const interview = await prisma.interview.findUnique({
      where: { link: req.params.link },
      include: { user: { select: { id: true, firstName: true, lastName: true } } },
    });
    if (!interview) return res.status(404).json({ success: false, error: 'Interview not found' });
    res.json({ success: true, data: interview });
  } catch (err) { next(err); }
};
