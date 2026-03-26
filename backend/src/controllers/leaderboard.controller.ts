import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

export const getLeaderboard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;

    // Get top scorers based on results
    const topScorers = await prisma.result.groupBy({
      by: ['userId'],
      _sum: { score: true },
      _avg: { accuracy: true },
      _count: { id: true },
      orderBy: { _sum: { score: 'desc' } },
      take: limit,
    });

    // Fetch user details for each top scorer
    const leaderboard = await Promise.all(
      topScorers.map(async (entry, index) => {
        const user = await prisma.user.findUnique({
          where: { id: entry.userId },
          select: { id: true, firstName: true, lastName: true, avatar: true },
        });
        return {
          rank: index + 1,
          userId: entry.userId,
          user,
          totalScore: entry._sum.score || 0,
          averageAccuracy: entry._avg.accuracy || 0,
          testCount: entry._count.id,
        };
      })
    );

    res.json({ success: true, data: leaderboard });
  } catch (err) {
    next(err);
  }
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
      return res.json({
        success: true,
        data: {
          rank: null,
          totalScore: 0,
          averageAccuracy: 0,
          testCount: 0,
        },
      });
    }

    // Get all users ranked by score
    const allScores = await prisma.result.groupBy({
      by: ['userId'],
      _sum: { score: true },
      orderBy: { _sum: { score: 'desc' } },
    });

    const userRank = allScores.findIndex((entry) => entry.userId === userId) + 1;

    res.json({
      success: true,
      data: {
        rank: userRank,
        totalScore: userStats[0]._sum.score || 0,
        averageAccuracy: userStats[0]._avg.accuracy || 0,
        testCount: userStats[0]._count.id,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const updateScore = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    res.json({ success: true, data: { message: 'Score updated' } });
  } catch (err) {
    next(err);
  }
};
