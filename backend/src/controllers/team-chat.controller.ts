import prisma from '../utils/prisma';
import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth';

const messageSchema = z.object({
  teamId: z.string(),
  message: z.string().min(1),
});

export const sendTeamMessage = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { teamId, message } = messageSchema.parse(req.body);
    const userId = req.user!.id;

    // Check if user is team owner or member
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: { members: { where: { userId } } },
    });

    if (!team) {
      return res.status(404).json({ success: false, error: 'Team not found' });
    }

    // Allow if user is owner or member
    const isMember = team.createdBy === userId || team.members.length > 0;

    if (!isMember) {
      return res.status(403).json({ success: false, error: 'Not a team member' });
    }

    // Create message
    const msg = await prisma.teamMessage.create({
      data: {
        teamId,
        userId,
        message,
      },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, avatar: true } },
      },
    });

    res.json({ success: true, data: msg });
  } catch (err: any) {
    console.error('❌ sendTeamMessage error:', err);
    if (err.name === 'ZodError') return res.status(400).json({ success: false, error: err.errors });
    next(err);
  }
};

export const getTeamMessages = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { teamId } = req.params;
    const userId = req.user!.id;

    // Check if user is team owner or member
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: { members: { where: { userId } } },
    });

    if (!team) {
      return res.status(404).json({ success: false, error: 'Team not found' });
    }

    // Allow if user is owner or member
    const isMember = team.createdBy === userId || team.members.length > 0;

    if (!isMember) {
      return res.status(403).json({ success: false, error: 'Not a team member' });
    }

    // Fetch messages
    const messages = await prisma.teamMessage.findMany({
      where: { teamId },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, avatar: true } },
      },
      orderBy: { createdAt: 'asc' },
      take: 100,
    });

    // Format messages
    const formattedMessages = messages.map((msg) => ({
      id: msg.id,
      userId: msg.userId,
      teamId: msg.teamId,
      message: msg.message,
      senderName: msg.user ? `${msg.user.firstName} ${msg.user.lastName}`.trim() : 'Unknown',
      user: msg.user,
      createdAt: msg.createdAt,
    }));

    res.json({ success: true, data: formattedMessages });
  } catch (err: any) {
    console.error('❌ getTeamMessages error:', err);
    next(err);
  }
};

export const deleteMessage = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { messageId } = req.params;
    const userId = req.user!.id;

    const msg = await prisma.teamMessage.findUnique({ where: { id: messageId } });
    if (!msg) return res.status(404).json({ success: false, error: 'Message not found' });

    if (msg.userId !== userId) {
      return res.status(403).json({ success: false, error: 'Cannot delete others\' messages' });
    }

    await prisma.teamMessage.delete({ where: { id: messageId } });
    res.json({ success: true, data: { message: 'Deleted' } });
  } catch (err) {
    next(err);
  }
};
