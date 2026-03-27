import { Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

const ACHIEVEMENTS = [
  { id: 'FIRST_TEST', name: 'First Test', description: 'Completed your first test.' },
  { id: 'INTERVIEW_READY', name: 'Interview Ready', description: 'Completed a mock interview.' },
  { id: 'SELF_AWARE', name: 'Self Aware', description: 'Completed a self-evaluation.' },
  { id: 'LINGUIST', name: 'Linguist', description: 'Completed a Versant language test.' },
  { id: 'AI_EXPLORER', name: 'AI Explorer', description: 'Used the AI chatbot assistant.' },
];

export const getProgressStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;

    const [testsTaken, mockInterviews, versantTests, selfEvaluations, aiChatbots, metrics, results] =
      await Promise.all([
        prisma.testAttempt.count({ where: { userId } }),
        prisma.mockInterview.count({ where: { userId } }),
        prisma.versantTest.count({ where: { userId } }),
        prisma.selfEvaluation.count({ where: { userId } }),
        prisma.aIChatbot.count({ where: { userId } }),
        prisma.progressMetric.findMany({ where: { userId } }),
        prisma.result.findMany({ where: { userId }, select: { accuracy: true } }),
      ]);

    const avgAccuracy =
      results.length > 0
        ? Math.round(
            results.reduce((sum, r) => sum + (r.accuracy ?? 0), 0) / results.length
          )
        : 0;

    const unlockedAchievements = ACHIEVEMENTS.filter((a) => {
      if (a.id === 'FIRST_TEST') return testsTaken > 0;
      if (a.id === 'INTERVIEW_READY') return mockInterviews > 0;
      if (a.id === 'SELF_AWARE') return selfEvaluations > 0;
      if (a.id === 'LINGUIST') return versantTests > 0;
      if (a.id === 'AI_EXPLORER') return aiChatbots > 0;
      return false;
    });

    res.json({
      success: true,
      data: {
        testsTaken,
        avgAccuracy,
        mockInterviews,
        versantTests,
        selfEvaluations,
        aiChatbots,
        achievements: unlockedAchievements,
        metrics,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getProgressHistory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;

    const [activities, results, interviews, evaluations, versantTests] = await Promise.all([
      prisma.activity.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
      prisma.result.findMany({
        where: { userId },
        orderBy: { completedAt: 'desc' },
        take: 10,
        include: { test: { select: { title: true } } },
      }),
      prisma.mockInterview.findMany({
        where: { userId, status: 'COMPLETED' },
        orderBy: { completedAt: 'desc' },
        take: 10,
      }),
      prisma.selfEvaluation.findMany({
        where: { userId, completedAt: { not: null } },
        orderBy: { completedAt: 'desc' },
        take: 10,
      }),
      prisma.versantTest.findMany({
        where: { userId, completedAt: { not: null } },
        orderBy: { completedAt: 'desc' },
        take: 10,
      }),
    ]);

    const timeline = [
      ...activities.map((a) => ({ type: 'ACTIVITY', date: a.createdAt, data: a })),
      ...results.map((r) => ({ type: 'TEST_RESULT', date: r.completedAt, data: r })),
      ...interviews.map((i) => ({ type: 'MOCK_INTERVIEW', date: i.completedAt!, data: i })),
      ...evaluations.map((e) => ({ type: 'SELF_EVALUATION', date: e.completedAt!, data: e })),
      ...versantTests.map((v) => ({ type: 'VERSANT_TEST', date: v.completedAt!, data: v })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    res.json({ success: true, data: timeline });
  } catch (err) {
    next(err);
  }
};

export const getProgressMetrics = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;

    const [metrics, results, interviews, versantTests] = await Promise.all([
      prisma.progressMetric.findMany({ where: { userId } }),
      prisma.result.findMany({
        where: { userId },
        orderBy: { completedAt: 'desc' },
        take: 20,
        select: { score: true, totalScore: true, accuracy: true, completedAt: true },
      }),
      prisma.mockInterview.findMany({
        where: { userId, status: 'COMPLETED' },
        orderBy: { completedAt: 'desc' },
        take: 20,
        select: { score: true, jobRole: true, completedAt: true },
      }),
      prisma.versantTest.findMany({
        where: { userId, completedAt: { not: null } },
        orderBy: { completedAt: 'desc' },
        take: 20,
        select: { score: true, proficiencyLevel: true, testType: true, completedAt: true },
      }),
    ]);

    res.json({
      success: true,
      data: { metrics, testScores: results, interviewScores: interviews, versantScores: versantTests },
    });
  } catch (err) {
    next(err);
  }
};
