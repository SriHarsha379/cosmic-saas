import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

const teamSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  hackathonId: z.string().optional(),
});

export const listTeams = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const hackathonId = req.query.hackathonId as string;
    const where = hackathonId ? { hackathonId } : {};
    const teams = await prisma.team.findMany({
      where,
      include: {
        creator: { select: { id: true, firstName: true, lastName: true, avatar: true } },
        members: { include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true } } } },
        _count: { select: { members: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: teams });
  } catch (err) { next(err); }
};

export const getTeam = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const team = await prisma.team.findUnique({
      where: { id: req.params.id },
      include: {
        creator: { select: { id: true, firstName: true, lastName: true, avatar: true } },
        members: { include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true } } } },
        joinRequests: { where: { status: 'PENDING' }, include: { user: { select: { id: true, firstName: true, lastName: true } } } },
        hackathon: true,
      },
    });
    if (!team) return res.status(404).json({ success: false, error: 'Team not found' });
    res.json({ success: true, data: team });
  } catch (err) { next(err); }
};

export const createTeam = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = teamSchema.parse(req.body);
    const team = await prisma.team.create({
      data: {
        name: data.name,
        description: data.description,
        hackathonId: data.hackathonId,
        createdBy: req.user!.id,
        members: { create: { userId: req.user!.id, role: 'LEADER' } },
      } as any,
      include: {
        members: { include: { user: { select: { id: true, firstName: true, lastName: true } } } },
      },
    });
    await prisma.activity.create({
      data: { userId: req.user!.id, type: 'CREATED_TEAM', description: `Created team: ${team.name}` },
    });
    res.status(201).json({ success: true, data: team });
  } catch (err: any) {
    if (err.name === 'ZodError') return res.status(400).json({ success: false, error: err.errors });
    next(err);
  }
};

export const updateTeam = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = teamSchema.partial().parse(req.body);
    const team = await prisma.team.findUnique({ where: { id: req.params.id } });
    if (!team) return res.status(404).json({ success: false, error: 'Team not found' });
    if (team.createdBy !== req.user!.id && req.user!.role !== 'ADMIN') {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }
    const updated = await prisma.team.update({ where: { id: req.params.id }, data });
    res.json({ success: true, data: updated });
  } catch (err: any) {
    if (err.name === 'ZodError') return res.status(400).json({ success: false, error: err.errors });
    next(err);
  }
};

export const deleteTeam = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const team = await prisma.team.findUnique({ where: { id: req.params.id } });
    if (!team) return res.status(404).json({ success: false, error: 'Team not found' });
    if (team.createdBy !== req.user!.id && req.user!.role !== 'ADMIN') {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }
    await prisma.team.delete({ where: { id: req.params.id } });
    res.json({ success: true, data: { message: 'Team deleted' } });
  } catch (err) { next(err); }
};

export const requestJoin = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const isMember = await prisma.teamMember.findUnique({
      where: { teamId_userId: { teamId: req.params.id, userId: req.user!.id } },
    });
    if (isMember) return res.status(409).json({ success: false, error: 'Already a member' });
    const request = await prisma.joinRequest.create({
      data: { teamId: req.params.id, userId: req.user!.id },
    });
    res.status(201).json({ success: true, data: request });
  } catch (err: any) {
    if (err.code === 'P2002') return res.status(409).json({ success: false, error: 'Request already sent' });
    next(err);
  }
};

export const respondJoinRequest = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { requestId } = req.params;
    const { status } = req.body;
    if (!['ACCEPTED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Status must be ACCEPTED or REJECTED' });
    }
    const joinRequest = await prisma.joinRequest.update({
      where: { id: requestId },
      data: { status, respondedAt: new Date() },
    });
    if (status === 'ACCEPTED') {
      await prisma.teamMember.create({ data: { teamId: joinRequest.teamId, userId: joinRequest.userId } });
    }
    res.json({ success: true, data: joinRequest });
  } catch (err) { next(err); }
};

export const removeMember = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id: teamId, userId } = req.params;
    await prisma.teamMember.delete({ where: { teamId_userId: { teamId, userId } } });
    res.json({ success: true, data: { message: 'Member removed' } });
  } catch (err) { next(err); }
};
