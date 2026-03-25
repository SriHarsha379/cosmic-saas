'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Wallet, Plus, ArrowUpRight, ArrowDownLeft, X } from 'lucide-react';
import { toast } from 'sonner';
import { walletService } from '@/services/wallet.service';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';
import type { Transaction } from '@/types';

function AddFundsModal({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  const mutation = useMutation({
    mutationFn: () => walletService.addFunds(Number(amount), description),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wallet'] });
      toast.success(`$${amount} added to wallet!`);
      onClose();
    },
    onError: () => toast.error('Failed to add funds'),
  });

  const presets = [10, 25, 50, 100];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#0E1330] border border-white/10 rounded-2xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-white">Add Funds</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-2">Quick amounts</label>
            <div className="grid grid-cols-4 gap-2">
              {presets.map((p) => (
                <button
                  key={p}
                  onClick={() => setAmount(String(p))}
                  className={`py-2 rounded-xl border text-sm font-medium transition-all ${
                    amount === String(p)
                      ? 'bg-purple-600/20 border-purple-500/50 text-purple-300'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/8'
                  }`}
                >
                  ${p}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1.5">Custom amount</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
              <input
                type="number"
                min={1}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-7 pr-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1.5">Description (optional)</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Top up"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 text-sm"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 rounded-xl text-sm">Cancel</button>
          <button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending || !amount || Number(amount) <= 0}
            className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl px-4 py-2.5 text-sm font-medium disabled:opacity-50"
          >
            {mutation.isPending ? 'Processing...' : 'Add Funds'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function WalletPage() {
  const [showAddFunds, setShowAddFunds] = useState(false);

  const { data: wallet, isLoading, error, refetch } = useQuery({
    queryKey: ['wallet'],
    queryFn: walletService.get,
  });

  return (
    <div className="space-y-6 animate-slide-up">
      {showAddFunds && <AddFundsModal onClose={() => setShowAddFunds(false)} />}

      <div>
        <h2 className="text-xl font-bold text-white">Wallet</h2>
        <p className="text-sm text-gray-400 mt-0.5">Manage your funds and transactions</p>
      </div>

      {isLoading && <div className="flex justify-center py-12"><LoadingSpinner size="lg" /></div>}
      {error && <ErrorMessage message="Failed to load wallet" onRetry={refetch} />}

      {wallet && (
        <>
          {/* Balance Card */}
          <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/10 border border-purple-500/20 rounded-2xl p-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-2">Total Balance</p>
                <p className="text-4xl font-bold text-white">
                  ${wallet.balance.toFixed(2)}
                  <span className="text-lg text-gray-400 ml-2 font-normal">{wallet.currency}</span>
                </p>
              </div>
              <div className="p-4 bg-purple-500/20 border border-purple-500/30 rounded-2xl">
                <Wallet className="w-8 h-8 text-purple-400" />
              </div>
            </div>

            <button
              onClick={() => setShowAddFunds(true)}
              className="mt-6 flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl px-5 py-2.5 text-sm font-medium transition-all duration-300"
            >
              <Plus className="w-4 h-4" /> Add Funds
            </button>
          </div>

          {/* Transactions */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/10">
              <h3 className="text-base font-semibold text-white">Transaction History</h3>
            </div>
            {!wallet.transactions || wallet.transactions.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400">No transactions yet</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {wallet.transactions.map((tx: Transaction) => (
                  <div key={tx._id} className="flex items-center gap-4 px-6 py-4 hover:bg-white/3 transition-colors">
                    <div className={`p-2.5 rounded-xl flex-shrink-0 ${
                      tx.type === 'credit'
                        ? 'bg-emerald-500/10 border border-emerald-500/20'
                        : 'bg-red-500/10 border border-red-500/20'
                    }`}>
                      {tx.type === 'credit'
                        ? <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
                        : <ArrowUpRight className="w-4 h-4 text-red-400" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white">{tx.description}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{new Date(tx.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={`text-sm font-semibold ${tx.type === 'credit' ? 'text-emerald-400' : 'text-red-400'}`}>
                        {tx.type === 'credit' ? '+' : '-'}${tx.amount.toFixed(2)}
                      </p>
                      <span className={`text-xs capitalize ${
                        tx.status === 'completed' ? 'text-gray-400' : tx.status === 'pending' ? 'text-amber-400' : 'text-red-400'
                      }`}>
                        {tx.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
