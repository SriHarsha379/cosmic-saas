import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

export const getLeaderboard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const hackathonId = req.query.hackathonId as string;
    const challengeId = req.query.challengeId as string;
    const limit = parseInt(req.query.limit as string) || 50;
    const where: any = {};
    if (hackathonId) where.hackathonId = hackathonId;
    if (challengeId) where.challengeId = challengeId;
    const entries = await prisma.leaderboard.findMany({
      where,
      include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true } } },
      orderBy: { score: 'desc' },
      take: limit,
    });
    const ranked = entries.map((e, i) => ({ ...e, rank: i + 1 }));
    res.json({ success: true, data: ranked });
  } catch (err) { next(err); }
};

export const updateScore = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const schema = z.object({
      userId: z.string(),
      score: z.number(),
      hackathonId: z.string().optional(),
      challengeId: z.string().optional(),
    });
    const data = schema.parse(req.body);

    const existing = await prisma.leaderboard.findFirst({
      where: {
        userId: data.userId,
        hackathonId: data.hackathonId || null,
        challengeId: data.challengeId || null,
      },
    });

    let entry;
    if (existing) {
      entry = await prisma.leaderboard.update({
        where: { id: existing.id },
        data: { score: data.score },
      });
    } else {
      entry = await prisma.leaderboard.create({
        data: {
          userId: data.userId,
          score: data.score,
          hackathonId: data.hackathonId,
          challengeId: data.challengeId,
          rank: 0,
        },
      });
    }
    res.json({ success: true, data: entry });
  } catch (err: any) {
    if (err.name === 'ZodError') return res.status(400).json({ success: false, error: err.errors });
    next(err);
  }
};

export const getUserRank = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;
    const entries = await prisma.leaderboard.findMany({
      where: { userId },
      include: { hackathon: { select: { id: true, title: true } }, challenge: { select: { id: true, title: true } } },
    });
    res.json({ success: true, data: entries });
  } catch (err) { next(err); }
};
