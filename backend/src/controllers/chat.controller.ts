import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

const messageSchema = z.object({
  botType: z.enum(['CODING', 'APTITUDE']).optional(),
  conversationId: z.string().optional(),
  message: z.string().min(1),
});

export const sendMessage = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = messageSchema.parse(req.body);
    const botType = data.botType || 'CODING';
    const conversationId = data.conversationId;

    let chatHistory;
    if (conversationId) {
      chatHistory = await prisma.chatHistory.findFirst({
        where: { conversationId, userId: req.user!.id },
      });
    }

    const userMessage = { role: 'user', content: data.message, timestamp: new Date() };
    const botResponse = generateBotResponse(data.message, botType);
    const assistantMessage = { role: 'assistant', content: botResponse, timestamp: new Date() };

    if (chatHistory) {
      const messages = JSON.parse(chatHistory.messagesData);
      chatHistory = await prisma.chatHistory.update({
        where: { id: chatHistory.id },
        data: {
          messagesData: JSON.stringify([...messages, userMessage, assistantMessage]),
          lastMessageAt: new Date(),
        },
      });
    } else {
      chatHistory = await prisma.chatHistory.create({
        data: {
          userId: req.user!.id,
          botType,
          messagesData: JSON.stringify([userMessage, assistantMessage]),
          lastMessageAt: new Date(),
        },
      });
    }

    res.json({ success: true, data: { response: botResponse, conversationId: chatHistory.conversationId, history: chatHistory } });
  } catch (err: any) {
    if (err.name === 'ZodError') return res.status(400).json({ success: false, error: err.errors });
    next(err);
  }
};

function generateBotResponse(message: string, botType: string): string {
  const codingResponses = [
    'Great question! Let me help you with that code.',
    "Here's a solution approach for your coding problem.",
    'I\'d suggest using a more efficient algorithm here.',
  ];
  const aptitudeResponses = [
    "Let's break down this aptitude problem step by step.",
    'The key to solving this is identifying the pattern.',
    "Here's how to approach this type of question.",
  ];
  const responses = botType === 'CODING' ? codingResponses : aptitudeResponses;
  return responses[Math.floor(Math.random() * responses.length)];
}

export const getChatHistory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const histories = await prisma.chatHistory.findMany({
      where: { userId: req.user!.id },
      orderBy: { lastMessageAt: 'desc' },
    });
    res.json({ success: true, data: histories });
  } catch (err) { next(err); }
};

export const getConversation = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const chat = await prisma.chatHistory.findFirst({
      where: { conversationId: req.params.conversationId, userId: req.user!.id },
    });
    if (!chat) return res.status(404).json({ success: false, error: 'Conversation not found' });
    res.json({ success: true, data: chat });
  } catch (err) { next(err); }
};

export const deleteConversation = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await prisma.chatHistory.deleteMany({
      where: { conversationId: req.params.conversationId, userId: req.user!.id },
    });
    res.json({ success: true, data: { message: 'Conversation deleted' } });
  } catch (err) { next(err); }
};
