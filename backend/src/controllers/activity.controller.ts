import { Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

export const listActivities = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.params.userId || req.user!.id;
    const limit = parseInt(req.query.limit as string) || 20;
    const page = parseInt(req.query.page as string) || 1;
    const skip = (page - 1) * limit;
    const type = req.query.type as string;
    const where: any = { userId };
    if (type) where.type = type;
    const [activities, total] = await Promise.all([
      prisma.activity.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip, take: limit,
      }),
      prisma.activity.count({ where }),
    ]);
    res.json({ success: true, data: { activities, total, page, totalPages: Math.ceil(total / limit) } });
  } catch (err) { next(err); }
};

export const getActivity = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const activity = await prisma.activity.findUnique({ where: { id: req.params.id } });
    if (!activity) return res.status(404).json({ success: false, error: 'Activity not found' });
    res.json({ success: true, data: activity });
  } catch (err) { next(err); }
};