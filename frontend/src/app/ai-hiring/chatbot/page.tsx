'use client';

import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { MessageSquare, Send, Plus, Bot, Code2, Brain, Loader2 } from 'lucide-react';
import { chatbotService } from '@/services/chatbot.service';

type ChatMode = 'CODE' | 'APTITUDE';

export default function ChatbotPage() {
  const qc = useQueryClient();
  const [activeChat, setActiveChat] = useState<any>(null);
  const [mode, setMode] = useState<ChatMode>('CODE');
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: chats = [], isLoading: chatsLoading } = useQuery({
    queryKey: ['chatbot-chats'],
    queryFn: () => chatbotService.listChats(),
  });

  const { data: activeChatData, isLoading: chatLoading } = useQuery({
    queryKey: ['chatbot-chat', activeChat?.id || activeChat?._id],
    queryFn: () => chatbotService.getChat(activeChat?.id || activeChat?._id),
    enabled: !!(activeChat?.id || activeChat?._id),
  });

  const createChatMutation = useMutation({
    mutationFn: (data: { type: string; title?: string }) => chatbotService.createChat(data),
    onSuccess: (newChat) => {
      qc.invalidateQueries({ queryKey: ['chatbot-chats'] });
      setActiveChat(newChat);
    },
    onError: () => toast.error('Failed to create chat'),
  });

  const sendMessageMutation = useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) =>
      chatbotService.sendMessage(id, content),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['chatbot-chat', activeChat?.id || activeChat?._id] });
      setInput('');
    },
    onError: () => toast.error('Failed to send message'),
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChatData?.messages]);

  const handleNewChat = () => {
    createChatMutation.mutate({ type: mode, title: `${mode === 'CODE' ? 'Code' : 'Aptitude'} Chat` });
  };

  const handleStartChat = (chatMode: ChatMode) => {
    setMode(chatMode);
    createChatMutation.mutate({ type: chatMode, title: `${chatMode === 'CODE' ? 'Code' : 'Aptitude'} Chat` });
  };

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || !activeChat) return;
    const id = activeChat.id || activeChat._id;
    sendMessageMutation.mutate({ id, content: trimmed });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const messages: any[] = activeChatData?.messages ?? [];

  return (
    <div className="animate-slide-up flex flex-col h-[calc(100vh-2rem)] gap-0">
      {/* Header */}
      <div className="page-hero mb-4 flex-shrink-0">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-purple-400" />
            <div>
              <h1 className="text-2xl font-bold text-white">AI Chatbot</h1>
              <p className="text-gray-400 text-sm">Get help with coding challenges and aptitude questions</p>
            </div>
          </div>
          {/* Mode toggle */}
          <div className="flex items-center gap-1 p-1 bg-white/5 border border-white/10 rounded-xl">
            {(['CODE', 'APTITUDE'] as ChatMode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  mode === m
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {m === 'CODE' ? <Code2 className="w-3.5 h-3.5" /> : <Brain className="w-3.5 h-3.5" />}
                {m}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex gap-4 flex-1 min-h-0">
        {/* Sidebar: chat history */}
        <div className="w-64 flex-shrink-0 flex flex-col gap-3">
          <button
            onClick={handleNewChat}
            disabled={createChatMutation.isPending}
            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl text-sm font-medium hover:opacity-90 transition-all disabled:opacity-50"
          >
            {createChatMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            New Chat
          </button>

          <div className="glass-card p-3 flex-1 overflow-y-auto min-h-0 space-y-1">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-2 px-1">
              Recent Chats
            </p>
            {chatsLoading ? (
              <div className="space-y-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-12 rounded-lg bg-white/5 animate-pulse" />
                ))}
              </div>
            ) : chats.length === 0 ? (
              <p className="text-xs text-gray-600 text-center py-6">No chats yet</p>
            ) : (
              chats.map((chat: any) => {
                const chatId = chat.id || chat._id;
                const isActive = (activeChat?.id || activeChat?._id) === chatId;
                return (
                  <button
                    key={chatId}
                    onClick={() => setActiveChat(chat)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-all text-xs ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-600/30 to-purple-600/30 border border-blue-500/30 text-white'
                        : 'text-gray-400 hover:bg-white/6 hover:text-white'
                    }`}
                  >
                    <p className="font-medium truncate">{chat.title || `Chat #${chatId?.slice(-6)}`}</p>
                    <p className="text-gray-600 mt-0.5 capitalize">{chat.type?.toLowerCase()}</p>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Main chat area */}
        <div className="flex-1 flex flex-col min-w-0 glass-card overflow-hidden">
          {!activeChat ? (
            /* Welcome / start screen */
            <div className="flex-1 flex flex-col items-center justify-center p-8 gap-6">
              <div className="text-center mb-2">
                <Bot className="w-12 h-12 text-purple-400 mx-auto mb-3" />
                <h2 className="text-xl font-bold text-white">Start a Conversation</h2>
                <p className="text-gray-400 text-sm mt-1">Choose a chatbot mode to begin</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg">
                {/* Code card */}
                <button
                  onClick={() => handleStartChat('CODE')}
                  disabled={createChatMutation.isPending}
                  className="glass-card p-5 text-left hover:-translate-y-1 transition-all duration-300 border-blue-500/20 hover:border-blue-500/40 group disabled:opacity-50"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <Code2 className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-sm font-semibold text-white">Code Chatbot</h3>
                  <p className="text-xs text-gray-400 mt-1">
                    Get help with algorithms, debugging, and software engineering concepts
                  </p>
                </button>
                {/* Aptitude card */}
                <button
                  onClick={() => handleStartChat('APTITUDE')}
                  disabled={createChatMutation.isPending}
                  className="glass-card p-5 text-left hover:-translate-y-1 transition-all duration-300 border-purple-500/20 hover:border-purple-500/40 group disabled:opacity-50"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-sm font-semibold text-white">Aptitude Chatbot</h3>
                  <p className="text-xs text-gray-400 mt-1">
                    Practice quantitative aptitude, logical reasoning, and verbal ability
                  </p>
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Messages list */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {chatLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className={`flex gap-3 ${i % 2 === 0 ? '' : 'flex-row-reverse'}`}
                      >
                        <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse flex-shrink-0" />
                        <div
                          className={`h-10 rounded-2xl bg-white/5 animate-pulse ${
                            i % 2 === 0 ? 'w-64' : 'w-48'
                          }`}
                        />
                      </div>
                    ))}
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center mb-3">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-gray-400 text-sm">Chat started! Ask anything to begin.</p>
                  </div>
                ) : (
                  messages.map((msg: any, idx: number) => {
                    const isUser = msg.role === 'user';
                    return (
                      <div
                        key={idx}
                        className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
                      >
                        {!isUser && (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center flex-shrink-0">
                            <span className="text-[10px] font-bold text-white">AI</span>
                          </div>
                        )}
                        <div
                          className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                            isUser
                              ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-tr-sm'
                              : 'glass-card text-gray-200 rounded-tl-sm'
                          }`}
                        >
                          {msg.content}
                        </div>
                      </div>
                    );
                  })
                )}
                {sendMessageMutation.isPending && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center flex-shrink-0">
                      <span className="text-[10px] font-bold text-white">AI</span>
                    </div>
                    <div className="glass-card px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-2">
                      <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                      <span className="text-xs text-gray-400">Thinking…</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input bar */}
              <div className="flex-shrink-0 p-4 border-t border-white/8">
                <div className="flex gap-3">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your message… (Enter to send)"
                    rows={1}
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 resize-none focus:outline-none focus:border-blue-500/50 focus:bg-white/8 transition-all"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim() || sendMessageMutation.isPending}
                    className="flex-shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center hover:opacity-90 transition-all disabled:opacity-40 self-end"
                  >
                    <Send className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
