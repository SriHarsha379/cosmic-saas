import { Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';

const updateProfileSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  avatar: z.string().optional(),
  phone: z.string().optional(),
  bio: z.string().optional(),
  skills: z.string().optional(),
  experience: z.string().optional(),
  education: z.string().optional(),
});

// Public fields visible to anyone
const publicSelect = {
  id: true, firstName: true, lastName: true,
  avatar: true, bio: true, skills: true, createdAt: true,
  _count: { select: { certificates: true } },
};

// Private fields only visible to self or admin
const privateSelect = {
  id: true, email: true, firstName: true, lastName: true,
  role: true, avatar: true, bio: true, phone: true, location: true,
  skills: true, experience: true, education: true, createdAt: true,
  _count: { select: { certificates: true, activities: true } },
};

export const getProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const targetId = req.params.id || req.user!.id;
    const isSelf = targetId === req.user!.id;
    const isAdmin = req.user!.role === 'ADMIN';

    const user = await prisma.user.findUnique({
      where: { id: targetId },
      select: (isSelf || isAdmin) ? privateSelect : publicSelect,
    });
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
};

export const updateProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = updateProfileSchema.parse(req.body);
    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data,
      select: {
        id: true, email: true, firstName: true, lastName: true,
        avatar: true, bio: true, phone: true, location: true,
        skills: true, experience: true, education: true,
      },
    });
    res.json({ success: true, data: user });
  } catch (err: any) {
    if (err.name === 'ZodError') return res.status(400).json({ success: false, error: err.errors });
    next(err);
  }
};

export const listUsers = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip, take: limit,
        select: { id: true, email: true, firstName: true, lastName: true, role: true, avatar: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count(),
    ]);
    res.json({ success: true, data: { users, total, page, totalPages: Math.ceil(total / limit) } });
  } catch (err) { next(err); }
};

export const deleteUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (req.params.id === req.user!.id) {
      return res.status(400).json({ success: false, error: 'Cannot delete your own account' });
    }
    await prisma.user.delete({ where: { id: req.params.id } });
    res.json({ success: true, data: { message: 'User deleted' } });
  } catch (err) { next(err); }
};
