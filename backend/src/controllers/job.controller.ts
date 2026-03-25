import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

const jobSchema = z.object({
  title: z.string().min(1),
  company: z.string().min(1),
  description: z.string().min(1),
  skills: z.array(z.string()).optional(),
  location: z.string().min(1),
  experienceLevel: z.string().min(1),
  salaryMin: z.number().optional(),
  salaryMax: z.number().optional(),
  isRemote: z.boolean().optional(),
  expiresAt: z.string().optional(),
});

export const listJobs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search as string;
    const isRemote = req.query.isRemote === 'true';
    const where: any = {};
    if (search) where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { company: { contains: search, mode: 'insensitive' } },
    ];
    if (req.query.isRemote) where.isRemote = isRemote;
    const [jobs, total] = await Promise.all([
      prisma.job.findMany({ where, skip, take: limit, orderBy: { postedAt: 'desc' } }),
      prisma.job.count({ where }),
    ]);
    res.json({ success: true, data: { jobs, total, page, totalPages: Math.ceil(total / limit) } });
  } catch (err) { next(err); }
};

export const getJob = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const job = await prisma.job.findUnique({
      where: { id: req.params.id },
      include: { _count: { select: { applications: true } } },
    });
    if (!job) return res.status(404).json({ success: false, error: 'Job not found' });
    res.json({ success: true, data: job });
  } catch (err) { next(err); }
};

export const createJob = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = jobSchema.parse(req.body);
    const job = await prisma.job.create({
      data: {
        title: data.title,
        company: data.company,
        description: data.description,
        location: data.location,
        experienceLevel: data.experienceLevel,
        skills: data.skills || [],
        salaryMin: data.salaryMin,
        salaryMax: data.salaryMax,
        isRemote: data.isRemote,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
      },
    });
    res.status(201).json({ success: true, data: job });
  } catch (err: any) {
    if (err.name === 'ZodError') return res.status(400).json({ success: false, error: err.errors });
    next(err);
  }
};

export const updateJob = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = jobSchema.partial().parse(req.body);
    const updateData: any = { ...data };
    if (data.expiresAt) updateData.expiresAt = new Date(data.expiresAt);
    const job = await prisma.job.update({ where: { id: req.params.id }, data: updateData });
    res.json({ success: true, data: job });
  } catch (err: any) {
    if (err.name === 'ZodError') return res.status(400).json({ success: false, error: err.errors });
    next(err);
  }
};

export const deleteJob = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await prisma.job.delete({ where: { id: req.params.id } });
    res.json({ success: true, data: { message: 'Job deleted' } });
  } catch (err) { next(err); }
};
