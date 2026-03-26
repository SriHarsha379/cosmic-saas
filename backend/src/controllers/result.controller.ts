import { Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

export const listResults = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const results = await prisma.result.findMany({
      where: { userId: req.user!.id },
      include: {
        test: { select: { id: true, title: true, difficulty: true } },
        user: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { completedAt: 'desc' },
    });
    res.json({ success: true, data: results });
  } catch (err) {
    next(err);
  }
};

export const getResult = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await prisma.result.findUnique({
      where: { id: req.params.id },
      include: {
        test: true,
        user: { select: { id: true, firstName: true, lastName: true } },
      },
    });
    if (!result) return res.status(404).json({ success: false, error: 'Result not found' });
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

export const getMyResults = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const results = await prisma.result.findMany({
      where: { userId: req.user!.id },
      include: { test: { select: { id: true, title: true, difficulty: true } } },
      orderBy: { completedAt: 'desc' },
    });
    res.json({ success: true, data: results });
  } catch (err) {
    next(err);
  }
};
