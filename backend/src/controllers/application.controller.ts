import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

const applySchema = z.object({
  jobId: z.string(),
  coverLetter: z.string().optional(),
});

export const applyToJob = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = applySchema.parse(req.body);
    const job = await prisma.job.findUnique({ where: { id: data.jobId } });
    if (!job) return res.status(404).json({ success: false, error: 'Job not found' });
    const application = await prisma.application.create({
      data: { userId: req.user!.id, jobId: data.jobId, coverLetter: data.coverLetter },
      include: { job: true },
    });
    await prisma.activity.create({
      data: { userId: req.user!.id, type: 'APPLIED_JOB', description: `Applied for: ${job.title} at ${job.company}` },
    });
    res.status(201).json({ success: true, data: application });
  } catch (err: any) {
    if (err.name === 'ZodError') return res.status(400).json({ success: false, error: err.errors });
    if (err.code === 'P2002') return res.status(409).json({ success: false, error: 'Already applied' });
    next(err);
  }
};

export const listApplications = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const where = req.user!.role === 'ADMIN' ? {} : { userId: req.user!.id };
    const applications = await prisma.application.findMany({
      where,
      include: {
        job: true,
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
      orderBy: { appliedAt: 'desc' },
    });
    res.json({ success: true, data: applications });
  } catch (err) { next(err); }
};

export const getApplication = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const application = await prisma.application.findUnique({
      where: { id: req.params.id },
      include: { job: true, user: { select: { id: true, firstName: true, lastName: true } } },
    });
    if (!application) return res.status(404).json({ success: false, error: 'Application not found' });
    res.json({ success: true, data: application });
  } catch (err) { next(err); }
};

export const updateApplicationStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body;
    if (!['PENDING', 'ACCEPTED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }
    const application = await prisma.application.update({
      where: { id: req.params.id },
      data: { status, respondedAt: new Date() },
    });
    res.json({ success: true, data: application });
  } catch (err) { next(err); }
};

export const withdrawApplication = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const application = await prisma.application.findUnique({ where: { id: req.params.id } });
    if (!application) return res.status(404).json({ success: false, error: 'Application not found' });
    if (application.userId !== req.user!.id) return res.status(403).json({ success: false, error: 'Not authorized' });
    await prisma.application.delete({ where: { id: req.params.id } });
    res.json({ success: true, data: { message: 'Application withdrawn' } });
  } catch (err) { next(err); }
};
