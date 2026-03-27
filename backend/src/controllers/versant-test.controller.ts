import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

const TEST_TYPES = [
  { id: 'SENTENCE_COMPLETION', name: 'Sentence Completion', description: 'Complete sentences to test grammar and vocabulary.' },
  { id: 'PASSAGE_RECONSTRUCTION', name: 'Passage Reconstruction', description: 'Reconstruct scrambled passages to assess reading comprehension.' },
  { id: 'TYPING', name: 'Typing', description: 'Assess typing speed and accuracy in English.' },
  { id: 'SHORT_ANSWERS', name: 'Short Answers', description: 'Answer questions in written English to evaluate fluency.' },
  { id: 'READING_ALOUD', name: 'Reading Aloud', description: 'Read passages aloud to test pronunciation and fluency.' },
  { id: 'REPEAT_SENTENCES', name: 'Repeat Sentences', description: 'Repeat spoken sentences to test listening and retention.' },
  { id: 'CONVERSATIONS', name: 'Conversations', description: 'Simulated dialogues to assess conversational English ability.' },
  { id: 'DICTATION', name: 'Dictation', description: 'Write down spoken words and sentences to evaluate listening accuracy.' },
  { id: 'VOCABULARY', name: 'Vocabulary', description: 'Assess breadth and depth of English vocabulary knowledge.' },
  { id: 'STORYTELLING', name: 'Storytelling', description: 'Narrate a story from prompts to test expressive language skills.' },
];

const PROFICIENCY_LEVELS = ['BEGINNER', 'ELEMENTARY', 'INTERMEDIATE', 'UPPER_INTERMEDIATE', 'ADVANCED', 'PROFICIENT'];

const startTestSchema = z.object({
  testType: z.string().min(1),
});

const submitTestSchema = z.object({
  duration: z.number().optional(),
});

function getProficiencyLevel(score: number): string {
  if (score >= 90) return 'PROFICIENT';
  if (score >= 75) return 'ADVANCED';
  if (score >= 60) return 'UPPER_INTERMEDIATE';
  if (score >= 45) return 'INTERMEDIATE';
  if (score >= 30) return 'ELEMENTARY';
  return 'BEGINNER';
}

export const getTestTypes = async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    res.json({ success: true, data: TEST_TYPES });
  } catch (err) {
    next(err);
  }
};

export const startVersantTest = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = startTestSchema.parse(req.body);
    const test = await prisma.versantTest.create({
      data: {
        userId: req.user!.id,
        testType: data.testType,
      },
    });
    res.status(201).json({ success: true, data: test });
  } catch (err: any) {
    if (err.name === 'ZodError') return res.status(400).json({ success: false, error: err.errors });
    next(err);
  }
};

export const submitVersantTest = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const data = submitTestSchema.parse(req.body);

    const test = await prisma.versantTest.findFirst({
      where: { id, userId: req.user!.id },
    });
    if (!test) return res.status(404).json({ success: false, error: 'Versant test not found' });
    if (test.completedAt) {
      return res.status(400).json({ success: false, error: 'Test already submitted' });
    }

    const score = Math.round(30 + Math.random() * 70);
    const proficiencyLevel = getProficiencyLevel(score);

    const updated = await prisma.versantTest.update({
      where: { id },
      data: {
        score,
        proficiencyLevel,
        duration: data.duration ?? null,
        completedAt: new Date(),
      },
    });

    res.json({ success: true, data: updated });
  } catch (err: any) {
    if (err.name === 'ZodError') return res.status(400).json({ success: false, error: err.errors });
    next(err);
  }
};

export const getVersantTestResults = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const test = await prisma.versantTest.findFirst({
      where: { id: req.params.id, userId: req.user!.id },
    });
    if (!test) return res.status(404).json({ success: false, error: 'Versant test not found' });
    res.json({ success: true, data: test });
  } catch (err) {
    next(err);
  }
};

export const listUserVersantTests = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const tests = await prisma.versantTest.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: tests });
  } catch (err) {
    next(err);
  }
};
