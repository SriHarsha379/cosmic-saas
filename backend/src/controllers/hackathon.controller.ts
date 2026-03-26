import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

const hackathonSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  status: z.enum(['ACTIVE', 'UPCOMING', 'COMPLETED']).optional(),
  startDate: z.string(),
  endDate: z.string(),
  image: z.string().optional(),
  maxParticipants: z.number().optional(),
  prizePool: z.string().optional(),
});

export const listHackathons = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let status = req.query.status as string | undefined;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    let where: any = {};

    // Only add status filter if provided and valid
    if (status) {
      // Normalize to uppercase
      status = status.toUpperCase();
      const validStatuses = ['ACTIVE', 'UPCOMING', 'COMPLETED'];
      
      if (validStatuses.includes(status)) {
        where.status = status;
      }
      // If invalid status, just ignore it and return all
    }

    const [hackathons, total] = await Promise.all([
      prisma.hackathon.findMany({
        where,
        skip,
        take: limit,
        include: {
          _count: { select: { participants: true, teams: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.hackathon.count({ where }),
    ]);

    res.json({ 
      success: true, 
      data: { 
        hackathons, 
        total, 
        page, 
        totalPages: Math.ceil(total / limit) 
      } 
    });
  } catch (err) {
    console.error('❌ listHackathons error:', err);
    next(err);
  }
};

export const getHackathon = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const hackathon = await prisma.hackathon.findUnique({
      where: { id: req.params.id },
      include: {
        _count: { select: { participants: true, teams: true } },
        teams: { include: { members: { include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true } } } } } },
        leaderboards: { include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true } } }, orderBy: { rank: 'asc' }, take: 10 },
      },
    });
    if (!hackathon) return res.status(404).json({ success: false, error: 'Hackathon not found' });
    res.json({ success: true, data: hackathon });
  } catch (err) {
    next(err);
  }
};

export const createHackathon = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = hackathonSchema.parse(req.body);
    const hackathon = await prisma.hackathon.create({
      data: {
        title: data.title,
        description: data.description,
        status: data.status || 'UPCOMING',
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        image: data.image,
        maxParticipants: data.maxParticipants || 100,
        prizePool: data.prizePool,
      },
    });
    res.status(201).json({ success: true, data: hackathon });
  } catch (err: any) {
    if (err.name === 'ZodError') return res.status(400).json({ success: false, error: err.errors });
    next(err);
  }
};

export const updateHackathon = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = hackathonSchema.partial().parse(req.body);
    const updateData: any = { ...data };
    if (data.startDate) updateData.startDate = new Date(data.startDate);
    if (data.endDate) updateData.endDate = new Date(data.endDate);
    const hackathon = await prisma.hackathon.update({ where: { id: req.params.id }, data: updateData });
    res.json({ success: true, data: hackathon });
  } catch (err: any) {
    if (err.name === 'ZodError') return res.status(400).json({ success: false, error: err.errors });
    next(err);
  }
};

export const deleteHackathon = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await prisma.hackathon.delete({ where: { id: req.params.id } });
    res.json({ success: true, data: { message: 'Hackathon deleted' } });
  } catch (err) {
    next(err);
  }
};

export const joinHackathon = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const hackathon = await prisma.hackathon.findUnique({
      where: { id: req.params.id },
      include: { _count: { select: { participants: true } } },
    });
    if (!hackathon) return res.status(404).json({ success: false, error: 'Hackathon not found' });
    if (hackathon._count.participants >= (hackathon.maxParticipants || 100)) {
      return res.status(400).json({ success: false, error: 'Hackathon is full' });
    }
    const participant = await prisma.hackathonParticipant.create({
      data: { userId: req.user!.id, hackathonId: req.params.id },
    });
    await prisma.activity.create({
      data: {
        userId: req.user!.id,
        type: 'JOINED_HACKATHON',
        description: `Joined hackathon: ${hackathon.title}`,
      },
    });
    res.status(201).json({ success: true, data: participant });
  } catch (err: any) {
    if (err.code === 'P2002') return res.status(409).json({ success: false, error: 'Already joined' });
    next(err);
  }
};

export const leaveHackathon = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await prisma.hackathonParticipant.delete({
      where: {
        userId_hackathonId: {
          userId: req.user!.id,
          hackathonId: req.params.id,
        },
      },
    });
    res.json({ success: true, data: { message: 'Left hackathon' } });
  } catch (err) {
    next(err);
  }
};
