import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

const createChatbotSchema = z.object({
  type: z.enum(['CODE', 'APTITUDE']).default('CODE'),
  title: z.string().optional(),
});

const sendMessageSchema = z.object({
  content: z.string().min(1),
});

const ROLE = { USER: 'USER', ASSISTANT: 'ASSISTANT' } as const;

function getStubResponse(content: string, type: string): string {
  const codeResponses = [
    `I can help you with that coding problem. Let me analyze it: the key here is to consider the time complexity. Using a hash map would reduce this from O(n²) to O(n).`,
    `Great debugging question! The issue likely stems from an off-by-one error or an unhandled edge case. I recommend adding boundary checks and unit tests.`,
    `For this algorithm, consider using dynamic programming to cache intermediate results. This avoids redundant computations and improves performance significantly.`,
    `Code review feedback: your function handles the happy path well, but consider adding error handling for null inputs and async edge cases.`,
    `I'd recommend refactoring this into smaller, single-responsibility functions. It will improve readability and testability of your code.`,
  ];
  const aptitudeResponses = [
    `Let's break this down step by step. Identify the pattern first: the sequence increases by doubling each term, so the next value follows that rule.`,
    `For this quantitative problem, set up the equation carefully. Let x be the unknown and solve systematically — the answer is derived from the ratio given.`,
    `Logical reasoning tip: eliminate the clearly wrong options first, then compare the remaining two. Focus on what the premise strictly implies.`,
    `In verbal reasoning, look for the closest synonym in context. Consider the tone and domain of the passage before selecting your answer.`,
    `For data interpretation: calculate the percentage change using (new - old) / old × 100. Apply this formula to each option to find the correct one.`,
  ];
  const pool = type === 'CODE' ? codeResponses : aptitudeResponses;
  return pool[Math.floor(Math.random() * pool.length)];
}

export const createChatbot = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = createChatbotSchema.parse(req.body);
    const chatbot = await prisma.aIChatbot.create({
      data: {
        userId: req.user!.id,
        type: data.type,
        title: data.title ?? `New ${data.type} Chat`,
      },
    });
    res.status(201).json({ success: true, data: chatbot });
  } catch (err: any) {
    if (err.name === 'ZodError') return res.status(400).json({ success: false, error: err.errors });
    next(err);
  }
};

export const sendChatbotMessage = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const data = sendMessageSchema.parse(req.body);

    const chatbot = await prisma.aIChatbot.findFirst({
      where: { id, userId: req.user!.id },
    });
    if (!chatbot) return res.status(404).json({ success: false, error: 'Chatbot session not found' });

    const userMessage = await prisma.chatMessage.create({
      data: { chatbotId: id, role: ROLE.USER, content: data.content },
    });

    const aiContent = getStubResponse(data.content, chatbot.type);
    const assistantMessage = await prisma.chatMessage.create({
      data: { chatbotId: id, role: ROLE.ASSISTANT, content: aiContent },
    });

    res.json({ success: true, data: { userMessage, assistantMessage } });
  } catch (err: any) {
    if (err.name === 'ZodError') return res.status(400).json({ success: false, error: err.errors });
    next(err);
  }
};

export const getChatbot = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const chatbot = await prisma.aIChatbot.findFirst({
      where: { id: req.params.id, userId: req.user!.id },
      include: { messages: { orderBy: { timestamp: 'asc' } } },
    });
    if (!chatbot) return res.status(404).json({ success: false, error: 'Chatbot session not found' });
    res.json({ success: true, data: chatbot });
  } catch (err) {
    next(err);
  }
};

export const listChatbots = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const chatbots = await prisma.aIChatbot.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { messages: true } } },
    });
    res.json({ success: true, data: chatbots });
  } catch (err) {
    next(err);
  }
};
