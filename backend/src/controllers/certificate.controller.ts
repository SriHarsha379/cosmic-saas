import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

export const listCertificates = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.params.userId || req.user!.id;
    const certificates = await prisma.certificate.findMany({
      where: { userId },
      include: { user: { select: { id: true, firstName: true, lastName: true } } },
      orderBy: { earnedAt: 'desc' },
    });
    res.json({ success: true, data: certificates });
  } catch (err) { next(err); }
};

export const getCertificate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const cert = await prisma.certificate.findUnique({
      where: { id: req.params.id },
      include: { user: { select: { id: true, firstName: true, lastName: true } } },
    });
    if (!cert) return res.status(404).json({ success: false, error: 'Certificate not found' });
    res.json({ success: true, data: cert });
  } catch (err) { next(err); }
};

export const issueCertificate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const schema = z.object({
      userId: z.string(),
      title: z.string().min(1),
      issuedBy: z.string().min(1),
      certificateUrl: z.string().optional(),
    });
    const data = schema.parse(req.body);
    const cert = await prisma.certificate.create({
      data: data as any,
      include: { user: { select: { id: true, firstName: true, lastName: true } } },
    });
    await prisma.activity.create({
      data: {
        userId: data.userId,
        type: 'EARNED_CERTIFICATE',
        description: `Received certificate: ${data.title}`,
      },
    });
    res.status(201).json({ success: true, data: cert });
  } catch (err: any) {
    if (err.name === 'ZodError') return res.status(400).json({ success: false, error: err.errors });
    next(err);
  }
};

export const deleteCertificate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await prisma.certificate.delete({ where: { id: req.params.id } });
    res.json({ success: true, data: { message: 'Certificate deleted' } });
  } catch (err) { next(err); }
};
