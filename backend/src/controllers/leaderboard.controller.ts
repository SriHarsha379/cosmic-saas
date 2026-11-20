import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';

export const getLeaderboard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;

    const topScorers = await prisma.result.groupBy({
      by: ['userId'],
      _sum: { score: true },
      _avg: { accuracy: true },
      _count: { id: true },
      orderBy: { _sum: { score: 'desc' } },
      take: limit,
    });

    const userIds = topScorers.map(e => e.userId);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, firstName: true, lastName: true, avatar: true },
    });
    const userMap = Object.fromEntries(users.map(u => [u.id, u]));

    const leaderboard = topScorers.map((entry, index) => ({
      rank: index + 1,
      userId: entry.userId,
      user: userMap[entry.userId] || null,
      totalScore: entry._sum.score || 0,
      averageAccuracy: entry._avg.accuracy || 0,
      testCount: entry._count.id,
    }));

    res.json({ success: true, data: leaderboard });
  } catch (err) { next(err); }
};

export const getUserRank = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const userStats = await prisma.result.groupBy({
      by: ['userId'],
      _sum: { score: true },
      _avg: { accuracy: true },
      _count: { id: true },
      where: { userId },
    });

    if (!userStats[0]) {
      return res.json({ success: true, data: { rank: null, totalScore: 0, averageAccuracy: 0, testCount: 0 } });
    }

    const allScores = await prisma.result.groupBy({
      by: ['userId'],
      _sum: { score: true },
      orderBy: { _sum: { score: 'desc' } },
    });

    const userRank = allScores.findIndex(e => e.userId === userId) + 1;
    res.json({
      success: true,
      data: {
        rank: userRank,
        totalScore: userStats[0]._sum.score || 0,
        averageAccuracy: userStats[0]._avg.accuracy || 0,
        testCount: userStats[0]._count.id,
      },
    });
  } catch (err) { next(err); }
};

export const updateScore = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    res.json({ success: true, data: { message: 'Score updated' } });
  } catch (err) { next(err); }
};
