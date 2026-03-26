'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, Trash2, Search, ShieldCheck, UserCog } from 'lucide-react';
import { toast } from 'sonner';
import { userService } from '@/services/user.service';
import { useAuthStore } from '@/store/authStore';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';

export default function AdminUsersPage() {
  const qc = useQueryClient();
  const { user: currentUser } = useAuthStore();
  const [search, setSearch] = useState('');

  const { data: rawData = [], isLoading, error, refetch } = useQuery({
    queryKey: ['admin-users-list'],
    queryFn: () => userService.listUsers(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => userService.deleteUser(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-users-list'] });
      toast.success('User deleted successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Failed to delete user');
    },
  });

  const users = Array.isArray(rawData) ? rawData : [];

  const filtered = users.filter(
    (u: any) =>
      u.firstName?.toLowerCase().includes(search.toLowerCase()) ||
      u.lastName?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (id: string, name: string) => {
    if (id === currentUser?.id) {
      toast.error("You can't delete your own account");
      return;
    }
    if (window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Manage Users</h1>
          <p className="text-gray-400 text-sm mt-1">
            View and manage all registered users
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg">
          <Users className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-300">{users.length} users total</span>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-4 py-2">
        <Search className="w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-transparent text-white placeholder-gray-500 outline-none text-sm flex-1"
        />
      </div>

      {isLoading && (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      )}
      {error && <ErrorMessage message="Failed to load users" onRetry={refetch} />}

      {!isLoading && !error && (
        <>
          {filtered.length === 0 ? (
            <div className="text-center py-16 bg-white/5 border border-white/10 rounded-2xl">
              <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No users found</p>
            </div>
          ) : (
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        User
                      </th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Joined
                      </th>
                      <th className="text-right px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filtered.map((u: any) => {
                      const isSelf = u.id === currentUser?.id;
                      return (
                        <tr key={u.id} className="hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                                {u.firstName?.charAt(0).toUpperCase() || 'U'}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-white">
                                  {u.firstName} {u.lastName}
                                  {isSelf && (
                                    <span className="ml-2 text-xs text-purple-400">(you)</span>
                                  )}
                                </p>
                                <p className="text-xs text-gray-500">{u.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {u.role === 'ADMIN' ? (
                              <div className="flex items-center gap-1.5">
                                <ShieldCheck className="w-4 h-4 text-amber-400" />
                                <span className="text-sm text-amber-300 font-medium">Admin</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5">
                                <UserCog className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-300">User</span>
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-gray-400">
                              {u.createdAt
                                ? new Date(u.createdAt).toLocaleDateString()
                                : '—'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end">
                              <button
                                onClick={() =>
                                  handleDelete(u.id, `${u.firstName} ${u.lastName}`)
                                }
                                disabled={deleteMutation.isPending || isSelf || u.role === 'ADMIN'}
                                className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                title={
                                  isSelf
                                    ? "Can't delete yourself"
                                    : u.role === 'ADMIN'
                                    ? "Can't delete admin"
                                    : 'Delete user'
                                }
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
