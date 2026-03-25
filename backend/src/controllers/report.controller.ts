import { Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

export const getDashboardReport = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const [
      user,
      recentActivities,
      testStats,
      applicationStats,
      certificates,
    ] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        include: { progress: true, wallet: true },
      }),
      prisma.activity.findMany({
        where: { userId },
        orderBy: { timestamp: 'desc' },
        take: 10,
      }),
      prisma.testResult.aggregate({
        where: { userId },
        _avg: { score: true, accuracy: true },
        _count: true,
        _max: { score: true },
      }),
      prisma.application.groupBy({
        by: ['status'],
        where: { userId },
        _count: true,
      }),
      prisma.certificate.count({ where: { userId } }),
    ]);
    res.json({
      success: true,
      data: {
        user,
        recentActivities,
        testStats,
        applicationStats,
        certificateCount: certificates,
      },
    });
  } catch (err) { next(err); }
};

export const getAdminReport = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const [
      userCount,
      hackathonCount,
      jobCount,
      applicationCount,
      testCount,
      recentUsers,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.hackathon.count(),
      prisma.job.count(),
      prisma.application.count(),
      prisma.test.count(),
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, firstName: true, lastName: true, email: true, createdAt: true },
      }),
    ]);
    res.json({
      success: true,
      data: {
        counts: { users: userCount, hackathons: hackathonCount, jobs: jobCount, applications: applicationCount, tests: testCount },
        recentUsers,
      },
    });
  } catch (err) { next(err); }
};
