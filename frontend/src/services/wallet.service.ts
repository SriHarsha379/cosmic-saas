import api from '@/lib/api';
import type { Wallet } from '@/types';

export const walletService = {
  get: async (): Promise<Wallet> => {
    const res = await api.get('/wallet');
    return res.data.data;
  },

  addFunds: async (amount: number, description?: string): Promise<Wallet> => {
    const res = await api.post('/wallet/add-funds', { amount, description });
    return res.data.data;
  },

  withdraw: async (amount: number, description?: string): Promise<Wallet> => {
    const res = await api.post('/wallet/withdraw', { amount, description });
    return res.data.data;
  },

  getTransactions: async () => {
    const res = await api.get('/wallet/transactions');
    return res.data.data;
  },
};
