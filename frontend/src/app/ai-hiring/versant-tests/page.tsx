'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { FileCheck, TrendingUp, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { versantTestService } from '@/services/versantTest.service';

const TEST_TYPES = [
  { type: 'SENTENCE_COMPLETION',    name: 'Sentence Completion',    desc: 'Complete sentences to test grammar and vocabulary',            emoji: '✍️' },
  { type: 'PASSAGE_RECONSTRUCTION', name: 'Passage Reconstruction', desc: 'Reconstruct scrambled passages to assess reading comprehension', emoji: '📖' },
  { type: 'TYPING',                 name: 'Typing',                 desc: 'Assess typing speed and accuracy in English',                  emoji: '⌨️' },
  { type: 'SHORT_ANSWERS',          name: 'Short Answers',          desc: 'Answer questions in written English to evaluate fluency',       emoji: '📝' },
  { type: 'READING_ALOUD',          name: 'Reading Aloud',          desc: 'Read passages aloud to test pronunciation and fluency',         emoji: '🔊' },
  { type: 'REPEAT_SENTENCES',       name: 'Repeat Sentences',       desc: 'Repeat spoken sentences to test listening and retention',       emoji: '🔄' },
  { type: 'CONVERSATIONS',          name: 'Conversations',          desc: 'Simulated dialogues to assess conversational English ability',  emoji: '💬' },
  { type: 'DICTATION',              name: 'Dictation',              desc: 'Write down spoken words and sentences to evaluate listening accuracy', emoji: '👂' },
  { type: 'VOCABULARY',             name: 'Vocabulary',             desc: 'Assess breadth and depth of English vocabulary knowledge',     emoji: '🔤' },
  { type: 'STORYTELLING',           name: 'Storytelling',           desc: 'Narrate a story from prompts to test expressive language skills', emoji: '🎙️' },
];

const PROFICIENCY_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  BEGINNER:          { label: 'Beginner',          color: 'text-red-300',    bg: 'bg-red-500/15',    border: 'border-red-500/25'    },
  ELEMENTARY:        { label: 'Elementary',        color: 'text-orange-300', bg: 'bg-orange-500/15', border: 'border-orange-500/25' },
  INTERMEDIATE:      { label: 'Intermediate',      color: 'text-yellow-300', bg: 'bg-yellow-500/15', border: 'border-yellow-500/25' },
  UPPER_INTERMEDIATE:{ label: 'Upper Intermediate',color: 'text-blue-300',   bg: 'bg-blue-500/15',   border: 'border-blue-500/25'   },
  ADVANCED:          { label: 'Advanced',          color: 'text-purple-300', bg: 'bg-purple-500/15', border: 'border-purple-500/25' },
  PROFICIENT:        { label: 'Proficient',        color: 'text-emerald-300',bg: 'bg-emerald-500/15',border: 'border-emerald-500/25'},
};

function ProficiencyBadge({ level }: { level: string }) {
  const cfg = PROFICIENCY_CONFIG[level] ?? {
    label: level,
    color: 'text-gray-300',
    bg: 'bg-white/10',
    border: 'border-white/10',
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.border} ${cfg.color} border`}>
      {cfg.label}
    </span>
  );
}

export default function VersantTestsPage() {
  const router = useRouter();
  const qc = useQueryClient();

  const { data: myTests = [], isLoading } = useQuery({
    queryKey: ['versant-tests-my'],
    queryFn: () => versantTestService.getMyTests(),
  });

  const startMutation = useMutation({
    mutationFn: (testType: string) => versantTestService.startTest({ testType }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['versant-tests-my'] });
      toast.success('Test started!');
      router.push('/results');
    },
    onError: () => toast.error('Failed to start test'),
  });

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="page-hero">
        <div className="flex items-center gap-2 mb-1">
          <FileCheck className="w-5 h-5 text-emerald-400" />
          <h1 className="text-2xl font-bold text-white">Versant English Proficiency Tests</h1>
        </div>
        <p className="text-gray-400 text-sm">
          Assess and improve your English language skills across reading, writing, listening, and speaking
        </p>
      </div>

      {/* Track Progress Banner */}
      <div className="glass-card p-5 bg-gradient-to-r from-emerald-600/10 to-teal-600/10 border-emerald-500/20">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Track your Progress</h3>
              <p className="text-sm text-gray-400">
                View your proficiency scores and detailed test results
              </p>
            </div>
          </div>
          <button
            onClick={() => router.push('/results')}
            className="flex items-center gap-2 px-4 py-2 bg-white/8 hover:bg-white/12 rounded-xl text-sm text-gray-300 hover:text-white transition-all border border-white/8"
          >
            <TrendingUp className="w-4 h-4" />
            View Results
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Test Type Cards */}
      <div>
        <h2 className="text-base font-semibold text-white mb-4">Available Tests</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {TEST_TYPES.map(({ type, name, desc, emoji }) => {
            const isPending = startMutation.isPending && startMutation.variables === type;
            return (
              <div
                key={type}
                className="glass-card p-5 flex flex-col group hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-600/30 to-teal-600/30 border border-emerald-500/20 flex items-center justify-center text-2xl group-hover:scale-105 transition-transform duration-300">
                    {emoji}
                  </div>
                  <span className="text-[10px] px-2 py-0.5 bg-white/8 border border-white/10 rounded-full text-gray-400 flex-shrink-0">
                    15–20 min
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-white mb-1">{name}</h3>
                <p className="text-xs text-gray-400 flex-1 mb-4 leading-relaxed">{desc}</p>
                <button
                  onClick={() => startMutation.mutate(type)}
                  disabled={startMutation.isPending}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl px-4 py-2 text-xs font-medium hover:opacity-90 hover:-translate-y-0.5 transition-all disabled:opacity-50"
                >
                  {isPending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <ArrowRight className="w-3.5 h-3.5" />
                  )}
                  {isPending ? 'Starting…' : 'Start Test'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* My Tests */}
      <div>
        <h2 className="text-base font-semibold text-white mb-4">My Tests</h2>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 rounded-2xl bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : myTests.length === 0 ? (
          <div className="glass-card p-10 text-center">
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="w-6 h-6 text-gray-600" />
            </div>
            <p className="text-gray-400 font-medium">No tests completed yet</p>
            <p className="text-sm text-gray-600 mt-1">Start a test above to see your results here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {myTests.map((test: any) => {
              const id = test.id || test._id;
              const typeInfo = TEST_TYPES.find((t) => t.type === test.testType);
              return (
                <div
                  key={id}
                  className="glass-card p-4 flex items-center justify-between gap-4 hover:border-white/15 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/8 flex items-center justify-center text-xl flex-shrink-0">
                      {typeInfo?.emoji ?? '📋'}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {typeInfo?.name ?? test.testType}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {test.createdAt
                          ? new Date(test.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })
                          : '—'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {test.score != null && (
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Score</p>
                        <p className="text-base font-bold text-emerald-400">{test.score}%</p>
                      </div>
                    )}
                    {test.proficiencyLevel && (
                      <ProficiencyBadge level={test.proficiencyLevel} />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
