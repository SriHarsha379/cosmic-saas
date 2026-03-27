'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Wallet, Plus, ArrowUpRight, ArrowDownLeft, X, TrendingUp, TrendingDown } from 'lucide-react';
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
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-white">Add Funds</h2>
            <p className="text-xs text-gray-500 mt-0.5">Top up your wallet balance</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/8 rounded-lg text-gray-400 hover:text-white transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-2">Quick amounts</label>
            <div className="grid grid-cols-4 gap-2">
              {presets.map((p) => (
                <button
                  key={p}
                  onClick={() => setAmount(String(p))}
                  className={`py-2 rounded-xl border text-sm font-semibold transition-all ${
                    amount === String(p)
                      ? 'bg-purple-600/20 border-purple-500/50 text-purple-300 shadow-lg shadow-purple-500/10'
                      : 'bg-white/4 border-white/10 text-gray-400 hover:bg-white/8 hover:text-white'
                  }`}
                >
                  ${p}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-2">Custom amount</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
              <input
                type="number"
                min={1}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="cosmic-input pl-8"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-2">Note (optional)</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Monthly top-up"
              className="cosmic-input"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 rounded-xl text-sm transition-all">
            Cancel
          </button>
          <button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending || !amount || Number(amount) <= 0}
            className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-xl px-4 py-2.5 text-sm font-semibold disabled:opacity-40 transition-all"
          >
            {mutation.isPending ? 'Processing…' : 'Add Funds'}
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

  const txCredit = wallet?.transactions?.filter((t: Transaction) => t.type === 'credit') || [];
  const txDebit  = wallet?.transactions?.filter((t: Transaction) => t.type === 'debit')  || [];
  const totalIn  = txCredit.reduce((s: number, t: Transaction) => s + t.amount, 0);
  const totalOut = txDebit.reduce((s:  number, t: Transaction) => s + t.amount, 0);

  return (
    <div className="space-y-6 animate-slide-up">
      {showAddFunds && <AddFundsModal onClose={() => setShowAddFunds(false)} />}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Wallet</h1>
        <p className="text-sm text-gray-400">Manage your funds and transaction history</p>
      </div>

      {isLoading && <div className="flex justify-center py-12"><LoadingSpinner size="lg" /></div>}
      {error && <ErrorMessage message="Failed to load wallet" onRetry={refetch} />}

      {wallet && (
        <>
          {/* Balance + mini stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Main balance */}
            <div className="sm:col-span-2 glass-card p-6 bg-gradient-to-br from-purple-600/15 to-blue-600/8 border-purple-500/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-purple-600/10 -translate-y-1/3 translate-x-1/4 pointer-events-none" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
                    <Wallet className="w-4 h-4 text-purple-400" />
                  </div>
                  <p className="text-sm text-gray-400">Total Balance</p>
                </div>
                <p className="text-4xl font-bold text-white mt-3 tabular-nums">
                  ${wallet.balance.toFixed(2)}
                  <span className="text-base text-gray-500 font-normal ml-2">{wallet.currency || 'USD'}</span>
                </p>
                <button
                  onClick={() => setShowAddFunds(true)}
                  className="mt-4 flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-xl px-4 py-2.5 text-sm font-semibold transition-all hover:shadow-lg hover:shadow-purple-500/25"
                >
                  <Plus className="w-4 h-4" /> Add Funds
                </button>
              </div>
            </div>

            {/* In / Out */}
            <div className="flex flex-col gap-3">
              <div className="flex-1 glass-card p-4 border-emerald-500/15">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <p className="text-xs text-gray-500">Money In</p>
                </div>
                <p className="text-lg font-bold text-emerald-400 tabular-nums">+${totalIn.toFixed(2)}</p>
              </div>
              <div className="flex-1 glass-card p-4 border-red-500/15">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-lg bg-red-500/15 flex items-center justify-center">
                    <TrendingDown className="w-3.5 h-3.5 text-red-400" />
                  </div>
                  <p className="text-xs text-gray-500">Money Out</p>
                </div>
                <p className="text-lg font-bold text-red-400 tabular-nums">-${totalOut.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Transactions */}
          <div className="glass-card overflow-hidden">
            <div className="px-5 py-4 border-b border-white/8 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Transaction History</h3>
              {wallet.transactions?.length > 0 && (
                <span className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">
                  {wallet.transactions.length} transactions
                </span>
              )}
            </div>

            {!wallet.transactions || wallet.transactions.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No transactions yet</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {wallet.transactions.map((tx: Transaction) => (
                  <div key={tx._id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-white/3 transition-colors">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      tx.type === 'credit'
                        ? 'bg-emerald-500/12 border border-emerald-500/20'
                        : 'bg-red-500/12 border border-red-500/20'
                    }`}>
                      {tx.type === 'credit'
                        ? <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
                        : <ArrowUpRight className="w-4 h-4 text-red-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white font-medium truncate">{tx.description}</p>
                      <p className="text-xs text-gray-600 mt-0.5">
                        {new Date(tx.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={`text-sm font-bold tabular-nums ${tx.type === 'credit' ? 'text-emerald-400' : 'text-red-400'}`}>
                        {tx.type === 'credit' ? '+' : '-'}${tx.amount.toFixed(2)}
                      </p>
                      <span className={`text-xs capitalize ${
                        tx.status === 'completed' ? 'text-gray-500' : tx.status === 'pending' ? 'text-amber-400' : 'text-red-400'
                      }`}>{tx.status}</span>
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
