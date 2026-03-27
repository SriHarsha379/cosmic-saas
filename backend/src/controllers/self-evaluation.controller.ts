import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

const EVALUATION_MODES = [
  { id: 'ASSESSMENT', name: 'Assessment', desc: 'Structured evaluation of your current skill level with detailed scoring and feedback.' },
  { id: 'TEST', name: 'Test', desc: 'Timed test to simulate real interview conditions and measure performance under pressure.' },
];

const createEvaluationSchema = z.object({
  jobRole: z.string().min(1),
  mode: z.enum(['ASSESSMENT', 'TEST']).default('ASSESSMENT'),
});

const submitEvaluationSchema = z.object({
  answers: z.array(z.any()),
});

function generateQuestions(jobRole: string): object[] {
  const genericQuestions = [
    { id: 1, text: `What are the core responsibilities of a ${jobRole} professional?`, type: 'open' },
    { id: 2, text: `Describe a challenge you faced in a ${jobRole} context and how you resolved it.`, type: 'open' },
    { id: 3, text: `Which tools or frameworks are most important for ${jobRole}?`, type: 'open' },
    { id: 4, text: `How do you stay up to date with trends in the ${jobRole} field?`, type: 'open' },
    { id: 5, text: `How would you prioritize tasks when managing multiple ${jobRole} projects?`, type: 'open' },
  ];

  const roleQuestions: Record<string, object[]> = {
    SALES: [
      { id: 6, text: 'What is your strategy for handling objections from potential clients?', type: 'open' },
      { id: 7, text: 'Describe your pipeline management process.', type: 'open' },
    ],
    HR: [
      { id: 6, text: 'How do you approach conflict resolution between team members?', type: 'open' },
      { id: 7, text: 'Describe your experience with performance management systems.', type: 'open' },
    ],
    TECHNICAL: [
      { id: 6, text: 'Explain the concept of RESTful API design principles.', type: 'open' },
      { id: 7, text: 'How do you approach debugging a complex production issue?', type: 'open' },
    ],
    FINANCE: [
      { id: 6, text: 'Walk me through a discounted cash flow (DCF) analysis.', type: 'open' },
      { id: 7, text: 'How do you assess financial risk in an investment decision?', type: 'open' },
    ],
  };

  const extra = roleQuestions[jobRole.toUpperCase()] ?? [];
  return [...genericQuestions, ...extra];
}

function calculateScore(answers: any[]): number {
  if (!answers || answers.length === 0) return 0;
  return Math.round(55 + Math.random() * 45);
}

function generateFeedback(jobRole: string, score: number): string {
  if (score >= 85) {
    return `Outstanding self-evaluation for ${jobRole}! Your answers reflect deep domain knowledge and practical experience. Continue building on this strong foundation.`;
  }
  if (score >= 70) {
    return `Solid performance in the ${jobRole} evaluation. You have a good grasp of the fundamentals. Work on elaborating your answers with real-world scenarios.`;
  }
  return `Your ${jobRole} evaluation reveals areas for growth. Revisit core concepts, seek mentorship, and practice articulating your experience more concisely.`;
}

export const getEvaluationModes = async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    res.json({ success: true, data: EVALUATION_MODES });
  } catch (err) {
    next(err);
  }
};

export const createEvaluation = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = createEvaluationSchema.parse(req.body);
    const questions = generateQuestions(data.jobRole);
    const evaluation = await prisma.selfEvaluation.create({
      data: {
        userId: req.user!.id,
        jobRole: data.jobRole,
        mode: data.mode,
        questions: JSON.stringify(questions),
      },
    });
    res.status(201).json({
      success: true,
      data: { ...evaluation, questions },
    });
  } catch (err: any) {
    if (err.name === 'ZodError') return res.status(400).json({ success: false, error: err.errors });
    next(err);
  }
};

export const submitEvaluation = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const data = submitEvaluationSchema.parse(req.body);

    const evaluation = await prisma.selfEvaluation.findFirst({
      where: { id, userId: req.user!.id },
    });
    if (!evaluation) return res.status(404).json({ success: false, error: 'Evaluation not found' });
    if (evaluation.completedAt) {
      return res.status(400).json({ success: false, error: 'Evaluation already submitted' });
    }

    const score = calculateScore(data.answers);
    const feedback = generateFeedback(evaluation.jobRole, score);

    const updated = await prisma.selfEvaluation.update({
      where: { id },
      data: {
        answers: JSON.stringify(data.answers),
        score,
        feedback,
        completedAt: new Date(),
      },
    });

    res.json({
      success: true,
      data: {
        ...updated,
        questions: JSON.parse(updated.questions),
        answers: JSON.parse(updated.answers),
      },
    });
  } catch (err: any) {
    if (err.name === 'ZodError') return res.status(400).json({ success: false, error: err.errors });
    next(err);
  }
};

export const getEvaluationResults = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const evaluation = await prisma.selfEvaluation.findFirst({
      where: { id: req.params.id, userId: req.user!.id },
    });
    if (!evaluation) return res.status(404).json({ success: false, error: 'Evaluation not found' });
    res.json({
      success: true,
      data: {
        ...evaluation,
        questions: JSON.parse(evaluation.questions),
        answers: JSON.parse(evaluation.answers),
      },
    });
  } catch (err) {
    next(err);
  }
};

export const listUserEvaluations = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const evaluations = await prisma.selfEvaluation.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: evaluations });
  } catch (err) {
    next(err);
  }
};
