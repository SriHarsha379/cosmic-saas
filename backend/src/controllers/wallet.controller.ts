import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

export const getWallet = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const wallet = await prisma.wallet.findUnique({ where: { userId: req.user!.id } });
    if (!wallet) return res.status(404).json({ success: false, error: 'Wallet not found' });
    res.json({ success: true, data: wallet });
  } catch (err) { next(err); }
};

export const addFunds = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const schema = z.object({ amount: z.number().positive(), description: z.string().optional() });
    const { amount, description } = schema.parse(req.body);

    const result = await prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({ where: { userId: req.user!.id } });
      if (!wallet) throw new Error('Wallet not found');
      const balanceBefore = wallet.balance;
      const balanceAfter = balanceBefore + amount;
      const updatedWallet = await tx.wallet.update({
        where: { userId: req.user!.id },
        data: { balance: balanceAfter },
      });
      const transaction = await tx.transaction.create({
        data: {
          userId: req.user!.id,
          type: 'CREDIT',
          amount,
          description: description || 'Funds added',
          balanceBefore,
          balanceAfter,
        },
      });
      return { wallet: updatedWallet, transaction };
    });

    res.json({ success: true, data: result });
  } catch (err: any) {
    if (err.name === 'ZodError') return res.status(400).json({ success: false, error: err.errors });
    next(err);
  }
};

export const deductFunds = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const schema = z.object({ amount: z.number().positive(), description: z.string().optional() });
    const { amount, description } = schema.parse(req.body);

    const result = await prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({ where: { userId: req.user!.id } });
      if (!wallet) throw new Error('Wallet not found');
      if (wallet.balance < amount) throw new Error('Insufficient balance');
      const balanceBefore = wallet.balance;
      const balanceAfter = balanceBefore - amount;
      const updatedWallet = await tx.wallet.update({
        where: { userId: req.user!.id },
        data: { balance: balanceAfter },
      });
      const transaction = await tx.transaction.create({
        data: {
          userId: req.user!.id,
          type: 'DEBIT',
          amount,
          description: description || 'Funds deducted',
          balanceBefore,
          balanceAfter,
        },
      });
      return { wallet: updatedWallet, transaction };
    });

    res.json({ success: true, data: result });
  } catch (err: any) {
    if (err.name === 'ZodError') return res.status(400).json({ success: false, error: err.errors });
    if (err.message === 'Insufficient balance') return res.status(400).json({ success: false, error: err.message });
    next(err);
  }
};

export const getTransactions = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where: { userId: req.user!.id },
        orderBy: { timestamp: 'desc' },
        skip, take: limit,
      }),
      prisma.transaction.count({ where: { userId: req.user!.id } }),
    ]);
    res.json({ success: true, data: { transactions, total, page, totalPages: Math.ceil(total / limit) } });
  } catch (err) { next(err); }
};
