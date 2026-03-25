import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

const updateProfileSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  avatar: z.string().optional(),
  phone: z.string().optional(),
  bio: z.string().optional(),
  skills: z.array(z.string()).optional(),
  education: z.array(z.any()).optional(),
  projects: z.array(z.any()).optional(),
  resumeUrl: z.string().optional(),
});

export const getProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.params.id || req.user!.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, email: true, firstName: true, lastName: true,
        role: true, isPro: true, avatar: true, createdAt: true,
        profile: true, progress: true,
        _count: { select: { certificates: true, activities: true, testResults: true } },
      },
    });
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
};

export const updateProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = updateProfileSchema.parse(req.body);
    const { firstName, lastName, avatar, ...profileData } = data;

    const profileCompletion = calculateCompletion({ ...profileData, firstName, lastName });

    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(avatar && { avatar }),
        profile: {
          upsert: {
            create: { ...profileData, profileCompletion },
            update: { ...profileData, profileCompletion },
          },
        },
      },
      select: {
        id: true, email: true, firstName: true, lastName: true,
        role: true, isPro: true, avatar: true, profile: true,
      },
    });
    res.json({ success: true, data: user });
  } catch (err: any) {
    if (err.name === 'ZodError') return res.status(400).json({ success: false, error: err.errors });
    next(err);
  }
};

function calculateCompletion(data: any): number {
  const fields = ['firstName', 'lastName', 'phone', 'bio', 'resumeUrl'];
  const arrayFields = ['skills', 'education', 'projects'];
  let filled = 0;
  const total = fields.length + arrayFields.length;
  fields.forEach(f => { if (data[f]) filled++; });
  arrayFields.forEach(f => { if (data[f] && data[f].length > 0) filled++; });
  return Math.round((filled / total) * 100);
}

export const listUsers = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip, take: limit,
        select: {
          id: true, email: true, firstName: true, lastName: true,
          role: true, isPro: true, avatar: true, createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count(),
    ]);
    res.json({ success: true, data: { users, total, page, totalPages: Math.ceil(total / limit) } });
  } catch (err) { next(err); }
};

export const deleteUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await prisma.user.delete({ where: { id: req.params.id } });
    res.json({ success: true, data: { message: 'User deleted' } });
  } catch (err) { next(err); }
};
