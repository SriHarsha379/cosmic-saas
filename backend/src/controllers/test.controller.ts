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
  questions: z.array(z.object({
    question: z.string().min(1),
    type: z.enum(['MCQ', 'TRUE_FALSE', 'ESSAY', 'CODING']).default('MCQ'),
    options: z.array(z.string()).optional(),
    correctAnswer: z.string().optional(),
    marks: z.number().default(1),
    explanation: z.string().optional(),
    order: z.number().default(0),
  })).optional(),
});

export const listTests = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const difficulty = req.query.difficulty as string;
    const where = difficulty ? { difficulty } : {};
    const tests = await prisma.test.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { questions: true } },
      },
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
        questions: { orderBy: { order: 'asc' } },
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
    const { questions, ...testData } = data;
    const test = await prisma.test.create({
      data: {
        title: testData.title as string,
        description: testData.description,
        difficulty: testData.difficulty,
        duration: testData.duration,
        totalQuestions: testData.totalQuestions ?? questions?.length,
        questions: questions?.length
          ? {
              create: questions.map((q, i) => ({
                question: q.question,
                type: q.type,
                options: q.options ?? undefined,
                correctAnswer: q.correctAnswer,
                marks: q.marks,
                explanation: q.explanation,
                order: q.order ?? i,
              })),
            }
          : undefined,
      },
      include: { questions: { orderBy: { order: 'asc' } } },
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
    const { questions, ...testData } = data;
    const test = await prisma.$transaction(async (tx) => {
      await tx.test.update({
        where: { id: req.params.id },
        data: {
          ...testData,
          totalQuestions: testData.totalQuestions ?? (questions !== undefined ? questions.length : undefined),
        },
      });
      if (questions !== undefined) {
        await tx.question.deleteMany({ where: { testId: req.params.id } });
        const validQuestions = questions.filter((q): q is typeof q & { question: string } => !!q.question);
        if (validQuestions.length > 0) {
          await tx.question.createMany({
            data: validQuestions.map((q, i) => ({
              testId: req.params.id,
              question: q.question,
              type: q.type ?? 'MCQ',
              options: q.options ?? undefined,
              correctAnswer: q.correctAnswer,
              marks: q.marks ?? 1,
              explanation: q.explanation,
              order: q.order ?? i,
            })),
          });
        }
      }
      return tx.test.findUnique({
        where: { id: req.params.id },
        include: { questions: { orderBy: { order: 'asc' } } },
      });
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

export const startTest = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const test = await prisma.test.findUnique({ where: { id: req.params.id } });
    if (!test) return res.status(404).json({ success: false, error: 'Test not found' });

    const existing = await prisma.testAttempt.findUnique({
      where: { testId_userId: { testId: req.params.id, userId: req.user!.id } },
    });

    if (existing) {
      if (existing.status === 'COMPLETED') {
        return res.status(400).json({ success: false, error: 'Test already completed' });
      }
      return res.json({ success: true, data: existing });
    }

    const attempt = await prisma.testAttempt.create({
      data: {
        testId: req.params.id,
        userId: req.user!.id,
        status: 'IN_PROGRESS',
      },
    });

    res.status(201).json({ success: true, data: attempt });
  } catch (err) {
    console.error('❌ Start test error:', err);
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
