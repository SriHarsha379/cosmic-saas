import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';

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

const submitSchema = z.object({
  answers: z.record(z.string(), z.string()),
  duration: z.number().optional(),
});

export const listTests = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const difficulty = req.query.difficulty as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const where = difficulty ? { difficulty } : {};

    const [tests, total] = await Promise.all([
      prisma.test.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { questions: true } } },
      }),
      prisma.test.count({ where }),
    ]);

    res.json({ success: true, data: { tests, total, page, totalPages: Math.ceil(total / limit) } });
  } catch (err) { next(err); }
};

export const getTest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const test = await prisma.test.findUnique({
      where: { id: req.params.id },
      include: {
        questions: { orderBy: { order: 'asc' } },
        _count: { select: { attempts: true, results: true } },
      },
    });
    if (!test) return res.status(404).json({ success: false, error: 'Test not found' });
    res.json({ success: true, data: test });
  } catch (err) { next(err); }
};

export const createTest = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = testSchema.parse(req.body);
    const { questions, ...testData } = data;
    const test = await prisma.test.create({
      data: {
        title: testData.title,
        description: testData.description,
        difficulty: testData.difficulty,
        duration: testData.duration,
        totalQuestions: testData.totalQuestions ?? questions?.length,
        questions: questions?.length ? {
          create: questions.map((q, i) => ({
            question: q.question,
            type: q.type,
            options: q.options ?? undefined,
            correctAnswer: q.correctAnswer,
            marks: q.marks,
            explanation: q.explanation,
            order: q.order ?? i,
          })),
        } : undefined,
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
        const valid = questions.filter((q): q is typeof q & { question: string } => !!q.question);
        if (valid.length > 0) {
          await tx.question.createMany({
            data: valid.map((q, i) => ({
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
  } catch (err) { next(err); }
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
      data: { testId: req.params.id, userId: req.user!.id, status: 'IN_PROGRESS' },
    });
    res.status(201).json({ success: true, data: attempt });
  } catch (err) { next(err); }
};

export const submitTest = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Validate request body
    const { answers, duration } = submitSchema.parse(req.body);

    // Load the test + correct answers from DB (never trust client score)
    const test = await prisma.test.findUnique({
      where: { id: req.params.id },
      include: { questions: true },
    });
    if (!test) return res.status(404).json({ success: false, error: 'Test not found' });

    // Check the attempt exists and is in progress
    const attempt = await prisma.testAttempt.findUnique({
      where: { testId_userId: { testId: req.params.id, userId: req.user!.id } },
    });
    if (!attempt) return res.status(400).json({ success: false, error: 'You have not started this test' });
    if (attempt.status === 'COMPLETED') return res.status(400).json({ success: false, error: 'Test already submitted' });

    // Server-side scoring
    let earnedMarks = 0;
    let totalMarks = 0;
    const breakdown: Record<string, { correct: boolean; correctAnswer: string; yourAnswer: string }> = {};

    for (const question of test.questions) {
      const questionMarks = question.marks || 1;
      totalMarks += questionMarks;

      if (question.type === 'ESSAY' || question.type === 'CODING') {
        // Essay/Coding: award full marks for now (needs AI grading later)
        earnedMarks += questionMarks;
        breakdown[question.id] = { correct: true, correctAnswer: question.correctAnswer || '', yourAnswer: answers[question.id] || '' };
        continue;
      }

      const userAnswer = (answers[question.id] || '').trim().toLowerCase();
      const correctAnswer = (question.correctAnswer || '').trim().toLowerCase();
      const isCorrect = userAnswer === correctAnswer;

      if (isCorrect) earnedMarks += questionMarks;
      breakdown[question.id] = {
        correct: isCorrect,
        correctAnswer: question.correctAnswer || '',
        yourAnswer: answers[question.id] || '',
      };
    }

    const score = totalMarks > 0 ? Math.round((earnedMarks / totalMarks) * 100) : 0;
    const accuracy = score;

    // Mark attempt as completed
    await prisma.testAttempt.update({
      where: { testId_userId: { testId: req.params.id, userId: req.user!.id } },
      data: { status: 'COMPLETED', endedAt: new Date() },
    });

    // Save result
    const result = await prisma.result.create({
      data: {
        userId: req.user!.id,
        testId: req.params.id,
        score,
        totalScore: 100,
        accuracy,
        duration: duration || 0,
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    });

    // Award certificate if score >= 70
    let certificate = null;
    if (score >= 70) {
      certificate = await prisma.certificate.create({
        data: {
          userId: req.user!.id,
          title: `${test.title} — Certificate of Completion`,
          issuedBy: 'Cosmic SaaS',
          description: `Completed with ${score}% score`,
          certificateId: `CERT-${Date.now()}`,
        },
      });
    }

    await prisma.activity.create({
      data: {
        userId: req.user!.id,
        type: 'TEST_COMPLETED',
        description: `Completed "${test.title}" with score ${score}%`,
      },
    });

    res.json({
      success: true,
      data: { result, score, accuracy, earnedMarks, totalMarks, breakdown, certificate },
    });
  } catch (err: any) {
    if (err.name === 'ZodError') return res.status(400).json({ success: false, error: err.errors });
    next(err);
  }
};

export const getTestResults = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const results = await prisma.result.findMany({
      where: { userId: req.user!.id },
      include: { test: { select: { id: true, title: true, difficulty: true } } },
      orderBy: { completedAt: 'desc' },
    });
    res.json({ success: true, data: results });
  } catch (err) { next(err); }
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
    // Only allow owner or admin to view
    if (result.userId !== req.user!.id && req.user!.role !== 'ADMIN') {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
};
