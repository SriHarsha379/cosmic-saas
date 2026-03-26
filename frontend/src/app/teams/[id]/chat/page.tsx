'use client';

import { use, useState, useEffect, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Send, ArrowLeft, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { chatService } from '@/services/chat.service';
import { useAuthStore } from '@/store/authStore';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { toast } from 'sonner';

export default function TeamChatPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const teamId = unwrappedParams?.id;
  const { user } = useAuthStore();
  
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: chatHistory = [], isLoading, refetch } = useQuery({
    queryKey: ['team-chat', teamId],
    queryFn: () => {
      console.log('🔍 Fetching chat for team:', teamId);
      return chatService.getTeamChat(teamId!);
    },
    enabled: !!teamId,
    refetchInterval: 2000,
  });

  const sendMutation = useMutation({
    mutationFn: (message: string) => {
      console.log('📤 Sending message:', message);
      return chatService.sendTeamMessage(teamId!, message);
    },
    onSuccess: (data) => {
      console.log('✅ Message sent:', data);
      setInput('');
      setTimeout(() => {
        refetch();
        toast.success('Message sent!');
      }, 500);
    },
    onError: (err: any) => {
      console.error('❌ Send error:', err);
      toast.error(err.response?.data?.error || 'Failed to send message');
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMutation.mutate(input);
  };

  if (!teamId) return <LoadingSpinner />;

  console.log('Messages:', chatHistory, 'User ID:', user?.id);

  return (
    <div className="flex flex-col h-screen bg-[#0A0E27]">
      <div className="border-b border-white/10 p-4 flex items-center gap-4 bg-white/5">
        <Link href="/teams" className="text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h2 className="text-lg font-bold text-white">Team Chat</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <LoadingSpinner />
          </div>
        ) : chatHistory && chatHistory.length > 0 ? (
          chatHistory.map((msg: any) => {
            const isOwn = msg.userId === user?.id;
            const senderName = msg.senderName || 'Unknown';
            
            console.log('Rendering message:', { isOwn, userId: msg.userId, userIdFromStore: user?.id, senderName });

            return (
              <div
                key={msg.id}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2`}
              >
                <div
                  className={`max-w-xs lg:max-w-md rounded-lg px-4 py-3 ${
                    isOwn
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                      : 'bg-white/10 text-gray-200'
                  }`}
                >
                  {!isOwn && (
                    <p className="text-xs text-gray-300 mb-1 font-semibold">{senderName}</p>
                  )}
                  <p className="break-words">{msg.message}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <MessageCircle className="w-12 h-12 mb-3 opacity-50" />
            <p>No messages yet. Start the conversation!</p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="border-t border-white/10 p-4 bg-white/5 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-all"
          disabled={sendMutation.isPending}
        />
        <button
          type="submit"
          disabled={!input.trim() || sendMutation.isPending}
          className="p-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg disabled:opacity-50 transition-all"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}
