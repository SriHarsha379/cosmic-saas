import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

const JOB_ROLES = [
  { id: 'SALES', name: 'Sales', description: 'Client acquisition, negotiation, and closing deals' },
  { id: 'HR', name: 'HR', description: 'Human resources, recruitment, and people management' },
  { id: 'MANAGEMENT', name: 'Management', description: 'Team leadership, project planning, and strategy' },
  { id: 'TECHNICAL', name: 'Technical', description: 'Software development, system design, and problem-solving' },
  { id: 'HEALTHCARE', name: 'Healthcare', description: 'Clinical knowledge, patient care, and medical procedures' },
  { id: 'FINANCE', name: 'Finance', description: 'Financial analysis, accounting, and investment strategies' },
];

const startInterviewSchema = z.object({
  jobRole: z.string().min(1),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).optional().default('MEDIUM'),
});

const submitInterviewSchema = z.object({
  answers: z.array(z.any()),
});

function generateFeedback(jobRole: string, score: number): string {
  if (score >= 85) {
    return `Excellent performance in the ${jobRole} interview! You demonstrated strong domain knowledge and clear communication. Keep refining your answers with specific examples.`;
  }
  if (score >= 70) {
    return `Good showing in the ${jobRole} interview. You covered the key areas well. Focus on providing more concrete examples and structuring answers using the STAR method.`;
  }
  return `Your ${jobRole} interview showed potential, but there are areas to improve. Review core concepts, practice behavioral questions, and work on concise, structured responses.`;
}

export const listInterviewTypes = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userInterviews = await prisma.mockInterview.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: { jobRoles: JOB_ROLES, interviews: userInterviews } });
  } catch (err) {
    next(err);
  }
};

export const startMockInterview = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = startInterviewSchema.parse(req.body);
    const interview = await prisma.mockInterview.create({
      data: {
        userId: req.user!.id,
        jobRole: data.jobRole,
        difficulty: data.difficulty,
        status: 'IN_PROGRESS',
        startedAt: new Date(),
      },
    });
    res.status(201).json({ success: true, data: interview });
  } catch (err: any) {
    if (err.name === 'ZodError') return res.status(400).json({ success: false, error: err.errors });
    next(err);
  }
};

export const submitMockInterview = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    submitInterviewSchema.parse(req.body);

    const interview = await prisma.mockInterview.findFirst({
      where: { id, userId: req.user!.id },
    });
    if (!interview) return res.status(404).json({ success: false, error: 'Interview not found' });
    if (interview.status === 'COMPLETED') {
      return res.status(400).json({ success: false, error: 'Interview already completed' });
    }

    const score = Math.round(60 + Math.random() * 40);
    const feedback = generateFeedback(interview.jobRole, score);
    const completedAt = new Date();
    const duration = interview.startedAt
      ? Math.round((completedAt.getTime() - interview.startedAt.getTime()) / 1000)
      : null;

    const updated = await prisma.mockInterview.update({
      where: { id },
      data: { status: 'COMPLETED', completedAt, score, feedback, duration },
    });

    res.json({ success: true, data: updated });
  } catch (err: any) {
    if (err.name === 'ZodError') return res.status(400).json({ success: false, error: err.errors });
    next(err);
  }
};

export const getMockInterviewResults = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const interview = await prisma.mockInterview.findFirst({
      where: { id: req.params.id, userId: req.user!.id },
    });
    if (!interview) return res.status(404).json({ success: false, error: 'Interview not found' });
    res.json({ success: true, data: interview });
  } catch (err) {
    next(err);
  }
};

export const listUserMockInterviews = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const interviews = await prisma.mockInterview.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: interviews });
  } catch (err) {
    next(err);
  }
};
