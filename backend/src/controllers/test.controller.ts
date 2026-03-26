import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

const testSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).optional(),
  duration: z.number().min(1).optional(),
  totalQuestions: z.number().optional(),
});

export const listTests = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const difficulty = req.query.difficulty as string;
    const where = difficulty ? { difficulty } : {};
    const tests = await prisma.test.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: tests });
  } catch (err) {
    next(err);
  }
};

export const getTest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const test = await prisma.test.findUnique({
      where: { id: req.params.id },
      include: {
        attempts: { select: { id: true, userId: true, status: true } },
        results: { select: { id: true, userId: true, score: true, accuracy: true } },
      },
    });
    if (!test) return res.status(404).json({ success: false, error: 'Test not found' });
    res.json({ success: true, data: test });
  } catch (err) {
    next(err);
  }
};

export const createTest = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = testSchema.parse(req.body);
    const test = await prisma.test.create({
      data,
    });
    res.status(201).json({ success: true, data: test });
  } catch (err: any) {
    if (err.name === 'ZodError') return res.status(400).json({ success: false, error: err.errors });
    next(err);
  }
};

export const updateTest = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = testSchema.partial().parse(req.body);
    const test = await prisma.test.update({
      where: { id: req.params.id },
      data,
    });
    res.json({ success: true, data: test });
  } catch (err: any) {
    if (err.name === 'ZodError') return res.status(400).json({ success: false, error: err.errors });
    next(err);
  }
};

export const deleteTest = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await prisma.test.delete({ where: { id: req.params.id } });
    res.json({ success: true, data: { message: 'Test deleted' } });
  } catch (err) {
    next(err);
  }
};

export const submitTest = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { score, accuracy, duration } = req.body;

    const result = await prisma.result.create({
      data: {
        userId: req.user!.id,
        testId: req.params.id,
        score: score || 0,
        totalScore: 100,
        accuracy: accuracy || 0,
        duration: duration || 0,
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    });

    await prisma.activity.create({
      data: {
        userId: req.user!.id,
        type: 'TEST_COMPLETED',
        description: `Completed a test with score ${score}`,
      },
    });

    res.json({
      success: true,
      data: {
        result,
        score,
        accuracy,
      },
    });
  } catch (err: any) {
    console.error('❌ Submit test error:', err);
    next(err);
  }
};

export const getTestResults = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const results = await prisma.result.findMany({
      where: { userId: req.user!.id },
      include: { test: { select: { id: true, title: true } } },
      orderBy: { completedAt: 'desc' },
    });
    res.json({ success: true, data: results });
  } catch (err) {
    next(err);
  }
};

export const getTestResult = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await prisma.result.findUnique({
      where: { id: req.params.resultId },
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
