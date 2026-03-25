import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

const testSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  totalScore: z.number().optional(),
  duration: z.number().optional(),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).optional(),
  questions: z.array(z.object({
    question: z.string(),
    type: z.enum(['MCQ', 'CODING', 'ESSAY', 'TRUE_FALSE']),
    options: z.array(z.string()).optional(),
    correctAnswer: z.string().optional(),
    score: z.number().optional(),
    order: z.number().optional(),
  })).optional(),
});

export const listTests = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const difficulty = req.query.difficulty as string;
    const where = difficulty ? { difficulty: difficulty as any } : {};
    const tests = await prisma.test.findMany({
      where,
      include: {
        creator: { select: { id: true, firstName: true, lastName: true } },
        _count: { select: { questions: true, results: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: tests });
  } catch (err) { next(err); }
};

export const getTest = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const test = await prisma.test.findUnique({
      where: { id: req.params.id },
      include: {
        creator: { select: { id: true, firstName: true, lastName: true } },
        questions: { orderBy: { order: 'asc' } },
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
        ...testData,
        createdBy: req.user!.id,
        questions: questions ? {
          create: questions.map((q, i) => ({
            question: q.question,
            type: q.type,
            options: q.options || [],
            correctAnswer: q.correctAnswer,
            score: q.score,
            order: q.order ?? i,
          })),
        } : undefined,
      } as any,
      include: { questions: true },
    });
    res.status(201).json({ success: true, data: test });
  } catch (err: any) {
    if (err.name === 'ZodError') return res.status(400).json({ success: false, error: err.errors });
    next(err);
  }
};

export const updateTest = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = testSchema.omit({ questions: true }).partial().parse(req.body);
    const test = await prisma.test.update({ where: { id: req.params.id }, data });
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

export const submitTest = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { answers, duration } = req.body;
    const test = await prisma.test.findUnique({
      where: { id: req.params.id },
      include: { questions: true },
    });
    if (!test) return res.status(404).json({ success: false, error: 'Test not found' });

    let score = 0;
    const processedAnswers = answers.map((a: any) => {
      const question = test.questions.find(q => q.id === a.questionId);
      const isCorrect = question?.correctAnswer === a.answer;
      if (isCorrect) score += question?.score || 10;
      return { ...a, isCorrect };
    });

    const accuracy = test.questions.length > 0 ? (score / test.totalScore) * 100 : 0;
    const passed = accuracy >= 70;

    const prevResult = await prisma.testResult.findFirst({
      where: { userId: req.user!.id, testId: req.params.id },
      orderBy: { attemptNumber: 'desc' },
    });

    const result = await prisma.testResult.create({
      data: {
        userId: req.user!.id,
        testId: req.params.id,
        answers: processedAnswers,
        score,
        accuracy,
        duration: duration || 0,
        status: 'COMPLETED',
        attemptNumber: (prevResult?.attemptNumber || 0) + 1,
        completedAt: new Date(),
      },
    });

    await prisma.progress.upsert({
      where: { userId: req.user!.id },
      update: {
        totalTests: { increment: 1 },
        testsPassed: passed ? { increment: 1 } : undefined,
        totalScore: { increment: score },
      },
      create: {
        userId: req.user!.id,
        totalTests: 1,
        testsPassed: passed ? 1 : 0,
        totalScore: score,
        averageScore: score,
      },
    });

    const progress = await prisma.progress.findUnique({ where: { userId: req.user!.id } });
    if (progress) {
      await prisma.progress.update({
        where: { userId: req.user!.id },
        data: { averageScore: progress.totalScore / progress.totalTests },
      });
    }

    await prisma.activity.create({
      data: {
        userId: req.user!.id,
        type: 'COMPLETED_TEST',
        description: `Completed test: ${test.title} with score ${score}/${test.totalScore}`,
      },
    });

    let certificate = null;
    if (passed) {
      certificate = await prisma.certificate.create({
        data: {
          userId: req.user!.id,
          title: `${test.title} Certificate`,
          issuedBy: 'Cosmic SaaS Platform',
          certificateUrl: `/certificates/${result.id}`,
        },
      });
      await prisma.activity.create({
        data: {
          userId: req.user!.id,
          type: 'EARNED_CERTIFICATE',
          description: `Earned certificate for: ${test.title}`,
        },
      });
    }

    res.json({ success: true, data: { result, certificate, passed, accuracy } });
  } catch (err) { next(err); }
};
